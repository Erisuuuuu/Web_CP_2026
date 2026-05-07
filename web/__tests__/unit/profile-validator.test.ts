import { describe, it, expect } from 'vitest'
import { profileSchema } from '@/lib/validators/profile'

describe('profileSchema', () => {
  it('принимает валидные данные', () => {
    const result = profileSchema.safeParse({
      name: 'Иван',
      bio: 'Люблю языки',
      cefr_level: 'B2',
    })
    expect(result.success).toBe(true)
  })

  it('отклоняет пустое имя', () => {
    const result = profileSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((e) => e.message)
    expect(messages).toContain('Имя обязательно')
  })

  it('отклоняет невалидный cefr_level', () => {
    const result = profileSchema.safeParse({ name: 'Иван', cefr_level: 'D1' })
    expect(result.success).toBe(false)
    expect(result.error?.issues.length).toBeGreaterThan(0)
  })

  it('принимает данные без bio (опциональное)', () => {
    const result = profileSchema.safeParse({ name: 'Иван' })
    expect(result.success).toBe(true)
  })

  it('принимает данные без cefr_level (опциональное)', () => {
    const result = profileSchema.safeParse({ name: 'Иван', bio: 'Привет' })
    expect(result.success).toBe(true)
  })
})
