import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Введите имя'),
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
