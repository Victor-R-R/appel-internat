'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useLogout } from '@/hooks/useAuth'

type Eleve = {
  id: string
  nom: string
  prenom: string
  niveau: string
  sexe: string
  actif: boolean
  createdAt: string
}

export default function GestionElevesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const logout = useLogout()
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEleve, setEditingEleve] = useState<Eleve | null>(null)
  const [filterNiveau, setFilterNiveau] = useState<string>('tous')
  const [filterSexe, setFilterSexe] = useState<string>('tous')
  const [filterActif, setFilterActif] = useState<string>('actifs')

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    niveau: '6eme',
    sexe: 'M',
  })

  useEffect(() => {
    if (authLoading) return

    // Seul Superadmin peut gérer les élèves
    if (user && user.role !== 'superadmin') {
      alert('⛔ Accès réservé aux Superadmins')
      router.push('/admin/dashboard')
      return
    }

    if (user) {
      loadEleves()
    }
  }, [user, authLoading, router])

  const loadEleves = async () => {
    try {
      const response = await fetch('/api/admin/eleves')
      const data = await response.json()

      if (data.success) {
        setEleves(data.eleves)
      }
    } catch (error) {
      console.error('Erreur chargement élèves:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEleve ? `/api/admin/eleves/${editingEleve.id}` : '/api/admin/eleves'
      const method = editingEleve ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(editingEleve ? '✅ Élève modifié' : '✅ Élève créé')
        setShowForm(false)
        setEditingEleve(null)
        resetForm()
        loadEleves()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const handleEdit = (eleve: Eleve) => {
    setEditingEleve(eleve)
    setFormData({
      nom: eleve.nom,
      prenom: eleve.prenom,
      niveau: eleve.niveau,
      sexe: eleve.sexe,
    })
    setShowForm(true)
  }

  const handleToggleActif = async (eleve: Eleve) => {
    const action = eleve.actif ? 'archiver' : 'réactiver'
    if (!confirm(`${action} ${eleve.prenom} ${eleve.nom} ?`)) return

    try {
      const response = await fetch(`/api/admin/eleves/${eleve.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !eleve.actif }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Élève ${action === 'archiver' ? 'archivé' : 'réactivé'}`)
        loadEleves()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const handleDelete = async (eleve: Eleve) => {
    if (!confirm(`⚠️ SUPPRIMER DÉFINITIVEMENT ${eleve.prenom} ${eleve.nom} ?`)) return

    try {
      const response = await fetch(`/api/admin/eleves/${eleve.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Élève supprimé')
        loadEleves()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      niveau: '6eme',
      sexe: 'M',
    })
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingEleve(null)
    resetForm()
  }

  // Filtrage
  const elevesFiltered = eleves.filter((e) => {
    if (filterNiveau !== 'tous' && e.niveau !== filterNiveau) return false
    if (filterSexe !== 'tous' && e.sexe !== filterSexe) return false
    if (filterActif === 'actifs' && !e.actif) return false
    if (filterActif === 'archives' && e.actif) return false
    return true
  })

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
      <header className="shadow-lg" style={{ background: 'linear-gradient(to right, #7EBEC5, #4d8dc1)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="mb-2 inline-block text-sm text-white/80 hover:text-white"
              >
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">🎓 Gestion des élèves</h1>
              <p className="mt-1 text-sm text-white/80">
                {eleves.filter((e) => e.actif).length} actifs • {eleves.filter((e) => !e.actif).length} archivés
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold hover:bg-white/90 transition-all"
              style={{ color: '#7EBEC5' }}
            >
              + Ajouter un élève
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterNiveau}
            onChange={(e) => {
              setFilterNiveau(e.target.value)
              // Réinitialiser le filtre sexe si on choisit "tous"
              if (e.target.value === 'tous') {
                setFilterSexe('tous')
              }
            }}
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

          {filterNiveau !== 'tous' && (
            <select
              value={filterSexe}
              onChange={(e) => setFilterSexe(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              style={{ borderColor: '#7EBEC5' }}
            >
              <option value="tous">👥 Tous (Filles + Garçons)</option>
              <option value="F">👧 Filles</option>
              <option value="M">👦 Garçons</option>
            </select>
          )}

          <select
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            <option value="tous">Tous</option>
            <option value="actifs">Actifs uniquement</option>
            <option value="archives">Archivés uniquement</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            {elevesFiltered.length} élève(s) affiché(s)
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {editingEleve ? 'Modifier un élève' : 'Ajouter un élève'}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sexe</label>
                  <select
                    value={formData.sexe}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  >
                    <option value="M">Garçon</option>
                    <option value="F">Fille</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#7EBEC5' }}
                >
                  {editingEleve ? 'Modifier' : 'Créer'}
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

        {/* Liste des élèves */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sexe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {elevesFiltered.map((eleve) => (
                <tr key={eleve.id} className={eleve.actif ? 'hover:bg-gray-50' : 'bg-gray-100'}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {eleve.prenom} {eleve.nom}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5" style={{ backgroundColor: '#e2e5ed', color: '#7EBEC5' }}>
                      {eleve.niveau}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {eleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {eleve.actif ? (
                      <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5" style={{ backgroundColor: '#e2e5ed', color: '#7EBEC5' }}>
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        Archivé
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(eleve)}
                      className="mr-3 hover:opacity-80 transition-opacity"
                      style={{ color: '#0C71C3' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleActif(eleve)}
                      className="mr-3 hover:opacity-80 transition-opacity"
                      style={{ color: '#4d8dc1' }}
                    >
                      {eleve.actif ? 'Archiver' : 'Réactiver'}
                    </button>
                    <button
                      onClick={() => handleDelete(eleve)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {elevesFiltered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">Aucun élève trouvé</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
