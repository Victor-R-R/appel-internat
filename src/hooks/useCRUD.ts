import { useState } from 'react'

interface UseCRUDOptions<T, F> {
  /** API path (e.g., '/api/admin/aed') */
  apiPath: string
  /** Key in API response containing items array (e.g., 'aeds', 'eleves') */
  dataKey: string
  /** Initial form data */
  initialFormData: F
  /** Function to map item to form data for editing */
  itemToFormData: (item: T) => F
  /** Entity name for success messages (e.g., 'AED', 'Élève') */
  entityName: string
  /** Callback after successful load */
  onLoadSuccess: (items: T[]) => void
  /** Whether to scroll to top when editing (default: true) */
  scrollOnEdit?: boolean
}

interface UseCRUDReturn<T, F> {
  // State
  showForm: boolean
  editingItem: T | null
  formData: F
  loading: boolean

  // Form handlers
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleCreate: () => void
  handleEdit: (item: T) => void
  handleDelete: (item: T, confirmMessage: string) => Promise<void>
  handleCancel: () => void

  // Setters
  setFormData: React.Dispatch<React.SetStateAction<F>>
  reloadItems: () => Promise<void>
}

/**
 * Generic CRUD hook for admin forms
 * Handles common patterns: create, read, update, delete operations
 */
export function useCRUD<T extends { id: number | string }, F>(
  options: UseCRUDOptions<T, F>
): UseCRUDReturn<T, F> {
  const {
    apiPath,
    dataKey,
    initialFormData,
    itemToFormData,
    entityName,
    onLoadSuccess,
    scrollOnEdit = true,
  } = options

  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<F>(initialFormData)

  const reloadItems = async () => {
    try {
      const response = await fetch(apiPath)
      const data = await response.json()

      if (data.success && data[dataKey]) {
        onLoadSuccess(data[dataKey])
      }
    } catch (error) {
      console.error(`Erreur chargement ${entityName}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingItem ? `${apiPath}/${editingItem.id}` : apiPath
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(editingItem ? `✅ ${entityName} modifié` : `✅ ${entityName} créé`)
        setShowForm(false)
        setEditingItem(null)
        setFormData(initialFormData)
        await reloadItems()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setFormData(initialFormData)
    setShowForm(true)
    if (scrollOnEdit) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleEdit = (item: T) => {
    setEditingItem(item)
    setFormData(itemToFormData(item))
    setShowForm(true)
    if (scrollOnEdit) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (item: T, confirmMessage: string) => {
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`${apiPath}/${item.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ ${entityName} supprimé`)
        await reloadItems()
      } else {
        alert('❌ Erreur : ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur de connexion')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData(initialFormData)
  }

  return {
    // State
    showForm,
    editingItem,
    formData,
    loading,

    // Handlers
    handleSubmit,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCancel,

    // Setters
    setFormData,
    reloadItems,
  }
}
