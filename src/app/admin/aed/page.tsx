'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useLogout } from '@/hooks/useAuth'

type AED = {
  id: string
  email: string
  nom: string
  prenom: string
  role: string
  niveau: string | null
}

export default function GestionAEDPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const logout = useLogout()
  const [aeds, setAEDs] = useState<AED[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAED, setEditingAED] = useState<AED | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    niveau: '6eme',
  })

  useEffect(() => {
    if (authLoading) return

    if (user && user.role !== 'superadmin') {
      alert('⛔ Accès réservé aux superadmins')
      router.push('/appel')
      return
    }

    if (user) {
      loadAEDs()
    }
  }, [user, authLoading, router])

  const loadAEDs = async () => {
    try {
      const response = await fetch('/api/admin/aed')
      const data = await response.json()

      if (data.success) {
        setAEDs(data.aeds)
      }
    } catch (error) {
      console.error('Erreur chargement AED:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingAED ? `/api/admin/aed/${editingAED.id}` : '/api/admin/aed'
      const method = editingAED ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(editingAED ? '✅ AED modifié' : '✅ AED créé')
        setShowForm(false)
        setEditingAED(null)
        resetForm()
        loadAEDs()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const handleEdit = (aed: AED) => {
    setEditingAED(aed)
    setFormData({
      email: aed.email,
      password: '', // Ne pas pré-remplir le mot de passe
      nom: aed.nom,
      prenom: aed.prenom,
      niveau: aed.niveau || '6eme',
    })
    setShowForm(true)
  }

  const handleDelete = async (aed: AED) => {
    if (!confirm(`Supprimer ${aed.prenom} ${aed.nom} ?`)) return

    try {
      const response = await fetch(`/api/admin/aed/${aed.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ AED supprimé')
        loadAEDs()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      niveau: '6eme',
    })
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingAED(null)
    resetForm()
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
      <header className="shadow-lg" style={{ background: 'linear-gradient(to right, #0C71C3, #4d8dc1)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="mb-2 inline-block text-sm text-white/80 hover:text-white"
              >
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">👥 Gestion des AED</h1>
              <p className="mt-1 text-sm text-white/80">{aeds.length} AED enregistrés</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary rounded-md bg-white px-4 py-2 text-sm font-semibold hover:bg-white/90 transition-all"
              style={{ color: '#0C71C3' }}
            >
              + Ajouter un AED
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Formulaire */}
        {showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {editingAED ? 'Modifier un AED' : 'Ajouter un AED'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe {editingAED && '(laisser vide pour ne pas changer)'}
                </label>
                <input
                  type="password"
                  required={!editingAED}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder={editingAED ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Niveau</label>
                <select
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="6eme">6ème</option>
                  <option value="5eme">5ème</option>
                  <option value="4eme">4ème</option>
                  <option value="3eme">3ème</option>
                  <option value="2nde">2nde</option>
                  <option value="1ere">1ère</option>
                  <option value="Term">Terminale</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary rounded-md px-4 py-2 text-sm font-semibold text-white transition-all"
                  style={{ backgroundColor: '#0C71C3' }}
                >
                  {editingAED ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des AED */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Niveau
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {aeds.map((aed) => (
                <tr key={aed.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {aed.prenom} {aed.nom}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">{aed.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5" style={{ backgroundColor: '#e2e5ed', color: '#0C71C3' }}>
                      {aed.niveau}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(aed)}
                      className="mr-3 hover:opacity-80 transition-opacity"
                      style={{ color: '#0C71C3' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(aed)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {aeds.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">Aucun AED enregistré</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
