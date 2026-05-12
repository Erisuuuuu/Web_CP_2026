import { createClient } from '@/lib/supabase/server'
import type { Meeting, MeetingRow, MeetingWithDetails, Result } from '@/lib/types'
import type { MeetingInput } from '@/lib/validators/meeting'
import type { MeetingFilter } from '@/lib/validators/meeting'

const PAGE_SIZE = 20

export async function getMeetings(
  filter?: MeetingFilter,
  limit: number = PAGE_SIZE
): Promise<Result<MeetingWithDetails[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('meetings')
    .select(`
      *,
      club:clubs!inner(id, name, owner_id, is_active)
    `)
    .eq('club.is_active', true)
    .gte('date', new Date().toISOString())
    .limit(limit)
    .order('date', { ascending: true })

  if (filter?.cefr && filter.cefr.length > 0) {
    query = query.in('cefr_level', filter.cefr)
  }
  if (filter?.from) {
    query = query.gte('date', filter.from)
  }
  if (filter?.to) {
    query = query.lte('date', filter.to)
  }

  const { data, error } = await query

  if (error) return { data: null, error: error.message }

  const meetings: MeetingWithDetails[] = (data ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = row as any
    return {
      id: r.id,
      club_id: r.club_id,
      title: r.title,
      description: r.description ?? null,
      date: r.date,
      location: r.location,
      seats_total: r.seats_total,
      cefr_level: r.cefr_level,
      created_at: r.created_at,
      club: {
        id: r.club?.id ?? '',
        name: r.club?.name ?? '',
      },
      organizer: {
        id: r.club?.owner_id ?? '',
        name: '',
        avatar_url: null,
      },
      seats_taken: r.seats_taken ?? 0,
    }
  })

  return { data: meetings, error: null }
}

export async function getMeeting(
  meetingId: string
): Promise<Result<MeetingWithDetails>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      club:clubs!inner(id, name, owner_id)
    `)
    .eq('id', meetingId)
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Встреча не найдена' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = data as any
  const ownerId: string = r.club?.owner_id ?? ''

  // Отдельный запрос для имени организатора (PostgREST не поддерживает meetings→clubs→profiles)
  let organizerName = ''
  if (ownerId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', ownerId)
      .single()
    organizerName = profile?.name ?? ''
  }

  const meeting: MeetingWithDetails = {
    id: r.id,
    club_id: r.club_id,
    title: r.title,
    description: r.description ?? null,
    date: r.date,
    location: r.location,
    seats_total: r.seats_total,
    cefr_level: r.cefr_level,
    created_at: r.created_at,
    club: {
      id: r.club?.id ?? '',
      name: r.club?.name ?? '',
    },
    organizer: {
      id: ownerId,
      name: organizerName,
      avatar_url: null,
    },
    seats_taken: r.seats_taken ?? 0,
  }

  return { data: meeting, error: null }
}

export async function createMeeting(
  clubId: string,
  userId: string,
  input: MeetingInput
): Promise<Result<Meeting>> {
  const supabase = await createClient()

  // Проверяем, что пользователь — owner клуба
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('id')
    .eq('id', clubId)
    .eq('owner_id', userId)
    .single()

  if (clubError || !club) {
    return { data: null, error: 'Клуб не найден или нет прав' }
  }

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      club_id: clubId,
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      location: input.location ?? null,
      seats_total: input.seats_total,
      cefr_level: input.cefr_level,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Не удалось создать встречу' }

  return { data: data as Meeting, error: null }
}

export async function updateMeeting(
  meetingId: string,
  userId: string,
  input: MeetingInput
): Promise<Result<Meeting>> {
  const supabase = await createClient()

  // Проверяем, что пользователь — owner клуба этой встречи
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('id, club:clubs(owner_id)')
    .eq('id', meetingId)
    .single()

  if (meetingError || !meeting) {
    return { data: null, error: 'Встреча не найдена' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const club = (meeting as any).club
  if (club?.owner_id !== userId) {
    return { data: null, error: 'Нет прав на редактирование' }
  }

  const { data, error } = await supabase
    .from('meetings')
    .update({
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      location: input.location ?? null,
      seats_total: input.seats_total,
      cefr_level: input.cefr_level,
    })
    .eq('id', meetingId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Не удалось обновить встречу' }

  return { data: data as Meeting, error: null }
}

export async function getMeetingsByClub(
  clubId: string
): Promise<Result<MeetingRow[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('club_id', clubId)
    .order('date', { ascending: true })

  if (error) return { data: null, error: error.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: MeetingRow[] = (data ?? []).map((r: any) => ({
    id: r.id as string,
    club_id: r.club_id as string,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    date: r.date as string,
    location: (r.location as string | null) ?? null,
    seats_total: r.seats_total as number,
    cefr_level: r.cefr_level ?? null,
    created_at: r.created_at as string,
    seats_taken: (r.seats_taken as number) ?? 0,
  }))

  return { data: rows, error: null }
}

export async function deleteMeeting(
  meetingId: string,
  userId: string
): Promise<Result<null>> {
  const supabase = await createClient()

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('id, club:clubs(owner_id)')
    .eq('id', meetingId)
    .single()

  if (meetingError || !meeting) {
    return { data: null, error: 'Встреча не найдена' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const club = (meeting as any).club
  if (club?.owner_id !== userId) {
    return { data: null, error: 'Нет прав на удаление' }
  }

  const { error } = await supabase.from('meetings').delete().eq('id', meetingId)
  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}
