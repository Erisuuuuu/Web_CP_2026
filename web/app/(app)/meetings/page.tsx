import Link from 'next/link'
import { getMeetings } from '@/lib/services/meetings'
import { meetingFilterSchema } from '@/lib/validators/meeting'
import MeetingCard from '@/components/meetings/MeetingCard'
import MeetingsFilter from '@/components/meetings/MeetingsFilter'
import type { CefrLevel } from '@/lib/types'

const PAGE_STEP = 20

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MeetingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const cefrRaw = params.cefr
  const cefrArr = Array.isArray(cefrRaw) ? cefrRaw : cefrRaw ? [cefrRaw] : undefined

  const raw = {
    cefr: cefrArr,
    from: typeof params.from === 'string' ? params.from : undefined,
    to: typeof params.to === 'string' ? params.to : undefined,
  }

  const parsed = meetingFilterSchema.safeParse(raw)
  const filter = parsed.success ? parsed.data : {}

  const takeRaw = typeof params.take === 'string' ? parseInt(params.take, 10) : NaN
  const take = Number.isFinite(takeRaw) && takeRaw > 0 ? takeRaw : PAGE_STEP

  const result = await getMeetings(filter, take + 1)

  if (result.error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        Ошибка загрузки встреч: {result.error}
      </div>
    )
  }

  const all = result.data!
  const hasMore = all.length > take
  const meetings = hasMore ? all.slice(0, take) : all

  const loadMoreParams = new URLSearchParams()
  if (filter.cefr) filter.cefr.forEach((c) => loadMoreParams.append('cefr', c))
  if (filter.from) loadMoreParams.set('from', filter.from)
  if (filter.to) loadMoreParams.set('to', filter.to)
  loadMoreParams.set('take', String(take + PAGE_STEP))

  return (
    <div className="flex gap-8">
      <aside className="w-52 shrink-0">
        <MeetingsFilter
          defaultCefr={(filter.cefr ?? []) as CefrLevel[]}
          defaultFrom={filter.from}
          defaultTo={filter.to}
        />
      </aside>

      <div className="flex-1 min-w-0">
        <h1 className="mb-6 text-2xl font-bold" style={{ color: '#1c1917' }}>Каталог встреч</h1>

        {meetings.length === 0 ? (
          <p style={{ color: '#78716c' }}>Встреч пока нет.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={`/meetings?${loadMoreParams.toString()}`}
                  scroll={false}
                  className="rounded-lg border px-6 py-2 text-sm font-medium transition-colors hover:bg-stone-50"
                  style={{ borderColor: '#d6cdc0', color: '#1c1917' }}
                >
                  Загрузить ещё
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
