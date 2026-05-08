'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { clubSchema } from '@/lib/validators/club'
import { meetingSchema } from '@/lib/validators/meeting'
import { createClub, updateClub } from '@/lib/services/clubs'
import { createMeeting, updateMeeting } from '@/lib/services/meetings'

export async function createClubAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,

  }

  const parsed = clubSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const result = await createClub(user.id, parsed.data)
  if (result.error) {
    return { error: result.error }
  }

  redirect('/organizer')
}

export async function updateClubAction(clubId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,

  }

  const parsed = clubSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const result = await updateClub(clubId, user.id, parsed.data)
  if (result.error) {
    return { error: result.error }
  }

  redirect('/organizer')
}

export async function createMeetingAction(clubId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    date: formData.get('date'),
    location: formData.get('location') || undefined,
    cefr_level: formData.get('cefr_level'),
    seats_total: Number(formData.get('seats_total')),
  }

  const parsed = meetingSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const result = await createMeeting(clubId, user.id, parsed.data)
  if (result.error) {
    return { error: result.error }
  }

  redirect(`/meetings/${result.data!.id}`)
}

export async function updateMeetingAction(meetingId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    date: formData.get('date'),
    location: formData.get('location') || undefined,
    cefr_level: formData.get('cefr_level'),
    seats_total: Number(formData.get('seats_total')),
  }

  const parsed = meetingSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const result = await updateMeeting(meetingId, user.id, parsed.data)
  if (result.error) {
    return { error: result.error }
  }

  redirect(`/meetings/${meetingId}`)
}
