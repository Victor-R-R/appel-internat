'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCRUD } from '@/hooks/useCRUD'
import { useToast } from '@/contexts/ToastContext'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderLinkButton, HeaderActionButton } from '@/components/ui/HeaderButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { NiveauSelect } from '@/components/forms/NiveauSelect'

type Eleve = {
  id: string
  nom: string
  prenom: string
  niveau: string
  sexe: string
  actif: boolean
  createdAt: string
}

type EleveFormData = {
  nom: string
  prenom: string
  niveau: string
  sexe: string
}

const INITIAL_FORM_DATA: EleveFormData = {
  nom: '',
  prenom: '',
  niveau: '6eme',
  sexe: 'M',
}

export default function GestionElevesPage() {
  useScrollToTop()
  const router = useRouter()
  const toast = useToast()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [filterNiveau, setFilterNiveau] = useState<string>('tous')
  const [filterSexe, setFilterSexe] = useState<string>('tous')
  const [filterActif, setFilterActif] = useState<string>('actifs')

  const crud = useCRUD<Eleve, EleveFormData>({
    apiPath: '/api/admin/eleves',
    dataKey: 'eleves',
    initialFormData: INITIAL_FORM_DATA,
    itemToFormData: (eleve) => ({
      nom: eleve.nom,
      prenom: eleve.prenom,
      niveau: eleve.niveau,
      sexe: eleve.sexe,
    }),
    entityName: 'Élève',
    onLoadSuccess: setEleves,
    scrollOnEdit: false,
  })

  useEffect(() => {
    if (authLoading) return

    // Seul Superadmin peut gérer les élèves
    if (user && user.role !== 'superadmin') {
      toast.error('Accès réservé aux Superadmins')
      router.push('/admin/dashboard')
      return
    }

    if (user) {
      crud.reloadItems()
    }
  }, [user, authLoading, router, toast])

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
        toast.success(`Élève ${action === 'archiver' ? 'archivé' : 'réactivé'} avec succès`)
        await crud.reloadItems()
      } else {
        toast.error(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
    }
  }

  // Filtrage
  const elevesFiltered = eleves.filter((e) => {
    if (filterNiveau !== 'tous' && e.niveau !== filterNiveau) return false
    if (filterSexe !== 'tous' && e.sexe !== filterSexe) return false
    if (filterActif === 'actifs' && !e.actif) return false
    if (filterActif === 'archives' && e.actif) return false
    return true
  })

  if (authLoading || crud.loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="🎓 Gestion des élèves"
        subtitle={`${eleves.filter((e) => e.actif).length} actifs • ${eleves.filter((e) => !e.actif).length} archivés`}
        variant="blue"
        actions={
          <>
            <HeaderLinkButton href="/admin/dashboard">
              Retour
            </HeaderLinkButton>
            <HeaderActionButton onClick={crud.handleCreate} variant="primary-blue">
              + Ajouter un élève
            </HeaderActionButton>
          </>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-4">
          <NiveauSelect
            value={filterNiveau}
            onChange={(value) => {
              setFilterNiveau(value)
              // Réinitialiser le filtre sexe si on choisit "tous"
              if (value === 'tous') {
                setFilterSexe('tous')
              }
            }}
            includeAll={true}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />

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
        {crud.showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {crud.editingItem ? 'Modifier un élève' : 'Ajouter un élève'}
            </h2>
            <form onSubmit={crud.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    required
                    value={crud.formData.prenom}
                    onChange={(e) => crud.setFormData({ ...crud.formData, prenom: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    required
                    value={crud.formData.nom}
                    onChange={(e) => crud.setFormData({ ...crud.formData, nom: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NiveauSelect
                  label="Niveau"
                  required
                  value={crud.formData.niveau}
                  onChange={(value) => crud.setFormData({ ...crud.formData, niveau: value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sexe</label>
                  <select
                    value={crud.formData.sexe}
                    onChange={(e) => crud.setFormData({ ...crud.formData, sexe: e.target.value })}
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
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: '#7EBEC5' }}
                >
                  {crud.editingItem ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={crud.handleCancel}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des élèves */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Niveau
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                  Sexe
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
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
                    <Badge variant="info">{eleve.niveau}</Badge>
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                    <div className="text-sm text-gray-500">
                      {eleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                    {eleve.actif ? (
                      <Badge variant="info">Actif</Badge>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        Archivé
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => crud.handleEdit(eleve)}
                      className="mr-3 hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ color: '#0C71C3' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleActif(eleve)}
                      className="mr-3 hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ color: '#4d8dc1' }}
                    >
                      {eleve.actif ? 'Archiver' : 'Réactiver'}
                    </button>
                    <button
                      onClick={() => crud.handleDelete(eleve, `⚠️ SUPPRIMER DÉFINITIVEMENT ${eleve.prenom} ${eleve.nom} ?`)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

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
