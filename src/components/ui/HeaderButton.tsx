import Link from 'next/link'

// ============================================
// TYPES DE BOUTONS
// ============================================

type ButtonVariant = 'secondary' | 'primary-blue' | 'primary-turquoise'

interface BaseButtonProps {
  variant?: ButtonVariant
  children: React.ReactNode
  className?: string
}

interface LinkButtonProps extends BaseButtonProps {
  href: string
}

interface ActionButtonProps extends BaseButtonProps {
  onClick: () => void
}

// ============================================
// STYLES DE BASE
// ============================================

const BASE_CLASSES = 'rounded-md px-4 py-2 text-sm font-medium transition-all cursor-pointer'

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  // Boutons transparents (Retour, Déconnexion)
  secondary: `${BASE_CLASSES} bg-white/20 text-white hover:bg-white/30`,

  // Boutons primaires avec fond blanc
  'primary-blue': `${BASE_CLASSES} bg-white font-semibold text-[#0C71C3] hover:bg-white/90`,
  'primary-turquoise': `${BASE_CLASSES} bg-white font-semibold text-[#7EBEC5] hover:bg-white/90`,
}

// ============================================
// COMPOSANTS
// ============================================

/**
 * Bouton de type Link (navigation)
 * Usage: Retour au dashboard
 */
export function HeaderLinkButton({ href, variant = 'secondary', children, className = '' }: LinkButtonProps) {
  return (
    <Link href={href} className={`${VARIANT_STYLES[variant]} ${className}`}>
      {children}
    </Link>
  )
}

/**
 * Bouton avec action (onClick)
 * Usage: Déconnexion, Ajouter un utilisateur/élève
 */
export function HeaderActionButton({ onClick, variant = 'secondary', children, className = '' }: ActionButtonProps) {
  return (
    <button onClick={onClick} className={`${VARIANT_STYLES[variant]} ${className}`}>
      {children}
    </button>
  )
}
