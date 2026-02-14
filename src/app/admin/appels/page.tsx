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
import { ChevronDown } from '@/lib/icons'
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

  // Extraire jour, mois, année depuis selectedDate
  const [year, month, day] = selectedDate.split('-')

  // Handler pour mettre à jour les parties de la date
  const handleDatePartChange = (part: 'day' | 'month' | 'year', value: string) => {
    const [currentYear, currentMonth, currentDay] = selectedDate.split('-')

    let newYear = currentYear
    let newMonth = currentMonth
    let newDay = currentDay

    if (part === 'day') newDay = value.padStart(2, '0')
    if (part === 'month') newMonth = value.padStart(2, '0')
    if (part === 'year') newYear = value

    setSelectedDate(`${newYear}-${newMonth}-${newDay}`)
  }

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
        <div className="card-registre mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Filtre Date */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                📅 Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Jour */}
                <select
                  value={parseInt(day)}
                  onChange={(e) => handleDatePartChange('day', e.target.value)}
                  className="input-admin text-sm"
                  style={{ padding: 'var(--space-sm)' }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Mois */}
                <select
                  value={parseInt(month)}
                  onChange={(e) => handleDatePartChange('month', e.target.value)}
                  className="input-admin text-sm"
                  style={{ padding: 'var(--space-sm)' }}
                >
                  {[
                    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
                  ].map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Année */}
                <select
                  value={parseInt(year)}
                  onChange={(e) => handleDatePartChange('year', e.target.value)}
                  className="input-admin text-sm"
                  style={{ padding: 'var(--space-sm)' }}
                >
                  {Array.from({ length: 10 }, (_, i) => 2026 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre Niveau */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
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
                className="input-admin"
              />
            </div>

            {/* Filtre Sexe - Apparaît uniquement si un niveau spécifique est sélectionné */}
            {selectedNiveau !== 'tous' && (
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  👥 Groupe
                </label>
                <select
                  value={selectedSexe}
                  onChange={(e) => setSelectedSexe(e.target.value)}
                  className="input-admin"
                >
                  <option value="tous">👥 Tous (Filles + Garçons)</option>
                  <option value="F">👧 Filles</option>
                  <option value="M">👦 Garçons</option>
                </select>
              </div>
            )}

            {/* Recherche élève */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                🔍 Rechercher un élève
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom ou prénom..."
                className="input-admin"
              />
            </div>
          </div>

          {/* Afficher le nombre de résultats si recherche active */}
          {searchQuery && (
            <div className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {getTotalResults()} résultat(s) trouvé(s) pour &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>

        {/* Liste des groupes d'appels */}
        {getFilteredGroups().length === 0 ? (
          <div className="card-registre p-12 text-center">
            <p style={{ color: 'var(--text-tertiary)' }}>Aucun appel trouvé pour les filtres sélectionnés</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredGroups().map((group, index) => {
              const stats = getStats(group.appels)
              const isExpanded = expandedGroups.has(index)
              return (
                <div
                  key={index}
                  className="card-registre overflow-hidden"
                  style={{ padding: 0 }}
                >
                  {/* En-tête du groupe - Cliquable */}
                  <div
                    onClick={() => toggleGroup(index)}
                    className="cursor-pointer px-6 py-4 transition-all"
                    style={{
                      backgroundColor: 'var(--surface-institutional)',
                      color: 'var(--text-inverse)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--institutional-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-institutional)'
                    }}
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
                        <span
                          className="rounded-full px-3 py-1 text-sm font-medium"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          ✓ {stats.presents} Présent(s)
                        </span>
                        <span
                          className="rounded-full px-3 py-1 text-sm font-medium"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          ACF {stats.acf}
                        </span>
                        <span
                          className="rounded-full px-3 py-1 text-sm font-medium"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          ✗ {stats.absents} Absent(s)
                        </span>
                      </div>
                    </div>

                    {/* Observation du groupe */}
                    {group.observation && (
                      <div
                        className="mt-3 rounded-md px-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        <p className="text-sm font-medium" style={{ opacity: 0.9 }}>
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
                    <div>
                      {group.appels.map((appel, appelIndex) => (
                        <div
                          key={appel.id}
                          className="px-6 py-4"
                          style={{
                            backgroundColor: appel.statut === 'absent' ? 'var(--error-light)' : 'var(--surface-card)',
                            borderTop: appelIndex > 0 ? '1px solid var(--border-subtle)' : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            {/* Infos élève */}
                            <div>
                              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {appel.eleve.nom} {appel.eleve.prenom}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
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
