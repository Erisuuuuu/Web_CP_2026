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

export async function blockUser(
  targetUserId: string,
  requestingUserId: string
): Promise<Result<Profile>> {
  const isAdmin = await checkAdmin(requestingUserId)
  if (!isAdmin) return { data: null, error: 'forbidden' }

  // profiles не имеет поля is_active — блокируем через смену роли на 'blocked'
  // не подходит, т.к. role CHECK (role IN ('member','admin')).
  // Единственный вариант по схеме — удалить профиль или использовать Supabase Auth admin API.
  // Для курсача реализуем как обнуление имени + пометку через bio.
  // Но правильнее: используем service_role client для ban через auth.admin API.
  // Поскольку service_role key недоступен в клиенте — помечаем через bio-поле как [BLOCKED].
  // Это обходное решение, т.к. схема не содержит is_active для profiles.
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ bio: '[BLOCKED]' })
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

export async function hideClub(
  clubId: string,
  requestingUserId: string
): Promise<Result<Club>> {
  const isAdmin = await checkAdmin(requestingUserId)
  if (!isAdmin) return { data: null, error: 'forbidden' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clubs')
    .update({ is_active: false })
    .eq('id', clubId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Клуб не найден' }

  return { data: data as Club, error: null }
}
