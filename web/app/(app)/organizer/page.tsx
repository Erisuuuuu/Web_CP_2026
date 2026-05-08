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

  // Проверяем сессию
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Получаем клубы организатора
  const clubsResult = await getUserClubs(user.id)

  if (clubsResult.error) {
    return (
      <div className="text-red-600">Ошибка загрузки клубов: {clubsResult.error}</div>
    )
  }

  const clubs = clubsResult.data!

  // Для каждого клуба получаем встречи
  const clubsWithMeetings = await Promise.all(
    clubs.map(async (club) => {
      const meetingsResult = await getMeetingsByClub(club.id)
      return {
        club,
        meetings: meetingsResult.data ?? [],
      }
    })
  )

  // Фильтрация встреч
  const now = new Date().toISOString()

  function filterMeetings(meetings: MeetingRow[]): MeetingRow[] {
    if (filter === 'upcoming') return meetings.filter((m) => m.date >= now)
    if (filter === 'past') return meetings.filter((m) => m.date < now)
    return meetings
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Панель организатора</h1>
        <OrganizerFilter current={filter} />
      </div>

      {clubs.length === 0 && (
        <p className="text-muted-foreground">
          У вас пока нет клубов.{' '}
          <Link href="/clubs/new" className="text-blue-600 underline">
            Создать клуб
          </Link>
        </p>
      )}

      {clubsWithMeetings.map(({ club, meetings }) => {
        const filtered = filterMeetings(meetings)

        return (
          <section key={club.id} className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{club.name}</h2>
              <Link
                href={`/clubs/${club.id}/meetings/new`}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                + Встреча
              </Link>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет встреч для выбранного фильтра.</p>
            ) : (
              <div className="divide-y">
                {filtered.map((meeting) => (
                  <div key={meeting.id} className="py-4">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.date).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {meeting.location && ` · ${meeting.location}`}
                          {meeting.cefr_level && ` · ${meeting.cefr_level}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/meetings/${meeting.id}/edit`}
                          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Редактировать
                        </Link>
                        <a
                          href={`/api/meetings/${meeting.id}/export`}
                          className="rounded border border-green-600 px-3 py-1 text-sm text-green-700 hover:bg-green-50"
                        >
                          Скачать CSV
                        </a>
                      </div>
                    </div>
                    <ProgressBar taken={meeting.seats_taken} total={meeting.seats_total} />
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
