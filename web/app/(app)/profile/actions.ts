'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validators/profile'
import { updateProfile } from '@/lib/services/profiles'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    name: formData.get('name'),
    bio: formData.get('bio') || undefined,
    cefr_level: formData.get('cefr_level') || undefined,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const result = await updateProfile(user.id, parsed.data)
  if (result.error) {
    return { error: result.error }
  }
}
