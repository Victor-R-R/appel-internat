type GradientVariant = 'blue' | 'turquoise'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  variant?: GradientVariant
  actions?: React.ReactNode
}

const GRADIENTS: Record<GradientVariant, string> = {
  blue: 'linear-gradient(to right, #0C71C3, #4d8dc1)',
  turquoise: 'linear-gradient(to right, #7EBEC5, #4d8dc1)',
}

export function AdminHeader({
  title,
  subtitle,
  variant = 'blue',
  actions,
}: AdminHeaderProps) {
  return (
    <header className="shadow-lg" style={{ background: GRADIENTS[variant] }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
