import { createClient } from '@/lib/supabase/server'
import type { Club, Result } from '@/lib/types'
import type { ClubInput } from '@/lib/validators/club'

export async function getClub(clubId: string): Promise<Result<Club>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Клуб не найден' }

  return { data: data as Club, error: null }
}

export async function getUserClubs(userId: string): Promise<Result<Club[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  return { data: (data ?? []) as Club[], error: null }
}

export async function createClub(
  userId: string,
  input: ClubInput
): Promise<Result<Club>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clubs')
    .insert({
      owner_id: userId,
      name: input.name,
      description: input.description ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Не удалось создать клуб' }

  return { data: data as Club, error: null }
}

export async function updateClub(
  clubId: string,
  userId: string,
  input: ClubInput
): Promise<Result<Club>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clubs')
    .update({
      name: input.name,
      description: input.description ?? null,
    })
    .eq('id', clubId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Клуб не найден или нет прав' }

  return { data: data as Club, error: null }
}

export async function deleteClub(
  clubId: string,
  userId: string
): Promise<Result<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clubs')
    .delete()
    .eq('id', clubId)
    .eq('owner_id', userId)

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}
