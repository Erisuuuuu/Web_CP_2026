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
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData()
    formData.set('name', values.name)
    if (values.description) formData.set('description', values.description)
    await action(formData)
  })

  const inputClass = 'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors'
  const inputStyle = { border: '1px solid #d6cdc0', color: '#1c1917' }
  const labelStyle = { color: '#57534e', fontSize: '0.875rem', fontWeight: 500 as const }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block" style={labelStyle}>
          Название клуба <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className={inputClass}
          style={inputStyle}
          placeholder="Например: English Speaking Club"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block" style={labelStyle}>Описание</label>
        <textarea
          {...register('description')}
          rows={4}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          placeholder="Расскажите о клубе..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#1c1917' }}
      >
        {isSubmitting ? 'Сохраняем...' : club ? 'Сохранить изменения' : 'Создать клуб'}
      </button>
    </form>
  )
}
