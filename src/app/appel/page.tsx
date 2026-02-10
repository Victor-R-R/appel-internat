'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderActionButton } from '@/components/ui/HeaderButton'
import { AppelStats } from '@/components/ui/AppelStats'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { NiveauSelect } from '@/components/forms/NiveauSelect'
import type { EleveDTO, AppelData } from '@/lib/types'
import { ADMIN_ROLES } from '@/lib/constants'

export default function AppelPage() {
  useScrollToTop()
  const router = useRouter()
  const toast = useToast()

  // Authentification via hook (récupère depuis JWT cookie)
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  })
  const logout = useLogout()

  // State
  const [eleves, setEleves] = useState<EleveDTO[]>([])
  const [appels, setAppels] = useState<Record<string, AppelData>>({})
  const [groupObservation, setGroupObservation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [appelExists, setAppelExists] = useState(false)

  // Sélecteurs de niveau et groupe (initialisés avec les valeurs de l'AED par défaut)
  const [selectedNiveau, setSelectedNiveau] = useState<string>('')
  const [selectedSexeGroupe, setSelectedSexeGroupe] = useState<string>('')

  /**
   * Rediriger les rôles admin vers le dashboard
   */
  useEffect(() => {
    if (!authLoading && user) {
      if (ADMIN_ROLES.includes(user.role)) {
        router.push('/admin/dashboard')
      }
    }
  }, [user, authLoading, router])

  /**
   * Initialiser les sélecteurs avec les valeurs par défaut de l'AED
   */
  useEffect(() => {
    if (user?.niveau && user?.sexeGroupe) {
      setSelectedNiveau(user.niveau)
      setSelectedSexeGroupe(user.sexeGroupe)
    }
  }, [user])

  /**
   * Calcul dynamique des statistiques
   */
  const stats = useMemo(() => {
    // Filtrer les appels pour ne compter que ceux des élèves actuels
    const eleveIds = new Set(eleves.map((e) => e.id))
    const appelValues = Object.values(appels).filter((a) => eleveIds.has(a.eleveId))
    return {
      total: eleves.length,
      presents: appelValues.filter((a) => a.statut === 'present').length,
    }
  }, [appels, eleves])

  /**
   * Charger les élèves quand niveau ou groupe change
   */
  useEffect(() => {
    if (selectedNiveau && selectedSexeGroupe) {
      loadEleves(selectedNiveau, selectedSexeGroupe)
    }
  }, [selectedNiveau, selectedSexeGroupe])

  /**
   * Charger les élèves d'un niveau et sexe, et l'appel existant du jour
   */
  const loadEleves = async (niveau: string, sexeGroupe: string) => {
    try {
      // Réinitialiser les appels pour éviter la race condition
      setAppels({})

      // Charger les élèves
      const elevesResponse = await fetch(`/api/eleves?niveau=${niveau}&sexe=${sexeGroupe}`)
      const elevesData = await elevesResponse.json()

      if (!elevesData.success) {
        console.error('Erreur chargement élèves')
        return
      }

      setEleves(elevesData.eleves)

      // Charger l'appel existant du jour
      const today = new Date().toISOString().split('T')[0]
      const appelResponse = await fetch(`/api/appel?niveau=${niveau}&date=${today}&sexeGroupe=${sexeGroupe}`)
      const appelData = await appelResponse.json()

      // Si un appel existe déjà aujourd'hui
      if (appelData.success && appelData.exists && appelData.appels.length > 0) {
        setAppelExists(true)

        // Remplir avec les données existantes
        const existingAppels: Record<string, AppelData> = {}
        appelData.appels.forEach((appel: any) => {
          existingAppels[appel.eleveId] = {
            eleveId: appel.eleveId,
            statut: appel.statut,
          }
        })
        setAppels(existingAppels)

        // Charger l'observation du groupe
        setGroupObservation(appelData.observation || '')
      } else {
        // Pas d'appel existant : initialiser à "present" par défaut
        setAppelExists(false)

        const initialAppels: Record<string, AppelData> = {}
        elevesData.eleves.forEach((eleve: EleveDTO) => {
          initialAppels[eleve.id] = {
            eleveId: eleve.id,
            statut: 'present',
          }
        })
        setAppels(initialAppels)

        // Charger l'observation du groupe (peut exister même si pas d'appels)
        setGroupObservation(appelData.observation || '')
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Changer le statut d'un élève
   */
  const updateStatut = (eleveId: string, statut: 'present' | 'acf' | 'absent') => {
    setAppels((prev) => ({
      ...prev,
      [eleveId]: { eleveId, statut },
    }))
  }


  /**
   * Sauvegarder l'appel complet
   */
  const saveAppel = async () => {
    if (!user) return

    setSaving(true)
    try {
      const response = await fetch('/api/appel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aedId: user.id,
          niveau: selectedNiveau,
          sexeGroupe: selectedSexeGroupe,
          observation: groupObservation,
          appels: Object.values(appels),
        }),
      })

      const data = await response.json()

      if (data.success) {
        const message = appelExists
          ? 'Appel modifié avec succès !'
          : 'Appel enregistré avec succès !'
        toast.success(message)
        setAppelExists(true) // Maintenant l'appel existe
      } else {
        toast.error(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  const groupeLabel = selectedSexeGroupe === 'F' ? 'Filles' : 'Garçons'

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <AdminHeader
        title={`${user.prenom} ${user.nom}`}
        subtitle={`Appel - ${selectedNiveau} ${groupeLabel}`}
        variant="blue"
        actions={
          <>
            {appelExists && (
              <p
                className="rounded-md px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-inverse)',
                }}
              >
                ✓ Appel déjà effectué aujourd&apos;hui
              </p>
            )}
            <HeaderActionButton onClick={logout}>
              Déconnexion
            </HeaderActionButton>
          </>
        }
      />

      {/* Sélecteurs de niveau et groupe */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-standard)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                🎓 Niveau
              </label>
              <NiveauSelect
                value={selectedNiveau}
                onChange={setSelectedNiveau}
                className="input-admin"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                👥 Groupe
              </label>
              <select
                value={selectedSexeGroupe}
                onChange={(e) => setSelectedSexeGroupe(e.target.value)}
                className="input-admin"
              >
                <option value="F">👧 Filles</option>
                <option value="M">👦 Garçons</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AppelStats total={stats.total} presents={stats.presents} />
      </div>

      {/* Registre des élèves */}
      <main className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {eleves.map((eleve, index) => (
            <div
              key={eleve.id}
              className="p-4"
              style={{
                borderBottom: index < eleves.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Nom de l'élève */}
              <div className="mb-3">
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {eleve.nom} {eleve.prenom}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {eleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                </p>
              </div>

              {/* Boutons statut */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatut(eleve.id, 'present')}
                  className="px-4 py-2 text-sm font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      appels[eleve.id]?.statut === 'present'
                        ? 'var(--success)'
                        : 'var(--control-bg)',
                    color:
                      appels[eleve.id]?.statut === 'present'
                        ? 'var(--text-inverse)'
                        : 'var(--text-primary)',
                    border:
                      appels[eleve.id]?.statut === 'present'
                        ? '1px solid var(--success)'
                        : '1px solid var(--border-standard)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  ✓ Présent
                </button>
                <button
                  onClick={() => updateStatut(eleve.id, 'acf')}
                  className="px-4 py-2 text-sm font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      appels[eleve.id]?.statut === 'acf'
                        ? 'var(--warning)'
                        : 'var(--control-bg)',
                    color:
                      appels[eleve.id]?.statut === 'acf'
                        ? 'var(--text-inverse)'
                        : 'var(--text-primary)',
                    border:
                      appels[eleve.id]?.statut === 'acf'
                        ? '1px solid var(--warning)'
                        : '1px solid var(--border-standard)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  ACF
                </button>
                <button
                  onClick={() => updateStatut(eleve.id, 'absent')}
                  className="px-4 py-2 text-sm font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      appels[eleve.id]?.statut === 'absent'
                        ? 'var(--error)'
                        : 'var(--control-bg)',
                    color:
                      appels[eleve.id]?.statut === 'absent'
                        ? 'var(--text-inverse)'
                        : 'var(--text-primary)',
                    border:
                      appels[eleve.id]?.statut === 'absent'
                        ? '1px solid var(--error)'
                        : '1px solid var(--border-standard)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  ✗ Absent
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Observation du groupe */}
        <div
          className="mt-6 p-6"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <h3
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            📝 Observations du groupe {selectedNiveau} {groupeLabel}
          </h3>
          <textarea
            value={groupObservation}
            onChange={(e) => setGroupObservation(e.target.value)}
            placeholder="Observations générales sur le groupe (facultatif)..."
            className="input-admin"
            rows={4}
          />
        </div>

        {/* Bouton sauvegarder */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={saveAppel}
            disabled={saving}
            className="btn-primary px-8 py-3 text-base"
          >
            {saving
              ? 'Enregistrement...'
              : appelExists
              ? '💾 Modifier l\'appel'
              : '💾 Enregistrer l\'appel'}
          </button>
        </div>
      </main>
    </div>
  )
}
