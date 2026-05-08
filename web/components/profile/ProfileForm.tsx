'use client'

import { useTransition, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileInput } from '@/lib/validators/profile'
import { updateProfileAction } from '@/app/(app)/profile/actions'
import type { Profile, CefrLevel } from '@/lib/types'

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface ProfileFormProps {
  profile: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | ''>(profile.cefr_level ?? '')

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name ?? '',
      bio: profile.bio ?? '',
      cefr_level: profile.cefr_level ?? undefined,
    },
  })

  function handleCefrToggle(level: CefrLevel) {
    const next = selectedCefr === level ? '' : level
    setSelectedCefr(next)
    setValue('cefr_level', next as CefrLevel | undefined)
  }

  const onSubmit: SubmitHandler<ProfileInput> = (data) => {
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

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
  const inputStyle = { border: '1px solid #d6cdc0', color: '#1c1917' }
  const labelStyle = { color: '#57534e', fontSize: '0.875rem', fontWeight: 500 as const }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1 block" style={labelStyle}>
          Имя <span className="text-red-500">*</span>
        </label>
        <input type="text" {...register('name')} className={inputClass} style={inputStyle} placeholder="Ваше имя" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block" style={labelStyle}>О себе (bio)</label>
        <textarea
          {...register('bio')}
          rows={4}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          placeholder="Расскажите о себе..."
        />
        {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      <div>
        <label className="mb-2 block" style={labelStyle}>Уровень языка</label>
        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleCefrToggle(level)}
              className="rounded-full px-4 py-1.5 text-sm font-medium border transition-colors"
              style={selectedCefr === level
                ? { backgroundColor: '#1c1917', color: '#fff', borderColor: '#1c1917' }
                : { backgroundColor: '#fff', color: '#57534e', borderColor: '#d6cdc0' }
              }
            >
              {level}
            </button>
          ))}
        </div>
        {errors.cefr_level && <p className="mt-1 text-xs text-red-500">{errors.cefr_level.message}</p>}
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.root.message}</p>
      )}
      {successMessage && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{successMessage}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#1c1917' }}
        >
          {isPending ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
        <a
          href="/profile"
          className="rounded-lg px-6 py-2 text-sm font-medium border transition-colors hover:bg-stone-50"
          style={{ borderColor: '#d6cdc0', color: '#57534e' }}
        >
          Отмена
        </a>
      </div>
    </form>
  )
}
