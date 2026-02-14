/**
 * Hook personnalisé pour gérer l'authentification côté client
 * Utilise SWR pour deduplication automatique et caching
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { UserDTO } from '@/lib/types'

export function useAuth(options?: { redirectTo?: string; requireAuth?: boolean }) {
  const router = useRouter()

  // SWR déduplique automatiquement les appels multiples à /api/auth/me
  const { data, error, isLoading } = useSWR<{ success: boolean; user: UserDTO }>(
    '/api/auth/me',
    fetcher,
    {
      revalidateOnFocus: false, // Ne pas revalider au focus (évite les appels inutiles)
      revalidateOnReconnect: true, // Revalider à la reconnexion
      dedupingInterval: 5000, // Déduplique les appels pendant 5s
    }
  )

  const user = data?.user || null

  useEffect(() => {
    // Si authentification requise et pas d'user, rediriger
    if (!isLoading && options?.requireAuth && !user && options?.redirectTo) {
      router.push(options.redirectTo)
    }
  }, [isLoading, user, options?.requireAuth, options?.redirectTo, router])

  return {
    user,
    loading: isLoading,
    error: error ? 'Erreur de connexion' : null,
  }
}

/**
 * Hook pour déconnexion
 */
export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  return logout
}
