import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(5, 'Имя — минимум 5 символов')
      .regex(/^\S+$/, 'Имя не должно содержать пробелы'),
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Пароль — минимум 8 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
