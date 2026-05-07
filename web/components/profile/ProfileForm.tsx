'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileInput } from '@/lib/validators/profile'
import { updateProfileAction } from '@/app/(app)/profile/actions'
import type { Profile } from '@/lib/types'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

interface ProfileFormProps {
  profile: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio ?? '',
      cefr_level: profile.cefr_level ?? undefined,
    },
  })

  const onSubmit = (data: ProfileInput) => {
    setSuccessMessage(null)
    const formData = new FormData()
    formData.set('name', data.name)
    if (data.bio) formData.set('bio', data.bio)
    if (data.cefr_level) formData.set('cefr_level', data.cefr_level)

    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result?.error) {
        setError('root', { message: result.error })
      } else {
        setSuccessMessage('Профиль обновлён')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Имя <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Ваше имя"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          О себе
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          placeholder="Расскажите о себе..."
        />
        {errors.bio && (
          <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Уровень языка (CEFR)
        </label>
        <select
          {...register('cefr_level')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
        >
          <option value="">Не указано</option>
          {CEFR_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        {errors.cefr_level && (
          <p className="mt-1 text-xs text-red-500">{errors.cefr_level.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  )
}
