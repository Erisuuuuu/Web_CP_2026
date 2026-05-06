'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth'
import { registerAction } from '../actions'

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterInput) => {
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)
    formData.set('confirmPassword', data.confirmPassword)

    startTransition(async () => {
      const result = await registerAction(formData)
      if (result?.error) {
        setError('root', { message: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Пароль</label>
        <input
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Минимум 8 символов"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Подтвердите пароль
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}
