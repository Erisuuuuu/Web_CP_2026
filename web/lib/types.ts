// Доменные типы приложения.
// Supabase-типы (Row/Insert/Update) генерируются отдельно: supabase gen types typescript
// Здесь — типы для бизнес-логики и компонентов.

// ─── Роли ────────────────────────────────────────────────────────────────────

export type UserRole = 'member' | 'admin'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// Организатор — не роль в БД. Пользователь является организатором клуба,
// если clubs.owner_id === user.id. Проверяется через сервис.

// ─── Сущности (соответствуют таблицам БД) ────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  name: string
  bio: string | null
  cefr_level: CefrLevel | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Club {
  id: string
  owner_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Meeting {
  id: string
  club_id: string
  title: string
  date: string          // ISO 8601
  location: string | null
  seats_total: number
  cefr_level: CefrLevel | null
  created_at: string
}

export interface Registration {
  id: string
  user_id: string
  meeting_id: string
  registered_at: string
}

// ─── Составные типы (joins для UI) ───────────────────────────────────────────

// Карточка встречи в каталоге — встреча + клуб + счётчик мест
export interface MeetingWithDetails extends Meeting {
  club: Pick<Club, 'id' | 'name'>
  organizer: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  seats_taken: number   // COUNT(registrations)
}

// Строка в панели организатора
export interface MeetingRow extends Meeting {
  seats_taken: number
}

// Запись с профилем участника (для CSV-выгрузки)
export interface RegistrationWithProfile extends Registration {
  profile: Pick<Profile, 'name' | 'cefr_level'>
  email: string         // из auth.users через join
}

// ─── Фильтры ─────────────────────────────────────────────────────────────────

export interface MeetingFilter {
  cefr_level?: CefrLevel
  date_from?: string    // ISO 8601
  date_to?: string      // ISO 8601
}

// ─── Результат операции (единый паттерн для всех сервисов) ───────────────────

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string }

// Расширенный результат для записи на встречу (TDD-модуль)
export type RegistrationResult =
  | { ok: true }
  | { ok: false; reason: 'full' | 'duplicate' | 'inactive_club' | 'unauthorized' }

// ─── Формы (Input-типы для Server Actions) ───────────────────────────────────

export interface ProfileInput {
  name: string
  bio?: string
  cefr_level?: CefrLevel
}

export interface ClubInput {
  name: string
  description?: string
}

export interface MeetingInput {
  club_id: string
  title: string
  date: string
  location?: string
  seats_total: number
  cefr_level?: CefrLevel
}
