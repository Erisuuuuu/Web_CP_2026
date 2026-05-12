import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getMeeting } from '@/lib/services/meetings'
import { createClient } from '@/lib/supabase/server'
import { RegisterButton } from '@/components/meetings/RegisterButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MeetingPage({ params }: PageProps) {
  const { id } = await params
  const result = await getMeeting(id)

  if (result.error || !result.data) {
    notFound()
  }

  const meeting = result.data
  const formattedDate = format(new Date(meeting.date), 'dd MMMM yyyy, HH:mm', { locale: ru })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isRegistered = false
  if (user) {
    const { data: reg } = await supabase
      .from('registrations')
      .select('id')
      .eq('meeting_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    isRegistered = reg !== null
  }

  const isOwner = user?.id === meeting.organizer.id
  const isFull = meeting.seats_taken >= meeting.seats_total
  const percent = meeting.seats_total > 0
    ? Math.min(Math.round((meeting.seats_taken / meeting.seats_total) * 100), 100)
    : 0

  const boxStyle = { border: '1px solid #e5ddd0', borderRadius: '0.75rem', padding: '1.25rem' }
  const labelStyle = { fontSize: '0.7rem', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#78716c', marginBottom: '0.375rem' }

  return (
    <div>
      {/* Breadcrumb */}
      <p className="mb-4 text-sm" style={{ color: '#78716c' }}>
        <Link href="/meetings" className="hover:underline">← Каталог встреч</Link>
        {' / '}
        <span>{meeting.club.name}</span>
      </p>

      <div className="flex gap-6 items-start">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start gap-3 mb-6">
            <h1 className="text-2xl font-bold flex-1" style={{ color: '#1c1917' }}>{meeting.title}</h1>
            {meeting.cefr_level && (
              <span className="shrink-0 rounded-full px-3 py-1 text-sm font-medium border" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                {meeting.cefr_level}
              </span>
            )}
          </div>

          <hr style={{ borderColor: '#e5ddd0', marginBottom: '1.5rem' }} />

          {meeting.description && (
            <div className="mb-6 rounded-xl border p-4" style={{ borderColor: '#e5ddd0', backgroundColor: '#fff' }}>
              <p style={labelStyle}>Описание</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#1c1917' }}>{meeting.description}</p>
            </div>
          )}

          {/* 2×2 info grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div style={boxStyle}>
              <p style={labelStyle}>Дата и время</p>
              <p className="font-medium text-sm" style={{ color: '#1c1917' }}>{formattedDate}</p>
            </div>
            <div style={boxStyle}>
              <p style={labelStyle}>Адрес</p>
              <p className="font-medium text-sm" style={{ color: '#1c1917' }}>{meeting.location || '—'}</p>
            </div>
            <div style={boxStyle}>
              <p style={labelStyle}>Клуб</p>
              <Link href={`/clubs/${meeting.club.id}`} className="font-medium text-sm underline" style={{ color: '#1c1917' }}>
                {meeting.club.name}
              </Link>
            </div>
            <div style={boxStyle}>
              <p style={labelStyle}>Организатор</p>
              <p className="font-medium text-sm" style={{ color: '#1c1917' }}>{meeting.organizer.name || '—'}</p>
            </div>
          </div>
        </div>

        {/* Right sidebar — registration */}
        <div className="w-64 shrink-0 rounded-xl border p-5" style={{ borderColor: '#e5ddd0', backgroundColor: '#fff' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: '#1c1917' }}>Запись на встречу</p>

          <div className="text-center mb-3">
            <span className="text-4xl font-bold" style={{ color: '#1c1917' }}>{meeting.seats_taken}</span>
            <span className="text-lg" style={{ color: '#78716c' }}> из {meeting.seats_total}</span>
            <p className="text-xs mt-0.5" style={{ color: '#78716c' }}>мест занято</p>
          </div>

          <div className="h-2 w-full rounded-full mb-4" style={{ backgroundColor: '#e5ddd0' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: isFull ? '#dc2626' : '#1c1917' }}
            />
          </div>

          {isOwner && (
            <a
              href={`/api/meetings/${id}/export`}
              className="block w-full rounded-lg border py-2 text-center text-xs font-medium transition-colors mb-3 hover:bg-stone-50"
              style={{ borderColor: '#d6cdc0', color: '#57534e' }}
            >
              ↓ Скачать CSV участников
            </a>
          )}

          {user ? (
            <RegisterButton meetingId={id} isRegistered={isRegistered} isFull={isFull} />
          ) : (
            <Link
              href="/login"
              className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#1c1917' }}
            >
              Войдите, чтобы записаться
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
