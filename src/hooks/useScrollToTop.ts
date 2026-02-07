'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook optimisé pour scroll en haut sur mobile
 * Utilise requestAnimationFrame + délai pour mobile
 */
export function useScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Fonction de scroll simple et robuste
    const scrollToTop = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Scroll immédiat
    scrollToTop()

    // Délai pour mobile (barre d'adresse + rendu DOM)
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToTop()
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])
}
