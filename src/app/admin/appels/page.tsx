'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderLinkButton } from '@/components/ui/HeaderButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { NiveauSelect } from '@/components/forms/NiveauSelect'
import { ChevronDown } from 'lucide-react'
import type { EleveDTO, AedSlim } from '@/lib/types'
import { NIVEAUX, ADMIN_ROLES } from '@/lib/constants'

type Eleve = EleveDTO
type AED = AedSlim

type AppelItem = {
  id: string
  statut: 'present' | 'acf' | 'absent'
  eleve: Eleve
}

type AppelGroup = {
  niveau: string
  date: Date
  sexeGroupe: string
  aed: AED
  observation?: string | null
  appels: AppelItem[]
}

export default function HistoriqueAppelsPage() {
  useScrollToTop()
  const router = useRouter()
  const toast = useToast()
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  })
  const logout = useLogout()

  const [groups, setGroups] = useState<AppelGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

  // Filtres
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedNiveau, setSelectedNiveau] = useState<string>('tous')
  const [selectedSexe, setSelectedSexe] = useState<string>('tous')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    if (authLoading) return

    if (user && !ADMIN_ROLES.includes(user.role)) {
      toast.error('Accès réservé aux CPE, Managers et Superadmins')
      router.push('/appel')
      return
    }

    if (user) {
      loadAppels()
    }
  }, [user, authLoading, router, toast, selectedDate, selectedNiveau, selectedSexe])

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

  /**
   * Toggle l'expansion d'un groupe
   */
  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title={`${user.prenom} ${user.nom} • Consultation des appels`}
        subtitle="Historique et consultation"
        variant="blue"
        actions={
          <HeaderLinkButton href="/admin/dashboard">
            Retour
          </HeaderLinkButton>
        }
      />

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
              <NiveauSelect
                value={selectedNiveau}
                onChange={(value) => {
                  setSelectedNiveau(value)
                  // Réinitialiser le filtre sexe si on choisit "tous"
                  if (value === 'tous') {
                    setSelectedSexe('tous')
                  }
                }}
                includeAll={true}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#0C71C3] focus:outline-none focus:ring-1 focus:ring-[#0C71C3]"
              />
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
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600">
              {getTotalResults()} résultat(s) trouvé(s) pour &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>

        {/* Liste des groupes d'appels */}
        {getFilteredGroups().length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">Aucun appel trouvé pour les filtres sélectionnés</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredGroups().map((group, index) => {
              const stats = getStats(group.appels)
              const isExpanded = expandedGroups.has(index)
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg bg-white shadow"
                >
                  {/* En-tête du groupe - Cliquable */}
                  <div
                    onClick={() => toggleGroup(index)}
                    className="cursor-pointer bg-gradient-to-r from-[#0C71C3] to-[#4d8dc1] px-6 py-4 text-white transition-all hover:from-[#0b65b0] hover:to-[#4380af]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                        <div>
                          <h3 className="text-lg font-bold">
                            📚 {group.niveau} •{' '}
                            {group.sexeGroupe === 'F' ? 'Filles' : 'Garçons'}
                          </h3>
                          <p className="mt-1 text-sm opacity-90">
                            📅 {formatDate(group.date)} • Par {group.aed.prenom} {group.aed.nom}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                          ✓ {stats.presents} Présent(s)
                        </span>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                          ACF {stats.acf}
                        </span>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                          ✗ {stats.absents} Absent(s)
                        </span>
                      </div>
                    </div>

                    {/* Observation du groupe */}
                    {group.observation && (
                      <div className="mt-3 rounded-md bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="text-sm font-medium opacity-90">
                          📝 Observations du groupe :
                        </p>
                        <p className="mt-1 text-sm italic">
                          &ldquo;{group.observation}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Liste des appels - Affichée uniquement si expanded */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {group.appels.map((appel) => (
                        <div
                          key={appel.id}
                          className={`px-6 py-4 ${appel.statut === 'absent' ? 'bg-red-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            {/* Infos élève */}
                            <div>
                              <p className="font-medium text-gray-900">
                                {appel.eleve.nom} {appel.eleve.prenom}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appel.eleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                              </p>
                            </div>

                            {/* Badge statut */}
                            <div>
                              {appel.statut === 'present' && (
                                <Badge variant="present">✓ Présent</Badge>
                              )}
                              {appel.statut === 'acf' && (
                                <Badge variant="acf">ACF</Badge>
                              )}
                              {appel.statut === 'absent' && (
                                <Badge variant="absent">✗ Absent</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
