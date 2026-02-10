import type { Role } from '@/lib/constants'

type BadgeVariant = 'present' | 'acf' | 'absent' | 'info'
type RoleBadgeVariant = 'superadmin' | 'aed' | 'admin'

interface BadgeProps {
  variant?: BadgeVariant
  role?: RoleBadgeVariant | Role
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, role, children, className = '' }: BadgeProps) {
  // Role badge - style institutionnel
  if (role) {
    const roleKey = role.toLowerCase() as RoleBadgeVariant
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold ${className}`}
        style={{
          backgroundColor: 'var(--institutional-light)',
          color: 'var(--institutional)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--institutional)',
        }}
      >
        {children}
      </span>
    )
  }

  // Status badge - couleurs sémantiques
  const variantStyles = {
    present: {
      backgroundColor: 'var(--success-light)',
      color: 'var(--success)',
      border: '1px solid var(--success-border)',
    },
    acf: {
      backgroundColor: 'var(--warning-light)',
      color: 'var(--warning)',
      border: '1px solid var(--warning-border)',
    },
    absent: {
      backgroundColor: 'var(--error-light)',
      color: 'var(--error)',
      border: '1px solid var(--error-border)',
    },
    info: {
      backgroundColor: 'var(--institutional-light)',
      color: 'var(--institutional)',
      border: '1px solid var(--border-standard)',
    },
  }

  const style = variantStyles[variant || 'info']

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium ${className}`}
      style={{
        ...style,
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {children}
    </span>
  )
}
