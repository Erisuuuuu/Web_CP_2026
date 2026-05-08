import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { MeetingWithDetails } from '@/lib/types'

interface MeetingCardProps {
  meeting: MeetingWithDetails
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const formattedDate = format(new Date(meeting.date), 'dd MMM yyyy, HH:mm', { locale: ru })
  const percent = meeting.seats_total > 0
    ? Math.min(Math.round((meeting.seats_taken / meeting.seats_total) * 100), 100)
    : 0
  const isFull = meeting.seats_taken >= meeting.seats_total

  return (
    <Link href={`/meetings/${meeting.id}`} className="block group">
      <div className="rounded-xl bg-white p-5 border transition hover:shadow-md" style={{ borderColor: '#e5ddd0' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold leading-tight group-hover:underline" style={{ color: '#1c1917' }}>
            {meeting.title}
          </h3>
          {meeting.cefr_level && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium border" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
              {meeting.cefr_level}
            </span>
          )}
        </div>

        {/* Club */}
        <p className="text-xs mb-3" style={{ color: '#78716c' }}>{meeting.club.name}</p>

        {/* Date & location */}
        <p className="text-xs mb-1" style={{ color: '#57534e' }}>{formattedDate}</p>
        {meeting.location && (
          <p className="text-xs mb-3 truncate" style={{ color: '#78716c' }}>{meeting.location}</p>
        )}

        {/* Progress */}
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full mb-1" style={{ backgroundColor: '#e5ddd0' }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: isFull ? '#dc2626' : '#1c1917' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#78716c' }}>
              {meeting.seats_taken} / {meeting.seats_total} мест
            </span>
            {isFull && <span className="text-xs font-medium text-red-600">Мест нет</span>}
            {!isFull && (
              <span className="text-xs" style={{ color: '#78716c' }}>
                Свободно: {meeting.seats_total - meeting.seats_taken}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
