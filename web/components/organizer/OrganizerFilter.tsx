'use client'

import { useRouter, usePathname } from 'next/navigation'

interface OrganizerFilterProps {
  current: string
}

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'past', label: 'Прошедшие' },
] as const

export function OrganizerFilter({ current }: OrganizerFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (value !== 'all') params.set('filter', value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: '#e5ddd0' }}>
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => handleChange(f.value)}
          className="rounded px-3 py-1.5 text-sm font-medium transition-colors"
          style={current === f.value
            ? { backgroundColor: '#1c1917', color: '#fff' }
            : { color: '#57534e' }
          }
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
