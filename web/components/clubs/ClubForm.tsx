'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clubSchema, type ClubInput } from '@/lib/validators/club'
import type { Club } from '@/lib/types'

interface ClubFormProps {
  club?: Club
  action: (formData: FormData) => Promise<void | { error?: string }>
}

export default function ClubForm({ club, action }: ClubFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClubInput>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: club?.name ?? '',
      description: club?.description ?? '',
      language: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData()
    formData.set('name', values.name)
    if (values.description) formData.set('description', values.description)
    formData.set('language', values.language)
    await action(formData)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="name">
          Название клуба <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Например: English Speaking Club"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="language">
          Язык <span className="text-red-500">*</span>
        </label>
        <input
          id="language"
          type="text"
          {...register('language')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Например: English"
        />
        {errors.language && (
          <p className="mt-1 text-xs text-red-500">{errors.language.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="description">
          Описание
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Расскажите о клубе..."
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? 'Сохраняем...' : club ? 'Сохранить изменения' : 'Создать клуб'}
      </button>
    </form>
  )
}
