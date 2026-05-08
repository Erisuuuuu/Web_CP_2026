import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/services/profiles'
import ProfileEditor from '@/components/profile/ProfileEditor'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getProfile(user.id)

  if (result.error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        Ошибка загрузки профиля: {result.error}
      </div>
    )
  }

  return <ProfileEditor profile={result.data!} userId={user.id} />
}
