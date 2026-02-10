import Link from 'next/link'

type ButtonVariant = 'secondary' | 'primary'

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

const baseClasses = 'px-3 py-1.5 text-xs font-medium cursor-pointer sm:px-4 sm:py-2 sm:text-sm'

/**
 * Bouton de type Link (navigation)
 * Usage: Retour au dashboard
 */
export function HeaderLinkButton({ href, variant = 'secondary', children, className = '' }: LinkButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <Link
      href={href}
      className={`${baseClasses} ${className}`}
      style={{
        backgroundColor: isPrimary ? 'var(--surface-card)' : 'rgba(255, 255, 255, 0.15)',
        color: isPrimary ? 'var(--institutional)' : 'var(--text-inverse)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: isPrimary ? 'var(--font-semibold)' : 'var(--font-medium)',
        border: isPrimary ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(255, 255, 255, 0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary
          ? 'var(--surface-card)'
          : 'rgba(255, 255, 255, 0.15)'
      }}
    >
      {children}
    </Link>
  )
}

/**
 * Bouton avec action (onClick)
 * Usage: Déconnexion, Ajouter un utilisateur/élève
 */
export function HeaderActionButton({ onClick, variant = 'secondary', children, className = '' }: ActionButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      style={{
        backgroundColor: isPrimary ? 'var(--surface-card)' : 'rgba(255, 255, 255, 0.15)',
        color: isPrimary ? 'var(--institutional)' : 'var(--text-inverse)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: isPrimary ? 'var(--font-semibold)' : 'var(--font-medium)',
        border: isPrimary ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(255, 255, 255, 0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary
          ? 'var(--surface-card)'
          : 'rgba(255, 255, 255, 0.15)'
      }}
    >
      {children}
    </button>
  )
}
