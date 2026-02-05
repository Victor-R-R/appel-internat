/**
 * Hook personnalisé pour gérer l'authentification côté client
 * Récupère les infos utilisateur depuis le JWT cookie via /api/auth/me
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  role: string
  niveau?: string | null
  sexeGroupe?: string | null
}

export function useAuth(options?: { redirectTo?: string; requireAuth?: boolean }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()

        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
          // Si authentification requise et pas d'user, rediriger
          if (options?.requireAuth && options?.redirectTo) {
            router.push(options.redirectTo)
          }
        }
      } catch (err) {
        console.error('Erreur récupération user:', err)
        setError('Erreur de connexion')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, options?.requireAuth, options?.redirectTo])

  return { user, loading, error, setUser }
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
