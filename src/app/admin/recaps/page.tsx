'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

type Recap = {
  id: string
  date: string
  contenu: string
  createdAt: string
}

export default function RecapsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const [recaps, setRecaps] = useState<Recap[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentRecap, setCurrentRecap] = useState<Recap | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (authLoading) return

    if (user && user.role !== 'superadmin') {
      alert('⛔ Accès réservé aux superadmins')
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

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0]
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  const daysInMonth = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-lg" style={{ background: 'linear-gradient(to right, #4d8dc1, #0C71C3)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="mb-2 inline-block text-sm text-white/80 hover:text-white"
              >
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">📅 Récapitulatifs quotidiens</h1>
              <p className="mt-1 text-sm text-white/80">
                {recaps.length} récap(s) généré(s) • Navigation par calendrier
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Calendrier */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={goToPreviousMonth}
                  className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                >
                  ←
                </button>
                <h2 className="text-lg font-semibold capitalize text-gray-900">{monthName}</h2>
                <button
                  onClick={goToNextMonth}
                  className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                >
                  →
                </button>
              </div>

              {/* Jours de la semaine */}
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600">
                <div>L</div>
                <div>M</div>
                <div>M</div>
                <div>J</div>
                <div>V</div>
                <div>S</div>
                <div>D</div>
              </div>

              {/* Jours du mois */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const hasRecap = hasRecapForDate(date)
                  const isTodayDate = isToday(date)
                  const isSelected = isSelectedDate(date)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square rounded-md text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isTodayDate
                          ? 'bg-blue-100 text-blue-900'
                          : hasRecap
                          ? 'bg-green-50 text-green-900 hover:bg-green-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${hasRecap && !isSelected ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-md bg-green-50 ring-2 ring-green-400 ring-opacity-50"></div>
                  <span>Récap disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-md bg-blue-100"></div>
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* Récap du jour sélectionné */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-8 shadow">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {formatDate(selectedDate.toISOString())}
              </h2>

              {currentRecap ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">{currentRecap.contenu}</div>
                  <div className="mt-6 border-t pt-4 text-sm text-gray-500">
                    Généré le {new Date(currentRecap.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 text-6xl">📭</div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Aucun récapitulatif pour cette date
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Le récap est généré automatiquement chaque matin à 6h s'il y a des observations.
                  </p>
                  <div className="rounded-md p-4 text-left" style={{ backgroundColor: '#e2e5ed' }}>
                    <p className="text-sm font-semibold" style={{ color: '#0C71C3' }}>
                      💡 Génération automatique
                    </p>
                    <ul className="ml-4 mt-2 list-disc text-sm" style={{ color: '#333333' }}>
                      <li>Cron job configuré pour 6h du matin</li>
                      <li>Résumé IA des observations de la veille</li>
                      <li>Structuré par niveau avec points d'attention</li>
                      <li>Visible uniquement s'il y a des observations</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
