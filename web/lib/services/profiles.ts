import { createClient } from '@/lib/supabase/server'
import type { Profile, Result } from '@/lib/types'
import type { ProfileInput } from '@/lib/validators/profile'

export async function getProfile(userId: string): Promise<Result<Profile>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Профиль не найден' }

  return { data: data as Profile, error: null }
}

export async function updateProfile(
  userId: string,
  input: ProfileInput
): Promise<Result<Profile>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: input.name,
      bio: input.bio ?? null,
      cefr_level: input.cefr_level ?? null,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Не удалось обновить профиль' }

  return { data: data as Profile, error: null }
}
