import { describe, it, expect } from 'vitest'
import { meetingFilterSchema } from '@/lib/validators/meeting'

describe('meetingFilterSchema', () => {
  it('парсит валидный фильтр с cefr (массив) и from', () => {
    const result = meetingFilterSchema.safeParse({
      cefr: ['B1'],
      from: '2026-01-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cefr).toEqual(['B1'])
      expect(result.data.from).toBe('2026-01-01')
    }
  })

  it('парсит несколько уровней cefr', () => {
    const result = meetingFilterSchema.safeParse({ cefr: ['B1', 'B2', 'C1'] })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cefr).toEqual(['B1', 'B2', 'C1'])
    }
  })

  it('отклоняет невалидный cefr в массиве', () => {
    const result = meetingFilterSchema.safeParse({ cefr: ['D5'] })
    expect(result.success).toBe(false)
  })

  it('пустой объект — все поля optional, результат {}', () => {
    const result = meetingFilterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({})
    }
  })

  it('partial parse: без cefr — только from', () => {
    const result = meetingFilterSchema.safeParse({ from: '2026-01-01' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.from).toBe('2026-01-01')
      expect(result.data.cefr).toBeUndefined()
    }
  })
})
