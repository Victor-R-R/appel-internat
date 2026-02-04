'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Types TypeScript (comme des classes Python mais juste pour la structure)
type User = {
  id: string
  email: string
  nom: string
  prenom: string
  niveau: string
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

  // State
  const [user, setUser] = useState<User | null>(null)
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [appels, setAppels] = useState<Record<string, AppelData>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /**
   * Au chargement : vérifier si l'user est connecté
   */
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      // Pas connecté → retour au login
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)

    // Charger les élèves du niveau de l'AED
    loadEleves(userData.niveau)
  }, [router])

  /**
   * Charger les élèves d'un niveau
   */
  const loadEleves = async (niveau: string) => {
    try {
      const response = await fetch(`/api/eleves?niveau=${niveau}`)
      const data = await response.json()

      if (data.success) {
        setEleves(data.eleves)

        // Initialiser tous les appels à "present" par défaut
        const initialAppels: Record<string, AppelData> = {}
        data.eleves.forEach((eleve: Eleve) => {
          initialAppels[eleve.id] = {
            eleveId: eleve.id,
            statut: 'present',
            observation: '',
          }
        })
        setAppels(initialAppels)
      }
    } catch (error) {
      console.error('Erreur chargement élèves:', error)
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
          niveau: user.niveau,
          appels: Object.values(appels),
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Appel enregistré avec succès !')
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Se déconnecter
   */
  const logout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

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
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Appel - {user.niveau}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {user.prenom} {user.nom} • {eleves.length} élèves
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Déconnexion
            </button>
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
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    appels[eleve.id]?.statut === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✓ Présent
                </button>
                <button
                  onClick={() => updateStatut(eleve.id, 'acf')}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    appels[eleve.id]?.statut === 'acf'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ACF
                </button>
                <button
                  onClick={() => updateStatut(eleve.id, 'absent')}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    appels[eleve.id]?.statut === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✗ Absent
                </button>
              </div>

              {/* Zone observation */}
              <textarea
                value={appels[eleve.id]?.observation || ''}
                onChange={(e) => updateObservation(eleve.id, e.target.value)}
                placeholder="Observations (facultatif)..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="rounded-md bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {saving ? 'Enregistrement...' : '💾 Enregistrer l\'appel'}
          </button>
        </div>
      </main>
    </div>
  )
}
