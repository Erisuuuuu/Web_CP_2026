import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClubForm from '@/components/clubs/ClubForm'
import { createClubAction } from '@/app/(app)/clubs/actions'

export default async function NewClubPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Создать клуб</h1>
        <ClubForm action={createClubAction} />
      </div>
    </div>
  )
}
