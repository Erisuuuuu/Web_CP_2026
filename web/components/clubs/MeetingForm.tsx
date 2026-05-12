'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { meetingSchema, type MeetingInput } from '@/lib/validators/meeting'
import type { Meeting } from '@/lib/types'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

interface MeetingFormProps {
  clubId: string
  action: (formData: FormData) => Promise<void | { error?: string }>
  meeting?: Meeting
}

export default function MeetingForm({ clubId, action, meeting }: MeetingFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MeetingInput>({
    resolver: zodResolver(meetingSchema),
    defaultValues: meeting
      ? {
          title: meeting.title,
          description: meeting.description ?? '',
          date: meeting.date.slice(0, 16),
          location: meeting.location ?? '',
          cefr_level: meeting.cefr_level ?? undefined,
          seats_total: meeting.seats_total,
        }
      : { title: '', description: '', date: '', location: '', seats_total: 10 },
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
    const result = await action(formData)
    if (result?.error) {
      setError('root', { message: result.error })
    }
  })

  const ic = 'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors'
  const is = { border: '1px solid #d6cdc0', color: '#1c1917' }
  const ls = { color: '#57534e', fontSize: '0.875rem', fontWeight: 500 as const }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block" style={ls}>Название встречи <span className="text-red-500">*</span></label>
        <input type="text" {...register('title')} className={ic} style={is} placeholder="Например: Weekly Conversation Practice" />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1 block" style={ls}>Описание</label>
        <textarea {...register('description')} rows={3} className={`${ic} resize-none`} style={is} placeholder="Тема встречи, что будем обсуждать..." />
      </div>

      <div>
        <label className="mb-1 block" style={ls}>Дата и время <span className="text-red-500">*</span></label>
        <input
          type="datetime-local"
          {...register('date')}
          className={ic}
          style={is}
          min={new Date().toISOString().slice(0, 16)}
          max="2030-12-31T23:59"
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>

      <div>
        <label className="mb-1 block" style={ls}>Адрес</label>
        <input type="text" {...register('location')} className={ic} style={is} placeholder="Кафе «Кофе Хауз», ул. Тверская 10" />
      </div>

      <div>
        <label className="mb-1 block" style={ls}>Уровень CEFR <span className="text-red-500">*</span></label>
        <select {...register('cefr_level')} className={ic} style={{ ...is, backgroundColor: '#fff' }}>
          <option value="">Выберите уровень</option>
          {CEFR_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.cefr_level && <p className="mt-1 text-xs text-red-500">{errors.cefr_level.message}</p>}
      </div>

      <div>
        <label className="mb-1 block" style={ls}>Количество мест <span className="text-red-500">*</span></label>
        <input type="number" min={1} {...register('seats_total', { valueAsNumber: true })} className={ic} style={is} />
        {errors.seats_total && <p className="mt-1 text-xs text-red-500">{errors.seats_total.message}</p>}
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#1c1917' }}
      >
        {isSubmitting ? 'Сохраняем...' : meeting ? 'Сохранить изменения' : 'Создать встречу'}
      </button>
    </form>
  )
}
