interface AppelStatsProps {
  total: number
  presents: number
}

export function AppelStats({ total, presents }: AppelStatsProps) {
  const absents = total - presents

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Total élèves */}
      <div
        className="p-4"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Total élèves
        </p>
        <p
          className="mt-1 text-3xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {total}
        </p>
      </div>

      {/* Présents */}
      <div
        className="p-4"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Présents
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p
            className="text-3xl font-bold"
            style={{ color: 'var(--success)' }}
          >
            {presents}
          </p>
          {absents > 0 && (
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--error)' }}
            >
              ({absents} absent{absents > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
