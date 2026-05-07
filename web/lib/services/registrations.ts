import { createClient } from '@/lib/supabase/server'
import type { Result, RegistrationWithProfile } from '@/lib/types'

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
      cefr_level: (r.profile?.cefr_level as string | null) ?? null,
    },
    email: emailMap[r.user_id as string] ?? '',
  }))

  return { data: result, error: null }
}
