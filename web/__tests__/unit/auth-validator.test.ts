import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validators/auth'

describe('loginSchema', () => {
  it('принимает корректные данные', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('отклоняет некорректный email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('отклоняет пустой пароль', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Иван',
    email: 'user@example.com',
    password: '12345678',
    confirmPassword: '12345678',
  }

  it('принимает корректные данные', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('отклоняет пустое имя', () => {
    const result = registerSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((e) => e.message)
    expect(messages).toContain('Введите имя')
  })

  it('отклоняет пароль короче 8 символов', () => {
    const result = registerSchema.safeParse({ ...valid, password: '1234567', confirmPassword: '1234567' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((e) => e.message)
    expect(messages).toContain('Пароль — минимум 8 символов')
  })

  it('отклоняет несовпадающие пароли', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'other123' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((e) => e.message)
    expect(messages).toContain('Пароли не совпадают')
  })

  it('граница: ровно 8 символов — валидно', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('граница: 7 символов — невалидно', () => {
    const result = registerSchema.safeParse({ ...valid, password: '1234567', confirmPassword: '1234567' })
    expect(result.success).toBe(false)
  })

  it('отклоняет пустой email', () => {
    const result = registerSchema.safeParse({ ...valid, email: '' })
    expect(result.success).toBe(false)
  })
})
