import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMeeting } from '@/lib/services/meetings'
import MeetingForm from '@/components/clubs/MeetingForm'
import { updateMeetingAction } from '@/app/(app)/clubs/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMeetingPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getMeeting(id)
  if (result.error || !result.data) notFound()

  const meeting = result.data

  // Только owner клуба может редактировать
  if (meeting.organizer.id !== user.id) redirect('/organizer')

  const boundAction = updateMeetingAction.bind(null, id)

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl bg-white border p-8" style={{ borderColor: '#e5ddd0' }}>
        <h1 className="mb-2 text-xl font-semibold" style={{ color: '#1c1917' }}>
          Редактировать встречу
        </h1>
        <p className="mb-6 text-sm" style={{ color: '#78716c' }}>
          Клуб: {meeting.club.name}
        </p>
        <MeetingForm clubId={meeting.club_id} action={boundAction} meeting={meeting} />
      </div>
    </div>
  )
}
