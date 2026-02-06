'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, useLogout } from '@/hooks/useAuth'
import type { EleveDTO, AedSlim } from '@/lib/types'
import { NIVEAUX } from '@/lib/constants'

type Eleve = EleveDTO
type AED = AedSlim

type AppelItem = {
  id: string
  statut: 'present' | 'acf' | 'absent'
  observation: string | null
  eleve: Eleve
}

type AppelGroup = {
  niveau: string
  date: Date
  aed: AED
  appels: AppelItem[]
}

const NIVEAUX_AVEC_TOUS = ['tous', ...NIVEAUX]

export default function HistoriqueAppelsPage() {
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  })
  const logout = useLogout()

  const [groups, setGroups] = useState<AppelGroup[]>([])
  const [loading, setLoading] = useState(true)

  // Filtres
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedNiveau, setSelectedNiveau] = useState<string>('tous')
  const [selectedSexe, setSelectedSexe] = useState<string>('tous')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadAppels()
    }
  }, [user, selectedDate, selectedNiveau, selectedSexe])

  const loadAppels = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedDate) params.append('date', selectedDate)
      if (selectedNiveau && selectedNiveau !== 'tous') params.append('niveau', selectedNiveau)
      if (selectedSexe && selectedSexe !== 'tous') params.append('sexe', selectedSexe)

      const response = await fetch(`/api/admin/appels?${params}`)
      const data = await response.json()

      if (data.success) {
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Erreur chargement appels:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculer les statistiques pour un groupe
   */
  const getStats = (appels: AppelItem[]) => {
    const presents = appels.filter((a) => a.statut === 'present').length
    const acf = appels.filter((a) => a.statut === 'acf').length
    const absents = appels.filter((a) => a.statut === 'absent').length
    return { presents, acf, absents, total: appels.length }
  }

  /**
   * Formater la date en français
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Filtrer les groupes selon la recherche
   */
  const getFilteredGroups = () => {
    if (!searchQuery.trim()) {
      return groups
    }

    const query = searchQuery.toLowerCase().trim()

    return groups
      .map((group) => {
        // Filtrer les appels du groupe
        const filteredAppels = group.appels.filter((appel) => {
          const nomComplet = `${appel.eleve.nom} ${appel.eleve.prenom}`.toLowerCase()
          return nomComplet.includes(query)
        })

        // Retourner le groupe avec les appels filtrés
        return {
          ...group,
          appels: filteredAppels,
        }
      })
      .filter((group) => group.appels.length > 0) // Supprimer les groupes vides
  }

  /**
   * Compter le nombre total d'élèves trouvés
   */
  const getTotalResults = () => {
    return getFilteredGroups().reduce((sum, group) => sum + group.appels.length, 0)
  }

  if (authLoading || loading) {
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
      <header
        className="shadow-lg"
        style={{ background: 'linear-gradient(to right, #0C71C3, #4d8dc1)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                📊 Historique des appels
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {user.email} • Consultation des appels • Internat d&apos;Excellence de Sourdun
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/dashboard"
                className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-all"
              >
                ← Retour
              </Link>
              <button
                onClick={logout}
                className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtres */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Filtre Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                📅 Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#0C71C3] focus:outline-none focus:ring-1 focus:ring-[#0C71C3]"
              />
            </div>

            {/* Filtre Niveau */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                🎓 Niveau
              </label>
              <select
                value={selectedNiveau}
                onChange={(e) => {
                  setSelectedNiveau(e.target.value)
                  // Réinitialiser le filtre sexe si on choisit "tous"
                  if (e.target.value === 'tous') {
                    setSelectedSexe('tous')
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#0C71C3] focus:outline-none focus:ring-1 focus:ring-[#0C71C3]"
              >
                {NIVEAUX_AVEC_TOUS.map((niveau) => (
                  <option key={niveau} value={niveau}>
                    {niveau === 'tous' ? 'Tous les niveaux' : niveau}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Sexe - Apparaît uniquement si un niveau spécifique est sélectionné */}
            {selectedNiveau !== 'tous' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  👥 Groupe
                </label>
                <select
                  value={selectedSexe}
                  onChange={(e) => setSelectedSexe(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#0C71C3] focus:outline-none focus:ring-1 focus:ring-[#0C71C3]"
                  style={{ borderColor: '#0C71C3' }}
                >
                  <option value="tous">👥 Tous (Filles + Garçons)</option>
                  <option value="F">👧 Filles</option>
                  <option value="M">👦 Garçons</option>
                </select>
              </div>
            )}

            {/* Recherche élève */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                🔍 Rechercher un élève
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom ou prénom..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#0C71C3] focus:outline-none focus:ring-1 focus:ring-[#0C71C3]"
              />
            </div>
          </div>

          {/* Afficher le nombre de résultats si recherche active */}
          {searchQuery.trim() && (
            <div className="mt-4 rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-800">
              {getTotalResults()} élève(s) trouvé(s) pour &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 font-medium underline hover:no-underline"
              >
                Effacer
              </button>
            </div>
          )}
        </div>

        {/* Affichage des appels */}
        {groups.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">
              Aucun appel trouvé pour les critères sélectionnés
            </p>
          </div>
        ) : getFilteredGroups().length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">
              Aucun élève ne correspond à votre recherche
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredGroups().map((group, idx) => {
              const stats = getStats(group.appels)
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg bg-white shadow"
                >
                  {/* En-tête du groupe */}
                  <div
                    className="px-6 py-4"
                    style={{ background: 'linear-gradient(to right, #0C71C3, #4d8dc1)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {group.niveau}
                        </h2>
                        <p className="text-sm text-white/80">
                          {formatDate(group.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/80">
                          Appel effectué par
                        </p>
                        <p className="font-semibold text-white">
                          {group.aed.prenom} {group.aed.nom}
                        </p>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="mt-4 grid grid-cols-4 gap-4 rounded-md bg-white/10 p-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.total}
                        </p>
                        <p className="text-xs text-white/70">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.presents}
                        </p>
                        <p className="text-xs text-white/70">Présents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.acf}
                        </p>
                        <p className="text-xs text-white/70">ACF</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {stats.absents}
                        </p>
                        <p className="text-xs text-white/70">Absents</p>
                      </div>
                    </div>
                  </div>

                  {/* Liste des élèves */}
                  <div className="divide-y divide-gray-200">
                    {group.appels.map((appel) => (
                      <div
                        key={appel.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Nom élève */}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {appel.eleve.nom} {appel.eleve.prenom}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appel.eleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                              </p>
                            </div>

                            {/* Badge statut */}
                            <div>
                              {appel.statut === 'present' && (
                                <span
                                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                                  style={{ backgroundColor: '#7EBEC5' }}
                                >
                                  ✓ Présent
                                </span>
                              )}
                              {appel.statut === 'acf' && (
                                <span
                                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                                  style={{ backgroundColor: '#4d8dc1' }}
                                >
                                  ACF
                                </span>
                              )}
                              {appel.statut === 'absent' && (
                                <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                                  ✗ Absent
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Observation si présente */}
                          {appel.observation && (
                            <div className="max-w-md">
                              <p className="text-sm italic text-gray-600">
                                &ldquo;{appel.observation}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
