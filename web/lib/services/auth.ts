import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/types'

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Email not confirmed': 'Email не подтверждён. Проверьте почту',
    'Invalid login credentials': 'Неверный email или пароль',
    'User already registered': 'Пользователь с таким email уже зарегистрирован',
    'Email rate limit exceeded': 'Слишком много попыток. Попробуйте позже',
    'Password should be at least 6 characters': 'Пароль должен быть минимум 6 символов',
    'Password should be at least 8 characters': 'Пароль должен быть минимум 8 символов',
    'Signup requires a valid password': 'Введите корректный пароль',
    'Unable to validate email address: invalid format': 'Некорректный формат email',
    'User not found': 'Пользователь не найден',
  }
  return map[message] ?? message
}

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

  if (error) return { data: null, error: translateAuthError(error.message) }
  if (!data.user) return { data: null, error: 'Пользователь не создан' }

  // Supabase не возвращает ошибку для существующих email — детектируем по пустым identities
  if (!data.user.identities || data.user.identities.length === 0) {
    return { data: null, error: 'Пользователь с таким email уже зарегистрирован' }
  }

  // Если email confirmation включён, сессия не создана — нужно явно залогинить
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      return { data: null, error: 'Регистрация прошла, но не удалось войти. Проверьте email и войдите вручную' }
    }
  }

  return { data: { userId: data.user.id }, error: null }
}

export async function signIn(
  email: string,
  password: string
): Promise<Result<{ userId: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { data: null, error: translateAuthError(error.message) }

  return { data: { userId: data.user.id }, error: null }
}

export async function signOut(): Promise<Result<null>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) return { data: null, error: translateAuthError(error.message) }

  return { data: null, error: null }
}
