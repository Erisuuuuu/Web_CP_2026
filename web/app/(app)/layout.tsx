import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/actions'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/meetings" className="font-semibold text-gray-900 hover:text-blue-600">
              LangClub
            </Link>
            <Link href="/meetings" className="text-sm text-gray-600 hover:text-gray-900">
              Встречи
            </Link>
            {user && (
              <>
                <Link href="/organizer" className="text-sm text-gray-600 hover:text-gray-900">
                  Мои клубы
                </Link>
                <Link href="/clubs/new" className="text-sm text-gray-600 hover:text-gray-900">
                  + Клуб
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                  Профиль
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                    Выйти
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                Войти
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
