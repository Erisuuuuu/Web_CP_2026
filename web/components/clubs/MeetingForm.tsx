'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { meetingSchema, type MeetingInput } from '@/lib/validators/meeting'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

interface MeetingFormProps {
  clubId: string
  action: (formData: FormData) => Promise<void | { error?: string }>
}

export default function MeetingForm({ clubId, action }: MeetingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MeetingInput>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      seats_total: 10,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData()
    formData.set('club_id', clubId)
    formData.set('title', values.title)
    if (values.description) formData.set('description', values.description)
    formData.set('date', values.date)
    if (values.location) formData.set('location', values.location)
    formData.set('cefr_level', values.cefr_level)
    formData.set('seats_total', String(values.seats_total))
    await action(formData)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="title">
          Название встречи <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Например: Weekly Conversation Practice"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="description">
          Описание
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Тема встречи, что будем обсуждать..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="date">
          Дата и время <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="datetime-local"
          {...register('date')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="location">
          Адрес
        </label>
        <input
          id="location"
          type="text"
          {...register('location')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Кафе «Кофе Хауз», ул. Тверская 10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="cefr_level">
          Уровень CEFR <span className="text-red-500">*</span>
        </label>
        <select
          id="cefr_level"
          {...register('cefr_level')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Выберите уровень</option>
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

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="seats_total">
          Количество мест <span className="text-red-500">*</span>
        </label>
        <input
          id="seats_total"
          type="number"
          min={1}
          {...register('seats_total', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.seats_total && (
          <p className="mt-1 text-xs text-red-500">{errors.seats_total.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? 'Создаём...' : 'Создать встречу'}
      </button>
    </form>
  )
}
