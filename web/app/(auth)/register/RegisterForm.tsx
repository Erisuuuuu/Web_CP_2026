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
    formData.set('name', data.name)
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

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
  const inputStyle = { border: '1px solid #d6cdc0', color: '#1c1917' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: '#57534e' }}>Имя</label>
        <input type="text" {...register('name')} className={inputClass} style={inputStyle} placeholder="Иван Иванов" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: '#57534e' }}>Email</label>
        <input type="email" {...register('email')} className={inputClass} style={inputStyle} placeholder="you@example.com" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: '#57534e' }}>Пароль</label>
        <input type="password" {...register('password')} className={inputClass} style={inputStyle} placeholder="Минимум 8 символов" />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: '#57534e' }}>Подтвердите пароль</label>
        <input type="password" {...register('confirmPassword')} className={inputClass} style={inputStyle} placeholder="••••••••" />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: '#1c1917' }}
      >
        {isPending ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}
