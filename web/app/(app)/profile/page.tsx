import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/services/profiles'
import ProfileForm from '@/components/profile/ProfileForm'

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

  const profile = result.data!
  const initials = profile.name
    ? profile.name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Левая колонка — аватар-заглушка + имя */}
      <div className="flex flex-col items-center gap-4 md:col-span-1">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{profile.name || 'Без имени'}</p>
          {profile.cefr_level && (
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
              {profile.cefr_level}
            </span>
          )}
        </div>
      </div>

      {/* Правая колонка — форма */}
      <div className="rounded-xl bg-white p-6 shadow-sm md:col-span-2">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Редактировать профиль</h1>
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
