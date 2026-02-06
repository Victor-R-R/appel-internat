import { NIVEAUX } from '@/lib/constants'

interface NiveauSelectProps {
  value: string
  onChange: (value: string) => void
  includeAll?: boolean
  label?: string
  required?: boolean
  className?: string
}

export function NiveauSelect({
  value,
  onChange,
  includeAll = false,
  label,
  required = false,
  className = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900',
}: NiveauSelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={className}
      >
        {includeAll && <option value="tous">Tous les niveaux</option>}
        {NIVEAUX.map((niveau) => (
          <option key={niveau} value={niveau}>
            {niveau === 'Term' ? 'Terminale' : niveau}
          </option>
        ))}
      </select>
    </div>
  )
}
