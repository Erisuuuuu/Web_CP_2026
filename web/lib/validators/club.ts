import { z } from 'zod'

export const clubSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
})

export type ClubInput = z.infer<typeof clubSchema>
