import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/services/profiles'
import { getAllUsers, getAllClubsAdmin } from '@/lib/services/admin'
import BlockUserButton from '@/components/admin/BlockUserButton'
import HideClubButton from '@/components/admin/HideClubButton'

interface AdminPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profileResult = await getProfile(user.id)
  if (profileResult.error || profileResult.data?.role !== 'admin') {
    redirect('/')
  }

  const { search } = await searchParams

  const [usersResult, clubsResult] = await Promise.all([
    getAllUsers(user.id),
    getAllClubsAdmin(user.id),
  ])

  const users = usersResult.data ?? []
  const clubs = clubsResult.data ?? []

  const filteredUsers = search
    ? users.filter((u) =>
        (u.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>

      {/* ── Пользователи ────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Пользователи</h2>
          <form method="GET" className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Поиск по имени..."
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Найти
            </button>
          </form>
        </div>

        {usersResult.error ? (
          <p className="text-sm text-red-600">Ошибка: {usersResult.error}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Имя</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">CEFR</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Роль</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Статус</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isBlocked = u.bio === '[BLOCKED]'
                  const isSelf = u.user_id === user.id
                  const isOtherAdmin = u.role === 'admin'
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.name || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {u.user_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.cefr_level ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            isBlocked
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {isBlocked ? 'Заблокирован' : 'Активен'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isSelf && !isOtherAdmin && !isBlocked && (
                          <BlockUserButton userId={u.user_id} userName={u.name ?? ''} />
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      Пользователи не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Клубы ───────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Клубы</h2>

        {clubsResult.error ? (
          <p className="text-sm text-red-600">Ошибка: {clubsResult.error}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Название</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Владелец (ID)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Статус</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{club.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {club.owner_id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          club.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {club.is_active ? 'Активен' : 'Скрыт'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {club.is_active && (
                        <HideClubButton clubId={club.id} clubName={club.name} />
                      )}
                    </td>
                  </tr>
                ))}
                {clubs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      Клубы не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
