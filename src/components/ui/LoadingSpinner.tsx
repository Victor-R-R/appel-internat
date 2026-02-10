export function LoadingSpinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-solid"
          style={{
            borderColor: 'var(--border-subtle)',
            borderTopColor: 'var(--institutional)',
          }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Chargement...
        </p>
      </div>
    </div>
  )
}
