import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserClubs } from '@/lib/services/clubs'
import { getMeetingsByClub } from '@/lib/services/meetings'
import { ProgressBar } from '@/components/organizer/ProgressBar'
import { OrganizerFilter } from '@/components/organizer/OrganizerFilter'
import type { MeetingRow } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function OrganizerPage({ searchParams }: PageProps) {
  const { filter = 'all' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubsResult = await getUserClubs(user.id)
  if (clubsResult.error) {
    return <div className="text-red-600">Ошибка загрузки клубов: {clubsResult.error}</div>
  }

  const clubs = clubsResult.data!

  const clubsWithMeetings = await Promise.all(
    clubs.map(async (club) => {
      const meetingsResult = await getMeetingsByClub(club.id)
      return { club, meetings: meetingsResult.data ?? [] }
    })
  )

  const now = new Date().toISOString()

  function filterMeetings(meetings: MeetingRow[]): MeetingRow[] {
    if (filter === 'upcoming') return meetings.filter((m) => m.date >= now)
    if (filter === 'past') return meetings.filter((m) => m.date < now)
    return meetings
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>Мои клубы</h1>
        <OrganizerFilter current={filter} />
      </div>

      {clubs.length === 0 && (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: '#e5ddd0', backgroundColor: '#fff' }}>
          <p style={{ color: '#78716c' }}>
            У вас пока нет клубов.{' '}
            <Link href="/clubs/new" className="underline font-medium" style={{ color: '#1c1917' }}>
              Создать клуб
            </Link>
          </p>
        </div>
      )}

      {clubsWithMeetings.map(({ club, meetings }) => {
        const filtered = filterMeetings(meetings)

        return (
          <section key={club.id} className="rounded-xl border bg-white" style={{ borderColor: '#e5ddd0' }}>
            {/* Club header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e5ddd0' }}>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold" style={{ color: '#1c1917' }}>{club.name}</h2>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium border" style={
                  club.is_active
                    ? { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
                    : { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }
                }>
                  {club.is_active ? 'Активный' : 'Скрыт'}
                </span>
                <Link
                  href={`/clubs/${club.id}/edit`}
                  className="text-xs border rounded-lg px-2.5 py-1 transition-colors hover:bg-stone-50"
                  style={{ borderColor: '#d6cdc0', color: '#57534e' }}
                >
                  Редактировать клуб
                </Link>
              </div>
              <Link
                href={`/clubs/${club.id}/meetings/new`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#1c1917' }}
              >
                + Создать встречу
              </Link>
            </div>

            {filtered.length === 0 ? (
              <p className="px-6 py-4 text-sm" style={{ color: '#78716c' }}>Нет встреч для выбранного фильтра.</p>
            ) : (
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {filtered.map((meeting, idx) => (
                  <div key={meeting.id} className="flex items-center gap-4 px-6 py-4">
                    {/* Number */}
                    <span className="w-6 text-center text-sm font-medium shrink-0" style={{ color: '#78716c' }}>{idx + 1}</span>

                    {/* Title + date */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: '#1c1917' }}>{meeting.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#78716c' }}>
                        {new Date(meeting.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {meeting.location && ` · ${meeting.location}`}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="w-40 shrink-0">
                      <ProgressBar taken={meeting.seats_taken} total={meeting.seats_total} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/meetings/${meeting.id}/edit`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-stone-50"
                        style={{ borderColor: '#d6cdc0', color: '#57534e' }}
                      >
                        Редактировать
                      </Link>
                      <a
                        href={`/api/meetings/${meeting.id}/export`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ borderColor: '#d6cdc0', color: '#57534e' }}
                      >
                        ↓ CSV
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
