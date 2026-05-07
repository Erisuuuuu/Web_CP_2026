import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClub } from '@/lib/services/clubs'
import ClubForm from '@/components/clubs/ClubForm'
import { updateClubAction } from '@/app/(app)/clubs/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditClubPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getClub(id)
  if (result.error || !result.data) redirect('/organizer')

  const club = result.data

  // Только owner может редактировать
  if (club.owner_id !== user.id) redirect('/organizer')

  const boundAction = updateClubAction.bind(null, id)

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">
          Редактировать клуб
        </h1>
        <ClubForm club={club} action={boundAction} />
      </div>
    </div>
  )
}
