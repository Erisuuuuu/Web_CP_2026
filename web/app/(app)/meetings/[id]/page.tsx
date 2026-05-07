import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getMeeting } from '@/lib/services/meetings'
import { formatSeats } from '@/lib/utils/formatters'

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
  const formattedDate = format(new Date(meeting.date), 'dd MMMM yyyy, HH:mm', {
    locale: ru,
  })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        {/* Заголовок */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
          {meeting.cefr_level && (
            <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {meeting.cefr_level}
            </span>
          )}
        </div>

        {/* Клуб */}
        <p className="mt-2 text-sm text-gray-500">
          Клуб:{' '}
          <Link
            href={`/clubs/${meeting.club.id}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {meeting.club.name}
          </Link>
        </p>

        {/* Описание */}
        {meeting.location && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-700">Адрес</h2>
            <p className="mt-1 text-sm text-gray-600">{meeting.location}</p>
          </div>
        )}

        {/* Дата */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Дата и время</h2>
            <p className="mt-1 text-sm text-gray-600">{formattedDate}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-700">Места</h2>
            <p className="mt-1 text-sm text-gray-600">
              {formatSeats(meeting.seats_taken, meeting.seats_total)}
            </p>
          </div>
        </div>

        {/* Организатор */}
        <div className="mt-4">
          <h2 className="text-sm font-medium text-gray-700">Организатор</h2>
          <p className="mt-1 text-sm text-gray-600">{meeting.organizer.name}</p>
        </div>

        {/* Кнопка записи — заглушка (реализация в Шаге 4) */}
        <div className="mt-8">
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            Записаться
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Запись откроется в ближайшее время
          </p>
        </div>
      </div>
    </div>
  )
}
