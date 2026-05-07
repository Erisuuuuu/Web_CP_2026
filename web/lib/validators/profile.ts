import { z } from 'zod'

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const profileSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  bio: z.string().optional(),
  cefr_level: z.enum(cefrLevels).optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
