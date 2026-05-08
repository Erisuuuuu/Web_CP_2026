'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { CefrLevel } from '@/lib/types'

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface MeetingsFilterProps {
  defaultCefr?: CefrLevel[]
  defaultFrom?: string
  defaultTo?: string
}

export default function MeetingsFilter({ defaultCefr = [], defaultFrom, defaultTo }: MeetingsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<CefrLevel[]>(defaultCefr)
  const [from, setFrom] = useState(defaultFrom ?? '')
  const [to, setTo] = useState(defaultTo ?? '')

  function apply(levels: CefrLevel[], newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('cefr')
    levels.forEach((l) => params.append('cefr', l))
    if (newFrom) params.set('from', newFrom); else params.delete('from')
    if (newTo) params.set('to', newTo); else params.delete('to')
    router.push(`?${params.toString()}`)
  }

  function handleToggle(level: CefrLevel) {
    const next = selected.includes(level)
      ? selected.filter((l) => l !== level)
      : [...selected, level]
    setSelected(next)
    apply(next, from, to)
  }

  function handleReset() {
    setSelected([])
    setFrom('')
    setTo('')
    router.push('?')
  }

  const labelStyle: React.CSSProperties = {
    color: '#78716c', fontSize: '0.7rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }
  const inputStyle: React.CSSProperties = {
    border: '1px solid #d6cdc0', color: '#1c1917', backgroundColor: '#fff',
    borderRadius: '0.5rem', padding: '0.375rem 0.5rem', fontSize: '0.8rem',
    width: '100%', outline: 'none',
  }

  return (
    <div className="space-y-5">
      <p style={{ ...labelStyle, fontSize: '0.75rem' }}>Фильтры</p>

      <div>
        <p className="mb-2" style={labelStyle}>Уровень CEFR</p>
        <div className="flex flex-wrap gap-1.5">
          {CEFR_LEVELS.map((level) => {
            const active = selected.includes(level)
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleToggle(level)}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors"
                style={active
                  ? { backgroundColor: '#1c1917', color: '#fff', borderColor: '#1c1917' }
                  : { backgroundColor: '#fff', color: '#57534e', borderColor: '#d6cdc0' }
                }
              >
                {level}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block mb-1" style={labelStyle}>Дата от</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          onBlur={() => apply(selected, from, to)} style={inputStyle} />
      </div>

      <div>
        <label className="block mb-1" style={labelStyle}>Дата до</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          onBlur={() => apply(selected, from, to)} style={inputStyle} />
      </div>

      <button type="button" onClick={handleReset}
        className="w-full rounded-lg py-1.5 text-sm border transition-colors hover:bg-stone-50"
        style={{ borderColor: '#d6cdc0', color: '#78716c' }}>
        Сбросить фильтры
      </button>
    </div>
  )
}
