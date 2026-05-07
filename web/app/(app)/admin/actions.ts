'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { blockUser, hideClub } from '@/lib/services/admin'
import type { Result } from '@/lib/types'

export async function blockUserAction(userId: string): Promise<Result<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Не авторизован' }

  const result = await blockUser(userId, user.id)
  if (result.error) return { data: null, error: result.error }

  revalidatePath('/admin')
  return { data: null, error: null }
}

export async function hideClubAction(clubId: string): Promise<Result<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Не авторизован' }

  const result = await hideClub(clubId, user.id)
  if (result.error) return { data: null, error: result.error }

  revalidatePath('/admin')
  return { data: null, error: null }
}
