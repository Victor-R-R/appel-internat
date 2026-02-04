'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type User = {
  id: string
  role: string
}

type Recap = {
  id: string
  date: string
  niveau: string
  contenu: string
  createdAt: string
}

export default function RecapsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [recaps, setRecaps] = useState<Recap[]>([])
  const [loading, setLoading] = useState(true)
  const [filterNiveau, setFilterNiveau] = useState<string>('tous')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    if (userData.role !== 'superadmin') {
      alert('⛔ Accès réservé aux superadmins')
      router.push('/appel')
      return
    }

    setUser(userData)
    loadRecaps()
  }, [router])

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Filtrage
  const recapsFiltered = recaps.filter((r) => {
    if (filterNiveau !== 'tous' && r.niveau !== filterNiveau) return false
    return true
  })

  // Grouper par date
  const recapsByDate: Record<string, Recap[]> = {}
  recapsFiltered.forEach((recap) => {
    const dateKey = recap.date
    if (!recapsByDate[dateKey]) {
      recapsByDate[dateKey] = []
    }
    recapsByDate[dateKey].push(recap)
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="mb-2 inline-block text-sm text-purple-100 hover:text-white"
              >
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">📝 Tous les récaps</h1>
              <p className="mt-1 text-sm text-purple-100">{recaps.length} récapitulatifs générés</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtres */}
        <div className="mb-6 flex items-center gap-4">
          <select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            <option value="tous">Tous les niveaux</option>
            <option value="6eme">6ème</option>
            <option value="5eme">5ème</option>
            <option value="4eme">4ème</option>
            <option value="3eme">3ème</option>
            <option value="2nde">2nde</option>
            <option value="1ere">1ère</option>
            <option value="Term">Terminale</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            {recapsFiltered.length} récap(s) affiché(s)
          </div>
        </div>

        {/* Liste des récaps */}
        {recaps.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <div className="mb-4 text-6xl">🤖</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Aucun récapitulatif pour le moment
            </h3>
            <p className="mb-6 text-gray-600">
              Les récaps automatiques générés par IA apparaîtront ici.
            </p>
            <div className="rounded-md bg-blue-50 p-4 text-left">
              <p className="text-sm text-blue-800">
                <strong>💡 Fonctionnalité à venir :</strong>
              </p>
              <ul className="ml-4 mt-2 list-disc text-sm text-blue-700">
                <li>Génération automatique chaque matin (6h)</li>
                <li>Résumé des observations de la nuit par niveau</li>
                <li>IA Claude ou GPT pour résumer intelligemment</li>
                <li>Envoi par email aux CPE/Direction</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(recapsByDate)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((dateKey) => (
                <div key={dateKey}>
                  <h2 className="mb-3 text-lg font-bold text-gray-900">
                    {formatDate(dateKey)}
                  </h2>
                  <div className="space-y-4">
                    {recapsByDate[dateKey].map((recap) => (
                      <div key={recap.id} className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                            {recap.niveau}
                          </span>
                          <span className="text-sm text-gray-500">
                            Généré le {formatTime(recap.createdAt)}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-gray-700">
                          {recap.contenu}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
