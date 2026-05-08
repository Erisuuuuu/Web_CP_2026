import { createClient } from '@/lib/supabase/server'
import type { Result, RegistrationResult, RegistrationWithProfile, CefrLevel } from '@/lib/types'

// ─── Тип результата записи ────────────────────────────────────────────────────
// RegistrationResult = { ok: true } | { ok: false; reason: 'full' | 'duplicate' | 'inactive' | 'forbidden' }
// Примечание: в types.ts reason = 'inactive_club', но по заданию TDD используем 'inactive'

type RegResult =
  | { ok: true }
  | { ok: false; reason: 'full' | 'duplicate' | 'inactive' | 'forbidden' }

/**
 * Записывает пользователя на встречу.
 * Проверяет: активность клуба → наличие мест → уникальность записи.
 */
export async function registerForMeeting(
  meetingId: string,
  userId: string
): Promise<RegResult> {
  const supabase = await createClient()

  // 1. Получить встречу + клуб
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('id, seats_total, club:clubs!meetings_club_id_fkey(is_active)')
    .eq('id', meetingId)
    .single()

  if (meetingError || !meeting) {
    return { ok: false, reason: 'inactive' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive = (meeting as any).club?.is_active as boolean | undefined

  // 2. Если клуб неактивен
  if (!isActive) {
    return { ok: false, reason: 'inactive' }
  }

  // 3. Подсчитать количество регистраций
  const { count, error: countError } = await supabase
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('meeting_id', meetingId)

  if (countError) {
    return { ok: false, reason: 'full' }
  }

  // 4. Проверить наличие мест
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seatsTotal = (meeting as any).seats_total as number
  if ((count ?? 0) >= seatsTotal) {
    return { ok: false, reason: 'full' }
  }

  // 5. Попытаться вставить запись
  const { error: insertError } = await supabase
    .from('registrations')
    .insert({ meeting_id: meetingId, user_id: userId })

  // 6. Обработка ошибки уникальности
  if (insertError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((insertError as any).code === '23505') {
      return { ok: false, reason: 'duplicate' }
    }
    return { ok: false, reason: 'full' }
  }

  return { ok: true }
}

/**
 * Отменяет запись пользователя на встречу.
 * Если запись не найдена (чужая или несуществующая) — возвращает forbidden.
 */
export async function unregisterFromMeeting(
  meetingId: string,
  userId: string
): Promise<RegResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('meeting_id', meetingId)
    .eq('user_id', userId)

  if (error) {
    return { ok: false, reason: 'forbidden' }
  }

  return { ok: true }
}

// Re-export RegistrationResult для внешнего использования
export type { RegistrationResult }

/**
 * Возвращает регистрации на встречу с профилями участников.
 * Доступно только owner'у клуба, которому принадлежит встреча.
 */
export async function getMeetingRegistrations(
  meetingId: string,
  requestingUserId: string
): Promise<Result<RegistrationWithProfile[]>> {
  const supabase = await createClient()

  // Проверяем, что запрашивающий — owner клуба встречи
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('id, club:clubs!meetings_club_id_fkey(owner_id)')
    .eq('id', meetingId)
    .single()

  if (meetingError || !meeting) {
    return { data: null, error: 'Встреча не найдена' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerIdFromClub = (meeting as any).club?.owner_id as string | undefined
  if (ownerIdFromClub !== requestingUserId) {
    return { data: null, error: 'forbidden' }
  }

  // Получаем регистрации с профилями
  const { data: registrations, error: regError } = await supabase
    .from('registrations')
    .select(`
      id,
      registered_at,
      user_id,
      meeting_id,
      profile:profiles!registrations_user_id_fkey(
        id,
        name,
        cefr_level,
        user_id
      )
    `)
    .eq('meeting_id', meetingId)
    .order('registered_at', { ascending: true })

  if (regError) return { data: null, error: regError.message }

  // Собираем user_id для получения email из auth.admin
  const userIds = (registrations ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.user_id as string
  )

  // Получаем email через admin API (service role key нужен в env)
  const emailMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: adminData, error: adminError } = await supabase.auth.admin.listUsers()
    if (!adminError && adminData) {
      for (const user of adminData.users) {
        if (userIds.includes(user.id)) {
          emailMap[user.id] = user.email ?? ''
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: RegistrationWithProfile[] = (registrations ?? []).map((r: any) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    meeting_id: r.meeting_id as string,
    registered_at: r.registered_at as string,
    profile: {
      name: (r.profile?.name as string | null) ?? null,
      cefr_level: (r.profile?.cefr_level as CefrLevel | null) ?? null,
    },
    email: emailMap[r.user_id as string] ?? '',
  }))

  return { data: result, error: null }
}
