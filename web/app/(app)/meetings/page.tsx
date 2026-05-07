import { getMeetings } from '@/lib/services/meetings'
import { meetingFilterSchema } from '@/lib/validators/meeting'
import MeetingCard from '@/components/meetings/MeetingCard'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MeetingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Парсим query-параметры, игнорируем невалидные
  const raw = {
    cefr: typeof params.cefr === 'string' ? params.cefr : undefined,
    from: typeof params.from === 'string' ? params.from : undefined,
    to: typeof params.to === 'string' ? params.to : undefined,
  }

  const parsed = meetingFilterSchema.safeParse(raw)
  const filter = parsed.success ? parsed.data : {}

  const result = await getMeetings(filter)

  if (result.error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        Ошибка загрузки встреч: {result.error}
      </div>
    )
  }

  const meetings = result.data

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Встречи</h1>

      {meetings.length === 0 ? (
        <p className="text-gray-500">Встреч пока нет.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  )
}
