import { z } from 'zod'

export const clubSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  language: z.string().min(1, 'Язык обязателен'),
})

export type ClubInput = z.infer<typeof clubSchema>
