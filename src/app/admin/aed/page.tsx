'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCRUD } from '@/hooks/useCRUD'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { NiveauSelect } from '@/components/forms/NiveauSelect'
import type { UserDTO } from '@/lib/types'

// Extension locale avec nom/prenom requis pour l'interface admin
type AED = UserDTO & {
  nom: string
  prenom: string
}

type AEDFormData = {
  email: string
  password: string
  nom: string
  prenom: string
  niveau: string
  sexeGroupe: string
  role: string
}

const INITIAL_FORM_DATA: AEDFormData = {
  email: '',
  password: '',
  nom: '',
  prenom: '',
  niveau: '6eme',
  sexeGroupe: 'F',
  role: 'aed',
}

const ROLE_LABELS: Record<string, string> = {
  aed: 'AED',
  cpe: 'CPE',
  manager: 'Manager',
  superadmin: 'Superadmin',
}

export default function GestionAEDPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const [aeds, setAEDs] = useState<AED[]>([])

  const crud = useCRUD<AED, AEDFormData>({
    apiPath: '/api/admin/aed',
    dataKey: 'aeds',
    initialFormData: INITIAL_FORM_DATA,
    itemToFormData: (aed) => ({
      email: aed.email,
      password: '', // Ne pas pré-remplir le mot de passe
      nom: aed.nom,
      prenom: aed.prenom,
      niveau: aed.niveau || '6eme',
      sexeGroupe: aed.sexeGroupe || 'F',
      role: aed.role || 'aed',
    }),
    entityName: 'AED',
    onLoadSuccess: setAEDs,
    scrollOnEdit: true,
  })

  useEffect(() => {
    if (authLoading) return

    // Seul Superadmin peut gérer les utilisateurs
    if (user && user.role !== 'superadmin') {
      alert('⛔ Accès réservé aux Superadmins')
      router.push('/admin/dashboard')
      return
    }

    if (user) {
      crud.reloadItems()
    }
  }, [user, authLoading, router])

  if (authLoading || crud.loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="👥 Gestion des utilisateurs"
        subtitle={`${aeds.length} utilisateur${aeds.length > 1 ? 's' : ''} enregistré${aeds.length > 1 ? 's' : ''}`}
        variant="blue"
        actions={
          <button
            onClick={crud.handleCreate}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold hover:bg-white/90 transition-all cursor-pointer"
            style={{ color: '#0C71C3' }}
          >
            + Ajouter un utilisateur
          </button>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Formulaire */}
        {crud.showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {crud.editingItem ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={crud.formData.email}
                  onChange={(e) => crud.setFormData({ ...crud.formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe {crud.editingItem && '(laisser vide pour ne pas changer)'}
                </label>
                <input
                  type="password"
                  required={!crud.editingItem}
                  value={crud.formData.password}
                  onChange={(e) => crud.setFormData({ ...crud.formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder={crud.editingItem ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={crud.formData.role}
                  onChange={(e) => crud.setFormData({ ...crud.formData, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="aed">AED (Assistant d'Éducation)</option>
                  <option value="cpe">CPE (Conseiller Principal d'Éducation)</option>
                  <option value="manager">Manager</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {crud.formData.role === 'aed' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NiveauSelect
                    label="Niveau"
                    value={crud.formData.niveau}
                    onChange={(value) => crud.setFormData({ ...crud.formData, niveau: value })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Groupe</label>
                    <select
                      value={crud.formData.sexeGroupe}
                      onChange={(e) => crud.setFormData({ ...crud.formData, sexeGroupe: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    >
                      <option value="F">Filles</option>
                      <option value="M">Garçons</option>
                    </select>
                  </div>
                </div>
              )}

              {['cpe', 'manager', 'superadmin'].includes(crud.formData.role) && (
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    ℹ️ Les {crud.formData.role === 'cpe' ? 'CPE' : crud.formData.role === 'manager' ? 'Managers' : 'Superadmins'} ont accès à tous les niveaux et groupes.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary rounded-md px-4 py-2 text-sm font-semibold text-white transition-all cursor-pointer"
                  style={{ backgroundColor: '#0C71C3' }}
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

        {/* Liste des utilisateurs */}
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
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Niveau / Groupe
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
                    <Badge role={aed.role as any}>
                      {ROLE_LABELS[aed.role] || aed.role}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {aed.role === 'aed' ? (
                      <Badge variant="info">
                        {aed.niveau} {aed.sexeGroupe ? (aed.sexeGroupe === 'F' ? 'Filles' : 'Garçons') : '⚠️ Non configuré'}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Tous niveaux</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => crud.handleEdit(aed)}
                      className="mr-3 hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ color: '#0C71C3' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => crud.handleDelete(aed, `Supprimer ${aed.prenom} ${aed.nom} ?`)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
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
              <p className="text-gray-500">Aucun utilisateur enregistré</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
