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
    <div className="flex gap-1 rounded-lg border p-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => handleChange(f.value)}
          className={
            'rounded px-3 py-1 text-sm transition-colors ' +
            (current === f.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100')
          }
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
