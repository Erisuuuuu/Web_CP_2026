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
    <div className="flex gap-6 items-start">
      {/* Left: profile card */}
      <div className="w-52 shrink-0 rounded-xl bg-white border p-6 flex flex-col items-center text-center gap-4" style={{ borderColor: '#e5ddd0' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: '#1c1917' }}>
          {initials}
        </div>
        <div>
          <p className="font-semibold text-base" style={{ color: '#1c1917' }}>{profile.name || 'Без имени'}</p>
          {profile.cefr_level && (
            <span className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium border" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
              {profile.cefr_level}
            </span>
          )}
          {profile.bio && (
            <p className="mt-2 text-xs leading-relaxed" style={{ color: '#78716c' }}>{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 rounded-xl bg-white border p-6" style={{ borderColor: '#e5ddd0' }}>
        <h1 className="mb-6 text-xl font-semibold" style={{ color: '#1c1917' }}>Редактировать профиль</h1>
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
