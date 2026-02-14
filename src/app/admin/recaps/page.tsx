'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderLinkButton } from '@/components/ui/HeaderButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ADMIN_ROLES } from '@/lib/constants'
import { formatDateForAPI } from '@/lib/format'
import { exportRecapToPDF } from '@/lib/pdf-export'
import { Download, RotateCw, Loader2, FileText } from '@/lib/icons'

type Recap = {
  id: string
  date: string
  contenu: string
  createdAt: string
}

export default function RecapsPage() {
  useScrollToTop()
  const router = useRouter()
  const toast = useToast()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const logout = useLogout()
  const [recaps, setRecaps] = useState<Recap[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentRecap, setCurrentRecap] = useState<Recap | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (user && !ADMIN_ROLES.includes(user.role)) {
      toast.error('Accès réservé aux CPE, Managers et Superadmins')
      router.push('/appel')
      return
    }

    if (user) {
      loadRecaps()
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    // Charger le récap du jour sélectionné
    loadRecapForDate(selectedDate)
  }, [selectedDate])

  const loadRecaps = async () => {
    try {
      const response = await fetch('/api/admin/recaps')
      const data = await response.json()

      if (data.success) {
        setRecaps(data.recaps)
      }
    } catch (error) {
      console.error('Erreur chargement récaps:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecapForDate = async (date: Date) => {
    try {
      const dateStr = formatDateForAPI(date)
      const response = await fetch(`/api/admin/recaps?date=${dateStr}`)
      const data = await response.json()

      if (data.success && data.recap) {
        setCurrentRecap(data.recap)
      } else {
        setCurrentRecap(null)
      }
    } catch (error) {
      console.error('Erreur chargement récap:', error)
      setCurrentRecap(null)
    }
  }

  const handleGenerateRecap = async (date?: Date) => {
    const targetDate = date || selectedDate
    const dateStr = formatDateForAPI(targetDate)

    if (!confirm(`Générer un récap IA pour le ${formatDate(targetDate.toISOString())} ?`)) {
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/admin/recaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          `Récap généré avec succès ! (${data.observationsCount} observation(s) traitée(s))`,
          6000 // Durée plus longue pour laisser le temps de lire
        )
        // Recharger le récap et la liste
        await Promise.all([loadRecapForDate(targetDate), loadRecaps()])
      } else {
        toast.error(data.error || 'Erreur lors de la génération')
      }
    } catch (error) {
      console.error('Erreur génération récap:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setGenerating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Jours vides avant le 1er du mois
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null)
    }
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const hasRecapForDate = (date: Date) => {
    const dateStr = formatDateForAPI(date)
    return recaps.some((r) => r.date.split('T')[0] === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelectedDate = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleExportPDF = () => {
    if (!currentRecap) {
      toast.error('Aucun récap à exporter')
      return
    }

    setExporting(true)
    try {
      exportRecapToPDF(currentRecap)
      toast.success('PDF téléchargé avec succès !')
    } catch (error) {
      console.error('Erreur export PDF:', error)
      toast.error('Erreur lors de l\'export PDF')
    } finally {
      setExporting(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  const daysInMonth = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <AdminHeader
        title={`${user.prenom} ${user.nom} • Consultation des récaps`}
        subtitle="Récapitulatifs quotidiens"
        variant="blue"
        actions={
          <HeaderLinkButton href="/admin/dashboard">
            Retour
          </HeaderLinkButton>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Calendrier */}
          <div
            className="p-6"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="text-lg capitalize"
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 'var(--font-semibold)',
                }}
              >
                {monthName}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  ← Précédent
                </button>
                <button
                  onClick={goToNextMonth}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  Suivant →
                </button>
              </div>
            </div>

            {/* Calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-xs font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {day}
                </div>
              ))}
              {daysInMonth.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="p-2" />
                }

                const hasRecap = hasRecapForDate(date)
                const selected = isSelectedDate(date)
                const today = isToday(date)

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className="relative p-2 text-center text-sm transition-all cursor-pointer"
                    style={{
                      backgroundColor: selected
                        ? 'var(--institutional)'
                        : today
                        ? 'var(--institutional-light)'
                        : hasRecap
                        ? 'var(--success-light)'
                        : 'transparent',
                      color: selected
                        ? 'var(--text-inverse)'
                        : today || hasRecap
                        ? selected ? 'var(--text-inverse)' : today ? 'var(--institutional)' : 'var(--success)'
                        : 'var(--text-primary)',
                      fontWeight: selected || today ? 'var(--font-bold)' : hasRecap ? 'var(--font-medium)' : 'var(--font-normal)',
                      borderRadius: 'var(--radius-sm)',
                      border: hasRecap && !selected ? '1px solid var(--success-border)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = hasRecap
                          ? 'var(--success-light)'
                          : 'var(--control-bg-hover)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = today
                          ? 'var(--institutional-light)'
                          : hasRecap
                          ? 'var(--success-light)'
                          : 'transparent'
                      }
                    }}
                  >
                    {date.getDate()}
                    {hasRecap && !selected && (
                      <span
                        className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--success)' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div
              className="mt-4 flex items-center gap-4 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: 'var(--institutional-light)' }}
                />
                <span>Aujourd&apos;hui</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded"
                  style={{
                    backgroundColor: 'var(--success-light)',
                    border: '1px solid var(--success-border)',
                  }}
                />
                <span>Récap disponible</span>
              </div>
            </div>
          </div>

          {/* Récap du jour sélectionné */}
          <div
            className="p-6"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h2
              className="mb-4 text-lg"
              style={{
                color: 'var(--text-primary)',
                fontWeight: 'var(--font-semibold)',
              }}
            >
              Récap du {formatDate(selectedDate.toISOString())}
            </h2>

            {currentRecap ? (
              <div>
                {/* Contenu du récap avec style registre */}
                <div
                  className="mb-4"
                  style={{
                    backgroundColor: 'var(--surface-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {/* Affichage structuré du récap */}
                  <div
                    className="whitespace-pre-wrap p-4 text-sm leading-relaxed"
                    style={{
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {currentRecap.contenu.split('\n').map((line, index) => {
                      // Identifier les lignes spéciales pour styling
                      const isMainTitle = line.startsWith('📊')
                      const isLevelTitle = line.startsWith('🎓')
                      const isWarning = line.includes('⚠️')
                      const isPositive = line.includes('✅') || line.includes('🟢')
                      const isAbsent = line.includes('Absents')
                      const isEmpty = line.trim() === ''

                      if (isEmpty) {
                        return <div key={index} style={{ height: '8px' }} />
                      }

                      // Calculer le paddingLeft en fonction des conditions
                      const getPaddingLeft = () => {
                        if (isWarning || isAbsent || isPositive) return 'var(--space-md)'
                        if (line.startsWith('  ')) return 'var(--space-lg)'
                        if (line.startsWith('•')) return 'var(--space-md)'
                        return '0'
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            marginBottom: isMainTitle || isLevelTitle ? 'var(--space-sm)' : '4px',
                            paddingLeft: getPaddingLeft(),
                            fontWeight: isMainTitle || isLevelTitle ? 'var(--font-semibold)' : 'var(--font-normal)',
                            color: isMainTitle
                              ? 'var(--text-primary)'
                              : isLevelTitle
                              ? 'var(--institutional)'
                              : isWarning || isAbsent
                              ? 'var(--warning)'
                              : isPositive
                              ? 'var(--success)'
                              : 'var(--text-secondary)',
                            fontSize: isMainTitle || isLevelTitle ? 'var(--text-base)' : 'var(--text-sm)',
                            borderLeft: isWarning || isAbsent ? '3px solid var(--warning-light)' : isPositive ? '3px solid var(--success-light)' : 'none',
                          }}
                        >
                          {line || '\u00A0'}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Footer avec métadonnées et actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Généré le {new Date(currentRecap.createdAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(currentRecap.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                      style={{
                        backgroundColor: exporting ? 'var(--border-emphasis)' : undefined,
                        cursor: exporting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Export...
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          Télécharger PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleGenerateRecap(selectedDate)}
                      disabled={generating}
                      className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                      style={{
                        opacity: generating ? 0.6 : 1,
                        cursor: generating ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Regénération...
                        </>
                      ) : (
                        <>
                          <RotateCw className="h-3.5 w-3.5" />
                          Régénérer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p
                  className="mb-4"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Aucun récap disponible pour cette date
                </p>
                <button
                  onClick={() => handleGenerateRecap(selectedDate)}
                  disabled={generating}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                  style={{ margin: '0 auto' }}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Générer un récap IA
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
