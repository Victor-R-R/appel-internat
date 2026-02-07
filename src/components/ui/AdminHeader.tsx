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
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}
          </div>
          {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3 md:gap-4">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
