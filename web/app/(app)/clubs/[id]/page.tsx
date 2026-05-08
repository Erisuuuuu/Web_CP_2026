import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getClub } from '@/lib/services/clubs'
import { getMeetingsByClub } from '@/lib/services/meetings'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClubPage({ params }: PageProps) {
  const { id } = await params
  const result = await getClub(id)

  if (result.error || !result.data) notFound()

  const club = result.data
  const meetingsResult = await getMeetingsByClub(id)
  const meetings = meetingsResult.data ?? []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Имя организатора
  const { data: organizer } = await supabase
    .from('profiles')
    .select('name')
    .eq('user_id', club.owner_id)
    .single()

  const isOwner = user?.id === club.owner_id
  const now = new Date().toISOString()
  const upcoming = meetings.filter((m) => m.date >= now)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>{club.name}</h1>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium border" style={
              club.is_active
                ? { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
                : { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }
            }>
              {club.is_active ? 'Активный' : 'Скрыт'}
            </span>
          </div>
          {organizer?.name && (
            <p className="text-sm" style={{ color: '#78716c' }}>Организатор: {organizer.name}</p>
          )}
          {club.description && (
            <p className="mt-2 text-sm" style={{ color: '#57534e' }}>{club.description}</p>
          )}
        </div>
        {isOwner && (
          <Link
            href={`/clubs/${id}/edit`}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-stone-50"
            style={{ borderColor: '#d6cdc0', color: '#57534e' }}
          >
            Редактировать
          </Link>
        )}
      </div>

      {/* Meetings */}
      <h2 className="text-lg font-semibold mb-3" style={{ color: '#1c1917' }}>
        Предстоящие встречи
      </h2>

      {upcoming.length === 0 ? (
        <p className="text-sm" style={{ color: '#78716c' }}>Нет предстоящих встреч.</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((meeting) => {
            const percent = meeting.seats_total > 0
              ? Math.min(Math.round((meeting.seats_taken / meeting.seats_total) * 100), 100)
              : 0
            return (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="block group">
                <div className="rounded-xl bg-white border p-4 transition hover:shadow-sm" style={{ borderColor: '#e5ddd0' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm group-hover:underline" style={{ color: '#1c1917' }}>{meeting.title}</p>
                    {meeting.cefr_level && (
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium border" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                        {meeting.cefr_level}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs" style={{ color: '#78716c' }}>
                    {format(new Date(meeting.date), 'dd MMM yyyy, HH:mm', { locale: ru })}
                    {meeting.location && ` · ${meeting.location}`}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full" style={{ backgroundColor: '#e5ddd0' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: '#1c1917' }} />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: '#78716c' }}>
                    {meeting.seats_taken} / {meeting.seats_total} мест
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
