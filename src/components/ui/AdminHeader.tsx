interface AdminHeaderProps {
  title: string
  subtitle?: string
  variant?: 'blue' | 'turquoise'
  actions?: React.ReactNode
}

export function AdminHeader({
  title,
  subtitle,
  variant = 'blue',
  actions,
}: AdminHeaderProps) {
  return (
    <header
      style={{
        backgroundColor: 'var(--surface-institutional)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1
              className="text-xl sm:text-2xl md:text-3xl"
              style={{
                color: 'var(--text-inverse)',
                fontWeight: 'var(--font-bold)',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mt-1 text-sm"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 'var(--font-medium)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
