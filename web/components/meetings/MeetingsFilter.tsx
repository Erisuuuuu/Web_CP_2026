'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { CefrLevel } from '@/lib/types'

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface MeetingsFilterProps {
  defaultValue?: CefrLevel
}

export default function MeetingsFilter({ defaultValue }: MeetingsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cefr, setCefr] = useState<CefrLevel | ''>( defaultValue ?? '')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (cefr) {
      params.set('cefr', cefr)
    } else {
      params.delete('cefr')
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="cefr-filter" className="text-sm font-medium text-gray-700">
          Уровень CEFR
        </label>
        <select
          id="cefr-filter"
          value={cefr}
          onChange={(e) => setCefr(e.target.value as CefrLevel | '')}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Все уровни</option>
          {CEFR_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Фильтровать
      </button>
    </form>
  )
}
