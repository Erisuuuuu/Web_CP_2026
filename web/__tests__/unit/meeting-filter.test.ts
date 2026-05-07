import { describe, it, expect } from 'vitest'
import { meetingFilterSchema } from '@/lib/validators/meeting'

describe('meetingFilterSchema', () => {
  it('парсит валидный фильтр с cefr и from', () => {
    const result = meetingFilterSchema.safeParse({
      cefr: 'B1',
      from: '2026-01-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cefr).toBe('B1')
      expect(result.data.from).toBe('2026-01-01')
    }
  })

  it('отклоняет невалидный cefr', () => {
    const result = meetingFilterSchema.safeParse({ cefr: 'D5' })
    expect(result.success).toBe(false)
  })

  it('пустой объект — все поля optional, результат {}', () => {
    const result = meetingFilterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({})
    }
  })

  it('partial parse: берём только валидные поля через strip', () => {
    // meetingFilterSchema не делает partial сам по себе,
    // но при невалидном cefr safeParse возвращает error — игнорируем его
    const raw = { cefr: 'INVALID', from: '2026-01-01' }
    const result = meetingFilterSchema.safeParse(raw)
    // При невалидном cefr схема вернёт ошибку
    expect(result.success).toBe(false)

    // Partial-вариант: передаём только валидные поля
    const partialRaw = { from: raw.from }
    const partialResult = meetingFilterSchema.safeParse(partialRaw)
    expect(partialResult.success).toBe(true)
    if (partialResult.success) {
      expect(partialResult.data.from).toBe('2026-01-01')
      expect(partialResult.data.cefr).toBeUndefined()
    }
  })
})
