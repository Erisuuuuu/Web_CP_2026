import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Моки (vi.hoisted — поднимаются до импортов) ───────────────────────────────

const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn()
  return { mockFrom }
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

/** .select().eq().single() → resolvedValue */
function chainSingle(resolvedValue: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(resolvedValue),
      }),
    }),
  }
}

/** .insert() → resolvedValue */
function chainInsert(resolvedValue: unknown) {
  return {
    insert: vi.fn().mockResolvedValue(resolvedValue),
  }
}

/** .delete().eq().eq() → resolvedValue */
function chainDeleteEqEq(resolvedValue: unknown) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(resolvedValue),
      }),
    }),
  }
}

// ── Тесты: registerForMeeting ─────────────────────────────────────────────────
// Логика: 1) fetch meeting (seats_total, seats_taken, club.is_active)
//         2) если нет мест → full; если клуб неактивен → inactive
//         3) INSERT; при 23505 → duplicate

describe('registerForMeeting', () => {
  beforeEach(() => vi.clearAllMocks())

  it('создаёт запись при корректных данных', async () => {
    // 1. Встреча активна, 5 из 10 мест занято
    mockFrom.mockReturnValueOnce(
      chainSingle({ data: { id: 'meeting-1', seats_total: 10, seats_taken: 5, club: { is_active: true } }, error: null })
    )
    // 2. INSERT → success
    mockFrom.mockReturnValueOnce(chainInsert({ data: {}, error: null }))

    const result = await registerForMeeting('meeting-1', 'user-1')
    expect(result).toEqual({ ok: true })
  })

  it('возвращает error: full если мест нет', async () => {
    // seats_taken === seats_total → full
    mockFrom.mockReturnValueOnce(
      chainSingle({ data: { id: 'meeting-1', seats_total: 10, seats_taken: 10, club: { is_active: true } }, error: null })
    )

    const result = await registerForMeeting('meeting-1', 'user-1')
    expect(result).toEqual({ ok: false, reason: 'full' })
  })

  it('возвращает error: inactive если клуб неактивен', async () => {
    mockFrom.mockReturnValueOnce(
      chainSingle({ data: { id: 'meeting-1', seats_total: 10, seats_taken: 0, club: { is_active: false } }, error: null })
    )

    const result = await registerForMeeting('meeting-1', 'user-1')
    expect(result).toEqual({ ok: false, reason: 'inactive' })
  })

  it('возвращает error: inactive если встреча не найдена', async () => {
    mockFrom.mockReturnValueOnce(
      chainSingle({ data: null, error: { message: 'not found' } })
    )

    const result = await registerForMeeting('meeting-1', 'user-1')
    expect(result).toEqual({ ok: false, reason: 'inactive' })
  })

  it('возвращает error: duplicate при повторной записи (код 23505)', async () => {
    mockFrom.mockReturnValueOnce(
      chainSingle({ data: { id: 'meeting-1', seats_total: 10, seats_taken: 5, club: { is_active: true } }, error: null })
    )
    mockFrom.mockReturnValueOnce(
      chainInsert({ data: null, error: { code: '23505', message: 'duplicate key' } })
    )

    const result = await registerForMeeting('meeting-1', 'user-1')
    expect(result).toEqual({ ok: false, reason: 'duplicate' })
  })
})

// ── Тесты: unregisterFromMeeting ──────────────────────────────────────────────
// Логика: DELETE .eq(meeting_id).eq(user_id)
//         нет ошибки → ok; есть ошибка (RLS) → forbidden

describe('unregisterFromMeeting', () => {
  beforeEach(() => vi.clearAllMocks())

  it('удаляет свою запись', async () => {
    mockFrom.mockReturnValueOnce(
      chainDeleteEqEq({ data: null, error: null })
    )

    const result = await unregisterFromMeeting('meeting-1', 'user-1')
    expect(result).toEqual({ ok: true })
  })

  it('возвращает error: forbidden при ошибке (RLS блокировка)', async () => {
    mockFrom.mockReturnValueOnce(
      chainDeleteEqEq({ data: null, error: { code: '42501', message: 'permission denied' } })
    )

    const result = await unregisterFromMeeting('meeting-1', 'user-2')
    expect(result).toEqual({ ok: false, reason: 'forbidden' })
  })
})
