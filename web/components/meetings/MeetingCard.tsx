import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { MeetingWithDetails } from '@/lib/types'
import { formatSeats } from '@/lib/utils/formatters'

interface MeetingCardProps {
  meeting: MeetingWithDetails
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const formattedDate = format(new Date(meeting.date), 'dd MMM yyyy, HH:mm', {
    locale: ru,
  })

  return (
    <Link href={`/meetings/${meeting.id}`} className="block">
      <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md border border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            {meeting.title}
          </h3>
          {meeting.cefr_level && (
            <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {meeting.cefr_level}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">{meeting.club.name}</p>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>{formattedDate}</span>
          <span className="font-medium text-gray-700">
            {formatSeats(meeting.seats_taken, meeting.seats_total)}
          </span>
        </div>
      </div>
    </Link>
  )
}
