import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Моки (vi.hoisted — поднимаются до импортов) ───────────────────────────────

const { mockInsert, mockDelete, mockFrom } = vi.hoisted(() => {
  const mockInsert = vi.fn()
  const mockDelete = vi.fn()

  // Цепочки для from()
  const mockFrom = vi.fn()

  return { mockInsert, mockDelete, mockFrom }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

import {
  registerForMeeting,
  unregisterFromMeeting,
} from '@/lib/services/registrations'

// ── Хелперы ───────────────────────────────────────────────────────────────────

/** Цепочка for: .select(...).eq(...).single() */
function chainSingle(resolvedValue: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(resolvedValue),
      }),
    }),
  }
}

/** Цепочка for: .select(count).eq() → { count: N } */
function chainCount(count: number) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ count, error: null }),
    }),
  }
}

/** Цепочка for: .insert() */
function chainInsert(resolvedValue: unknown) {
  return {
    insert: vi.fn().mockResolvedValue(resolvedValue),
  }
}

/** Цепочка for: .delete().eq().eq() */
function chainDeleteEqEq(resolvedValue: unknown) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(resolvedValue),
      }),
    }),
  }
}

// ── Тесты ─────────────────────────────────────────────────────────────────────

describe('registerForMeeting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('создаёт запись при корректных данных', async () => {
    // 1. Встреча + клуб (is_active = true)
    mockFrom.mockReturnValueOnce(
      chainSingle({
        data: { id: 'meeting-1', seats_total: 10, club: { is_active: true } },
        error: null,
      })
    )
    // 2. COUNT регистраций → 5 (меньше seats_total)
    mockFrom.mockReturnValueOnce(chainCount(5))
    // 3. INSERT → success
    mockFrom.mockReturnValueOnce(chainInsert({ data: {}, error: null }))

    const result = await registerForMeeting('meeting-1', 'user-1')

    expect(result).toEqual({ ok: true })
  })

  it('возвращает error: duplicate при повторной записи', async () => {
    // 1. Встреча + клуб активен
    mockFrom.mockReturnValueOnce(
      chainSingle({
        data: { id: 'meeting-1', seats_total: 10, club: { is_active: true } },
        error: null,
      })
    )
    // 2. COUNT → 5
    mockFrom.mockReturnValueOnce(chainCount(5))
    // 3. INSERT → ошибка уникальности (код 23505)
    mockFrom.mockReturnValueOnce(
      chainInsert({ data: null, error: { code: '23505', message: 'duplicate key' } })
    )

    const result = await registerForMeeting('meeting-1', 'user-1')

    expect(result).toEqual({ ok: false, reason: 'duplicate' })
  })

  it('возвращает error: full если мест нет', async () => {
    // 1. Встреча + клуб активен, seats_total = 10
    mockFrom.mockReturnValueOnce(
      chainSingle({
        data: { id: 'meeting-1', seats_total: 10, club: { is_active: true } },
        error: null,
      })
    )
    // 2. COUNT → 10 (все места заняты)
    mockFrom.mockReturnValueOnce(chainCount(10))
    // INSERT не должен вызываться

    const result = await registerForMeeting('meeting-1', 'user-1')

    expect(result).toEqual({ ok: false, reason: 'full' })
  })

  it('возвращает error: inactive если клуб неактивен', async () => {
    // 1. Встреча + клуб НЕактивен
    mockFrom.mockReturnValueOnce(
      chainSingle({
        data: { id: 'meeting-1', seats_total: 10, club: { is_active: false } },
        error: null,
      })
    )

    const result = await registerForMeeting('meeting-1', 'user-1')

    expect(result).toEqual({ ok: false, reason: 'inactive' })
  })
})

describe('unregisterFromMeeting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('удаляет свою запись', async () => {
    // DELETE → count = 1
    mockFrom.mockReturnValueOnce(
      chainDeleteEqEq({ data: null, error: null, count: 1 })
    )

    const result = await unregisterFromMeeting('meeting-1', 'user-1')

    expect(result).toEqual({ ok: true })
  })

  it('возвращает error: forbidden при попытке удалить чужую запись', async () => {
    // DELETE → count = 0 (запись не нашлась)
    mockFrom.mockReturnValueOnce(
      chainDeleteEqEq({ data: null, error: null, count: 0 })
    )

    const result = await unregisterFromMeeting('meeting-1', 'user-2')

    expect(result).toEqual({ ok: false, reason: 'forbidden' })
  })
})
