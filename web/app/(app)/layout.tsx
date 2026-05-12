import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/actions'
import { getProfile } from '@/lib/services/profiles'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initials = ''
  let displayName = ''
  let avatarUrl: string | null = null
  let isAdmin = false
  if (user) {
    const profileResult = await getProfile(user.id)
    if (profileResult.data && profileResult.data.is_active === false) {
      await supabase.auth.signOut()
      redirect('/login?blocked=1')
    }
    const name = profileResult.data?.name ?? user.email ?? ''
    displayName = name.split(' ')[0]
    initials = name.slice(0, 2).toUpperCase()
    avatarUrl = profileResult.data?.avatar_url ?? null
    isAdmin = profileResult.data?.role === 'admin'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f0' }}>
      <nav className="bg-white border-b" style={{ borderColor: '#e5ddd0' }}>
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-14">
          {/* Left: logo */}
          <Link href="/meetings" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-ring.svg" alt="" className="w-8 h-8" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mospoly.jpg"
                alt=""
                className="absolute rounded-full object-cover"
                style={{ top: '8px', left: '8px', width: '16px', height: '16px' }}
              />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#1c1917' }}>LangClub</span>
          </Link>

          {/* Center: main nav */}
          <div className="flex items-center gap-6">
            <Link href="/meetings" className="text-sm font-medium" style={{ color: '#57534e' }}>
              Каталог встреч
            </Link>
            {user && (
              <Link href="/organizer" className="text-sm font-medium" style={{ color: '#57534e' }}>
                Мои клубы
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium" style={{ color: '#dc2626' }}>
                Админка
              </Link>
            )}
          </div>

          {/* Right: user */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden" style={{ backgroundColor: '#1c1917' }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      : (initials || '?')}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={{ color: '#1c1917' }}>{displayName}</span>
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="text-sm px-3 py-1.5 rounded-lg border transition-colors hover:bg-stone-50" style={{ borderColor: '#e5ddd0', color: '#78716c' }}>
                    Выйти
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm px-3 py-1.5 rounded-lg border transition-colors hover:bg-stone-50" style={{ borderColor: '#e5ddd0', color: '#57534e' }}>
                  Войти
                </Link>
                <Link href="/register" className="text-sm px-4 py-1.5 rounded-lg text-white font-medium transition-colors" style={{ backgroundColor: '#1c1917' }}>
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
