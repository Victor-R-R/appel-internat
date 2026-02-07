interface AppelStatsProps {
  total: number
  presents: number
}

export function AppelStats({ total, presents }: AppelStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm font-medium text-gray-500">Total élèves</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm font-medium text-gray-500">Présents</p>
        <p className="mt-1 text-2xl font-bold" style={{ color: '#7EBEC5' }}>
          {presents}
        </p>
      </div>
    </div>
  )
}
