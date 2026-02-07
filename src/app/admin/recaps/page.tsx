'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderLinkButton } from '@/components/ui/HeaderButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ADMIN_ROLES } from '@/lib/constants'
import { formatDateForAPI } from '@/lib/format'

type Recap = {
  id: string
  date: string
  contenu: string
  createdAt: string
}

export default function RecapsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const logout = useLogout()
  const [recaps, setRecaps] = useState<Recap[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentRecap, setCurrentRecap] = useState<Recap | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [generating, setGenerating] = useState(false)
  const [generateMessage, setGenerateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (user && !ADMIN_ROLES.includes(user.role)) {
      alert('⛔ Accès réservé aux CPE, Managers et Superadmins')
      router.push('/appel')
      return
    }

    if (user) {
      loadRecaps()
    }
  }, [user, authLoading, router])

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
    setGenerateMessage(null)

    try {
      const response = await fetch('/api/admin/recaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      })

      const data = await response.json()

      if (data.success) {
        setGenerateMessage({
          type: 'success',
          text: `✅ Récap généré avec succès ! (${data.observationsCount} observation(s) traitée(s))`,
        })
        // Recharger le récap et la liste
        await Promise.all([loadRecapForDate(targetDate), loadRecaps()])
      } else {
        setGenerateMessage({
          type: 'error',
          text: `❌ ${data.error || 'Erreur lors de la génération'}`,
        })
      }
    } catch (error) {
      console.error('Erreur génération récap:', error)
      setGenerateMessage({
        type: 'error',
        text: '❌ Erreur de connexion',
      })
    } finally {
      setGenerating(false)
      // Effacer le message après 5 secondes
      setTimeout(() => setGenerateMessage(null), 5000)
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

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  const daysInMonth = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title={`${user.prenom} • Consultation des récaps`}
        subtitle="📝 Récaps de la semaine"
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
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 capitalize">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  ← Précédent
                </button>
                <button
                  onClick={goToNextMonth}
                  className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Suivant →
                </button>
              </div>
            </div>

            {/* Calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
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
                    className={`relative p-2 text-center text-sm transition-all ${
                      selected
                        ? 'bg-[#0C71C3] text-white font-bold'
                        : today
                          ? 'bg-blue-100 font-bold text-[#0C71C3]'
                          : hasRecap
                            ? 'bg-green-50 text-green-700 font-medium hover:bg-green-100'
                            : 'text-gray-700 hover:bg-gray-100'
                    } rounded-md cursor-pointer`}
                  >
                    {date.getDate()}
                    {hasRecap && !selected && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-blue-100"></div>
                <span>Aujourd&apos;hui</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-green-50 border border-green-200"></div>
                <span>Récap disponible</span>
              </div>
            </div>
          </div>

          {/* Récap du jour sélectionné */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Récap du {formatDate(selectedDate.toISOString())}
            </h2>

            {/* Message de génération */}
            {generateMessage && (
              <div
                className={`mb-4 rounded-md p-4 ${
                  generateMessage.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {generateMessage.text}
              </div>
            )}

            {currentRecap ? (
              <div>
                <div className="mb-4 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-700">
                  {currentRecap.contenu}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Généré le {new Date(currentRecap.createdAt).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(currentRecap.createdAt).toLocaleTimeString('fr-FR')}
                  </p>
                  <button
                    onClick={() => handleGenerateRecap(selectedDate)}
                    disabled={generating}
                    className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: '#4d8dc1' }}
                  >
                    {generating ? '⏳ Regénération...' : '🔄 Régénérer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4 text-gray-500">Aucun récap disponible pour cette date</p>
                <button
                  onClick={() => handleGenerateRecap(selectedDate)}
                  disabled={generating}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#4d8dc1' }}
                >
                  {generating ? '⏳ Génération en cours...' : '🤖 Générer un récap IA'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
