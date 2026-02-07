'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook qui force le scroll en haut de la page lors de la navigation
 * Détecte les changements de route et scroll automatiquement en haut
 * Utilise plusieurs méthodes pour garantir le scroll sur tous les navigateurs
 */
export function useScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Méthode 1: Scroll immédiat
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    // Méthode 2: Forcer aussi sur les éléments HTML et body
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }

    // Méthode 3: Délai pour s'assurer que le DOM est rendu
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [pathname])
}
