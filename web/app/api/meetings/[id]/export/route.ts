import { createClient } from '@/lib/supabase/server'
import { getMeetingRegistrations } from '@/lib/services/registrations'
import { generateCSV } from '@/lib/utils/csv'
import type { CsvRow } from '@/lib/utils/csv'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Проверяем сессию
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Получаем регистрации (сервис проверяет права)
  const result = await getMeetingRegistrations(id, user.id)

  if (result.error) {
    if (result.error === 'forbidden') {
      return new Response('Forbidden', { status: 403 })
    }
    return new Response(result.error, { status: 404 })
  }

  // 3. Генерируем CSV
  const rows: CsvRow[] = result.data.map((reg) => ({
    name: reg.profile.name ?? '',
    email: reg.email,
    cefr_level: reg.profile.cefr_level ?? '',
    registered_at: reg.registered_at,
  }))

  const csv = generateCSV(rows)

  // 4. Возвращаем файл
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="meeting-${id}.csv"`,
    },
  })
}
