'use client'

import { useEffect } from 'react'

/**
 * Hook qui force le scroll en haut de la page au montage du composant
 * Utile pour s'assurer que chaque page commence en haut sur mobile
 */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}
