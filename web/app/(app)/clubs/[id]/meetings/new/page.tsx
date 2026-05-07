import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClub } from '@/lib/services/clubs'
import MeetingForm from '@/components/clubs/MeetingForm'
import { createMeetingAction } from '@/app/(app)/clubs/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewMeetingPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getClub(id)
  if (result.error || !result.data) redirect('/organizer')

  const club = result.data

  // Только owner клуба может создавать встречи
  if (club.owner_id !== user.id) redirect('/organizer')

  const boundAction = createMeetingAction.bind(null, id)

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Новая встреча</h1>
        <p className="mb-6 text-sm text-gray-500">Клуб: {club.name}</p>
        <MeetingForm clubId={id} action={boundAction} />
      </div>
    </div>
  )
}
