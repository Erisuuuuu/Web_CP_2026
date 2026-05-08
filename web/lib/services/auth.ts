import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/types'

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<Result<{ userId: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name ?? '' } },
  })

  if (error) return { data: null, error: error.message }
  if (!data.user) return { data: null, error: 'Пользователь не создан' }

  return { data: { userId: data.user.id }, error: null }
}

export async function signIn(
  email: string,
  password: string
): Promise<Result<{ userId: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { data: null, error: error.message }

  return { data: { userId: data.user.id }, error: null }
}

export async function signOut(): Promise<Result<null>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) return { data: null, error: error.message }

  return { data: null, error: null }
}
