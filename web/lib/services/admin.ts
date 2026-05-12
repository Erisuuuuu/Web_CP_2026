import { createClient } from '@/lib/supabase/server'
import type { Club, Profile, Result } from '@/lib/types'

async function checkAdmin(requestingUserId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', requestingUserId)
    .single()
  return data?.role === 'admin'
}

export async function getAllUsers(
  requestingUserId: string
): Promise<Result<Profile[]>> {
  const isAdmin = await checkAdmin(requestingUserId)
  if (!isAdmin) return { data: null, error: 'forbidden' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  return { data: (data ?? []) as Profile[], error: null }
}

export async function setUserActive(
  targetUserId: string,
  requestingUserId: string,
  active: boolean
): Promise<Result<Profile>> {
  const isAdmin = await checkAdmin(requestingUserId)
  if (!isAdmin) return { data: null, error: 'forbidden' }
  if (targetUserId === requestingUserId) return { data: null, error: 'Нельзя менять статус самому себе' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: active })
    .eq('user_id', targetUserId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Пользователь не найден' }

  return { data: data as Profile, error: null }
}

export async function getAllClubsAdmin(
  requestingUserId: string
): Promise<Result<Club[]>> {
  const isAdmin = await checkAdmin(requestingUserId)
  if (!isAdmin) return { data: null, error: 'forbidden' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  return { data: (data ?? []) as Club[], error: null }
}

export async function setClubActive(
  clubId: string,
  requestingUserId: string,
  active: boolean
): Promise<Result<Club>> {
  const isAdmin = await checkAdmin(requestingUserId)
  if (!isAdmin) return { data: null, error: 'forbidden' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clubs')
    .update({ is_active: active })
    .eq('id', clubId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Клуб не найден' }

  return { data: data as Club, error: null }
}
