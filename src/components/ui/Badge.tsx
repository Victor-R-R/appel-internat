import type { Role } from '@/lib/constants'

type BadgeVariant = 'present' | 'acf' | 'absent' | 'info'
type RoleBadgeVariant = 'superadmin' | 'aed' | 'admin'

interface BadgeProps {
  variant?: BadgeVariant
  role?: RoleBadgeVariant | Role
  children: React.ReactNode
  className?: string
}

const ROLE_STYLES: Record<RoleBadgeVariant, { bg: string; text: string }> = {
  superadmin: { bg: '#0C71C3', text: 'white' },
  admin: { bg: '#4d8dc1', text: 'white' },
  aed: { bg: '#7EBEC5', text: 'white' },
}

export function Badge({ variant, role, children, className = '' }: BadgeProps) {
  // Role badge
  if (role) {
    const roleKey = role.toLowerCase() as RoleBadgeVariant
    const style = ROLE_STYLES[roleKey] || ROLE_STYLES.aed
    return (
      <span
        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${className}`}
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {children}
      </span>
    )
  }

  // Status badge
  const styles = {
    present: 'text-white',
    acf: 'text-white',
    absent: 'bg-red-600 text-white',
    info: '',
  }

  const bgStyles = {
    present: { backgroundColor: '#7EBEC5' },
    acf: { backgroundColor: '#4d8dc1' },
    absent: {},
    info: { backgroundColor: '#e2e5ed', color: '#7EBEC5' },
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        styles[variant || 'info']
      } ${className}`}
      style={bgStyles[variant || 'info']}
    >
      {children}
    </span>
  )
}
