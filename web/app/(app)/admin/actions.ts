'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { setUserActive, setClubActive } from '@/lib/services/admin'
import type { Result } from '@/lib/types'

export async function toggleUserActiveAction(
  userId: string,
  active: boolean
): Promise<Result<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Не авторизован' }

  const result = await setUserActive(userId, user.id, active)
  if (result.error) return { data: null, error: result.error }

  revalidatePath('/admin')
  return { data: null, error: null }
}

export async function toggleClubActiveAction(
  clubId: string,
  active: boolean
): Promise<Result<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Не авторизован' }

  const result = await setClubActive(clubId, user.id, active)
  if (result.error) return { data: null, error: result.error }

  revalidatePath('/admin')
  return { data: null, error: null }
}
