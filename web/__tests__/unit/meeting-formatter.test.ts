import { describe, it, expect } from 'vitest'
import { formatSeats } from '@/lib/utils/formatters'

describe('formatSeats', () => {
  it('форматирует "3 из 10 мест"', () => {
    expect(formatSeats(3, 10)).toBe('3 из 10 мест')
  })

  it('форматирует "0 из 5 мест"', () => {
    expect(formatSeats(0, 5)).toBe('0 из 5 мест')
  })

  it('форматирует когда taken === total: "5 из 5 мест"', () => {
    expect(formatSeats(5, 5)).toBe('5 из 5 мест')
  })
})
