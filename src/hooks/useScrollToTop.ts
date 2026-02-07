'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook qui force le scroll en haut de la page lors de la navigation
 * Détecte les changements de route et scroll automatiquement en haut
 * Utile pour s'assurer que chaque page commence en haut sur mobile
 */
export function useScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}
