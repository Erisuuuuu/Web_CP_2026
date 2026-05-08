'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerForMeeting, unregisterFromMeeting } from '@/lib/services/registrations'

export async function registerAction(meetingId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await registerForMeeting(meetingId, user.id)

  if (result.ok) {
    revalidatePath(`/meetings/${meetingId}`)
  }

  return result
}

export async function unregisterAction(meetingId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await unregisterFromMeeting(meetingId, user.id)

  if (result.ok) {
    revalidatePath(`/meetings/${meetingId}`)
  }

  return result
}
