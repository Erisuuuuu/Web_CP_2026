import { describe, it, expect } from 'vitest'
import { generateCSV } from '@/lib/utils/csv'
import type { CsvRow } from '@/lib/utils/csv'

describe('generateCSV', () => {
  it('пустой массив → только header', () => {
    const result = generateCSV([])
    expect(result).toBe('name,email,cefr_level,registered_at')
  })

  it('базовый случай — одна строка → корректный CSV с header', () => {
    const rows: CsvRow[] = [
      {
        name: 'Ivan Ivanov',
        email: 'ivan@example.com',
        cefr_level: 'B2',
        registered_at: '2026-05-01T12:00:00Z',
      },
    ]
    const result = generateCSV(rows)
    expect(result).toBe(
      'name,email,cefr_level,registered_at\nIvan Ivanov,ivan@example.com,B2,2026-05-01T12:00:00Z'
    )
  })

  it('поле с запятой → оборачивается в кавычки', () => {
    const rows: CsvRow[] = [
      {
        name: 'Smith, John',
        email: 'john@example.com',
        cefr_level: 'A1',
        registered_at: '2026-05-01T10:00:00Z',
      },
    ]
    const result = generateCSV(rows)
    const lines = result.split('\n')
    // Первая строка — header
    expect(lines[0]).toBe('name,email,cefr_level,registered_at')
    // Имя обёрнуто в кавычки
    expect(lines[1]).toBe('"Smith, John",john@example.com,A1,2026-05-01T10:00:00Z')
  })

  it('поле с кавычкой → " эскейпится как ""', () => {
    const rows: CsvRow[] = [
      {
        name: 'Say "Hello"',
        email: 'hello@example.com',
        cefr_level: 'C1',
        registered_at: '2026-05-02T09:00:00Z',
      },
    ]
    const result = generateCSV(rows)
    const lines = result.split('\n')
    expect(lines[1]).toBe('"Say ""Hello""",hello@example.com,C1,2026-05-02T09:00:00Z')
  })

  it('несколько строк → корректный порядок и разделитель', () => {
    const rows: CsvRow[] = [
      { name: 'Alice', email: 'alice@example.com', cefr_level: 'B1', registered_at: '2026-01-01T00:00:00Z' },
      { name: 'Bob', email: 'bob@example.com', cefr_level: 'A2', registered_at: '2026-01-02T00:00:00Z' },
    ]
    const result = generateCSV(rows)
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('name,email,cefr_level,registered_at')
    expect(lines[1]).toBe('Alice,alice@example.com,B1,2026-01-01T00:00:00Z')
    expect(lines[2]).toBe('Bob,bob@example.com,A2,2026-01-02T00:00:00Z')
  })
})
