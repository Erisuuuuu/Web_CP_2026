import { z } from 'zod'

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const meetingSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  // date поле в БД — принимаем как ISO строку (datetime-local input даёт формат без Z)
  date: z.string().min(1, 'Дата обязательна'),
  location: z.string().optional(),
  cefr_level: z.enum(cefrLevels, { error: 'Выберите уровень CEFR' }),
  seats_total: z.coerce.number().int().min(1, 'Минимум 1 место'),
})

export type MeetingInput = z.infer<typeof meetingSchema>

export const meetingFilterSchema = z.object({
  cefr: z.enum(cefrLevels).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export type MeetingFilter = z.infer<typeof meetingFilterSchema>
