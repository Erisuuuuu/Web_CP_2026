import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Мок Supabase server client ────────────────────────────────────────────────
// vi.mock поднимается в начало файла, поэтому фабрика не может ссылаться
// на переменные, объявленные после. Используем vi.hoisted для создания моков.

const { mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({
    eq: mockEq,
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))

  return { mockSingle, mockFrom }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

import { getAllUsers, getAllClubsAdmin } from '@/lib/services/admin'

// ── Тесты ─────────────────────────────────────────────────────────────────────

describe('getAllUsers — проверка роли', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('admin получает доступ — error === null', async () => {
    // checkAdmin: profiles → role = 'admin'
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
        }),
      }),
    })
    // getAllUsers: profiles → []
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    const result = await getAllUsers('admin-user-id')

    expect(result.error).toBeNull()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('member получает forbidden — { data: null, error: "forbidden" }', async () => {
    // checkAdmin: profiles → role = 'member'
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }),
        }),
      }),
    })

    const result = await getAllUsers('member-user-id')

    expect(result.data).toBeNull()
    expect(result.error).toBe('forbidden')
  })
})

describe('getAllClubsAdmin — проверка роли', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('admin получает доступ к клубам — error === null', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    const result = await getAllClubsAdmin('admin-user-id')

    expect(result.error).toBeNull()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('member не получает доступ к клубам — { data: null, error: "forbidden" }', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }),
        }),
      }),
    })

    const result = await getAllClubsAdmin('member-user-id')

    expect(result.data).toBeNull()
    expect(result.error).toBe('forbidden')
  })
})
