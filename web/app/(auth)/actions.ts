'use server'

import { redirect } from 'next/navigation'
import { loginSchema, registerSchema } from '@/lib/validators/auth'
import { signIn, signUp, signOut } from '@/lib/services/auth'

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data
  const result = await signIn(email, password)

  if (result.error) return { error: result.error }

  redirect('/')
}

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data
  const result = await signUp(email, password, name)

  if (result.error) return { error: result.error }

  redirect('/')
}

export async function logoutAction() {
  await signOut()
  redirect('/login')
}
