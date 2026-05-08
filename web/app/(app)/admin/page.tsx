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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileResult = await getProfile(user.id)
  if (profileResult.error || profileResult.data?.role !== 'admin') redirect('/')

  const { search } = await searchParams

  const [usersResult, clubsResult] = await Promise.all([
    getAllUsers(user.id),
    getAllClubsAdmin(user.id),
  ])

  const users = usersResult.data ?? []
  const clubs = clubsResult.data ?? []

  const filteredUsers = search
    ? users.filter((u) => (u.name ?? '').toLowerCase().includes(search.toLowerCase()))
    : users

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>Панель администратора</h1>

      {/* Users */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ color: '#1c1917' }}>Пользователи</h2>
          <form method="GET" className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Поиск по имени..."
              className="rounded-lg px-3 py-1.5 text-sm outline-none"
              style={{ border: '1px solid #d6cdc0', color: '#1c1917' }}
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: '#1c1917' }}
            >
              Найти
            </button>
          </form>
        </div>

        {usersResult.error ? (
          <p className="text-sm text-red-600">Ошибка: {usersResult.error}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#e5ddd0' }}>
            <table className="min-w-full divide-y text-sm" style={{ '--tw-divide-color': '#e5ddd0' } as React.CSSProperties}>
              <thead style={{ backgroundColor: '#faf7f0' }}>
                <tr>
                  {['Имя', 'ID', 'CEFR', 'Роль', 'Статус', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#78716c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isBlocked = u.bio === '[BLOCKED]'
                  const isSelf = u.user_id === user.id
                  const isOtherAdmin = u.role === 'admin'
                  return (
                    <tr key={u.id} className="border-t hover:bg-stone-50 transition-colors" style={{ borderColor: '#e5ddd0' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: '#1c1917' }}>{u.name || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#78716c' }}>{u.user_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3" style={{ color: '#57534e' }}>{u.cefr_level ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium border" style={
                          u.role === 'admin'
                            ? { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }
                            : { backgroundColor: '#f5f0e8', color: '#78716c', borderColor: '#e5ddd0' }
                        }>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium border" style={
                          isBlocked
                            ? { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }
                            : { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
                        }>
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
                    <td colSpan={6} className="px-4 py-6 text-center" style={{ color: '#78716c' }}>Пользователи не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Clubs */}
      <section>
        <h2 className="mb-4 text-xl font-semibold" style={{ color: '#1c1917' }}>Клубы</h2>

        {clubsResult.error ? (
          <p className="text-sm text-red-600">Ошибка: {clubsResult.error}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#e5ddd0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ backgroundColor: '#faf7f0' }}>
                <tr>
                  {['Название', 'Владелец (ID)', 'Статус', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#78716c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.id} className="border-t hover:bg-stone-50 transition-colors" style={{ borderColor: '#e5ddd0' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: '#1c1917' }}>{club.name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#78716c' }}>{club.owner_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium border" style={
                        club.is_active
                          ? { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
                          : { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }
                      }>
                        {club.is_active ? 'Активен' : 'Скрыт'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {club.is_active && <HideClubButton clubId={club.id} clubName={club.name} />}
                    </td>
                  </tr>
                ))}
                {clubs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center" style={{ color: '#78716c' }}>Клубы не найдены</td>
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
