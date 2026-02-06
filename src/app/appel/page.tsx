'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useLogout } from '@/hooks/useAuth'

// Types TypeScript (comme des classes Python mais juste pour la structure)
type User = {
  id: string
  email: string
  role: string
  nom?: string
  prenom?: string
  niveau?: string | null
  sexeGroupe?: string | null
}

type Eleve = {
  id: string
  nom: string
  prenom: string
  niveau: string
  sexe: string
}

type AppelData = {
  eleveId: string
  statut: 'present' | 'acf' | 'absent'
  observation: string
}

export default function AppelPage() {
  const router = useRouter()

  // Authentification via hook (récupère depuis JWT cookie)
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  })
  const logout = useLogout()

  // State
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [appels, setAppels] = useState<Record<string, AppelData>>({})
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
      const adminRoles = ['cpe', 'manager', 'superadmin']
      if (adminRoles.includes(user.role)) {
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
      const appelResponse = await fetch(`/api/appel?niveau=${niveau}&date=${today}`)
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
            observation: appel.observation || '',
          }
        })
        setAppels(existingAppels)
      } else {
        // Pas d'appel existant : initialiser à "present" par défaut
        setAppelExists(false)

        const initialAppels: Record<string, AppelData> = {}
        elevesData.eleves.forEach((eleve: Eleve) => {
          initialAppels[eleve.id] = {
            eleveId: eleve.id,
            statut: 'present',
            observation: '',
          }
        })
        setAppels(initialAppels)
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
      [eleveId]: { ...prev[eleveId], statut },
    }))
  }

  /**
   * Changer l'observation d'un élève
   */
  const updateObservation = (eleveId: string, observation: string) => {
    setAppels((prev) => ({
      ...prev,
      [eleveId]: { ...prev[eleveId], observation },
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
          niveau: selectedNiveau, // Utilise le niveau sélectionné
          appels: Object.values(appels),
        }),
      })

      const data = await response.json()

      if (data.success) {
        const message = appelExists
          ? '✅ Appel modifié avec succès !'
          : '✅ Appel enregistré avec succès !'
        alert(message)
        setAppelExists(true) // Maintenant l'appel existe
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  const groupeLabel = selectedSexeGroupe === 'F' ? 'Filles' : 'Garçons'
  const niveaux = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Tle']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-lg" style={{ background: 'linear-gradient(to right, #0C71C3, #4d8dc1)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">
                Appel - {selectedNiveau} {groupeLabel}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {user.prenom} {user.nom} • {eleves.length} élèves • Internat d&apos;Excellence de Sourdun
              </p>
              {appelExists && (
                <p className="mt-2 inline-block rounded-md bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  ✓ Appel déjà effectué aujourd&apos;hui - Vous pouvez le modifier jusqu&apos;à minuit
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-all"
            >
              Déconnexion
            </button>
          </div>

          {/* Sélecteurs de niveau et groupe */}
          <div className="mt-6 flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-white">
                🎓 Niveau
              </label>
              <select
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white backdrop-blur-sm"
                style={{ color: 'white' }}
              >
                {niveaux.map((niveau) => (
                  <option key={niveau} value={niveau} style={{ color: '#333' }}>
                    {niveau}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-white">
                👥 Groupe
              </label>
              <select
                value={selectedSexeGroupe}
                onChange={(e) => setSelectedSexeGroupe(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white backdrop-blur-sm"
                style={{ color: 'white' }}
              >
                <option value="F" style={{ color: '#333' }}>👧 Filles</option>
                <option value="M" style={{ color: '#333' }}>👦 Garçons</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Liste des élèves */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {eleves.map((eleve) => (
            <div
              key={eleve.id}
              className="rounded-lg bg-white p-6 shadow"
            >
              {/* Nom de l'élève */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {eleve.nom} {eleve.prenom}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {eleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                  </p>
                </div>
              </div>

              {/* Boutons statut */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => updateStatut(eleve.id, 'present')}
                  className="rounded-md px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: appels[eleve.id]?.statut === 'present' ? '#7EBEC5' : '#e2e5ed',
                    color: appels[eleve.id]?.statut === 'present' ? 'white' : '#333333'
                  }}
                >
                  ✓ Présent
                </button>
                <button
                  onClick={() => updateStatut(eleve.id, 'acf')}
                  className="rounded-md px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: appels[eleve.id]?.statut === 'acf' ? '#4d8dc1' : '#e2e5ed',
                    color: appels[eleve.id]?.statut === 'acf' ? 'white' : '#333333'
                  }}
                >
                  ACF
                </button>
                <button
                  onClick={() => updateStatut(eleve.id, 'absent')}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    appels[eleve.id]?.statut === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: appels[eleve.id]?.statut === 'absent' ? '#dc2626' : '#e2e5ed'
                  }}
                >
                  ✗ Absent
                </button>
              </div>

              {/* Zone observation */}
              <textarea
                value={appels[eleve.id]?.observation || ''}
                onChange={(e) => updateObservation(eleve.id, e.target.value)}
                placeholder="Observations (facultatif)..."
                className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors"
                style={{ borderColor: '#e2e5ed' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0C71C3'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e5ed'}
                rows={2}
              />
            </div>
          ))}
        </div>

        {/* Bouton sauvegarder */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveAppel}
            disabled={saving}
            className="btn-primary rounded-md px-8 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              backgroundColor: saving ? '#cccccc' : '#0C71C3',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
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
