import Link from 'next/link'

type GradientVariant = 'blue' | 'blue-reverse' | 'turquoise'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  variant?: GradientVariant
  showBackLink?: boolean
  backHref?: string
  actions?: React.ReactNode
}

const GRADIENTS: Record<GradientVariant, string> = {
  blue: 'linear-gradient(to right, #0C71C3, #4d8dc1)',
  'blue-reverse': 'linear-gradient(to right, #4d8dc1, #0C71C3)',
  turquoise: 'linear-gradient(to right, #7EBEC5, #4d8dc1)',
}

export function AdminHeader({
  title,
  subtitle,
  variant = 'blue',
  showBackLink = true,
  backHref = '/admin/dashboard',
  actions,
}: AdminHeaderProps) {
  return (
    <header className="shadow-lg" style={{ background: GRADIENTS[variant] }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            {showBackLink && (
              <Link
                href={backHref}
                className="mb-2 inline-block text-sm text-white/80 hover:text-white"
              >
                ← Retour au dashboard
              </Link>
            )}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
