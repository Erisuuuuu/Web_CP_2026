'use client'

import { useTransition, useState, useRef } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileInput } from '@/lib/validators/profile'
import { updateProfileAction } from '@/app/(app)/profile/actions'
import { createClient } from '@/lib/supabase/client'
import type { Profile, CefrLevel } from '@/lib/types'

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface ProfileEditorProps {
  profile: Profile
  userId: string
}

export default function ProfileEditor({ profile, userId }: ProfileEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | ''>(profile.cefr_level ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = profile.name
    ? profile.name.slice(0, 2).toUpperCase()
    : (profile as { user_email?: string }).user_email?.slice(0, 2).toUpperCase() ?? '??'

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name ?? '',
      bio: profile.bio ?? '',
      cefr_level: profile.cefr_level ?? undefined,
    },
  })

  const currentName = watch('name') || profile.name || 'Без имени'
  const currentBio = watch('bio') || profile.bio || ''

  function handleCefrToggle(level: CefrLevel) {
    const next = selectedCefr === level ? '' : level
    setSelectedCefr(next)
    setValue('cefr_level', next as CefrLevel | undefined)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl + '?t=' + Date.now())
      // persist to profile
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('user_id', userId)
    } catch {
      // silent — avatar upload not critical
    } finally {
      setAvatarUploading(false)
    }
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

  const ic = 'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors'
  const is = { border: '1px solid #d6cdc0', color: '#1c1917' }
  const ls = { color: '#57534e', fontSize: '0.875rem', fontWeight: 500 as const }

  return (
    <div className="flex gap-6 items-start">
      {/* Left card */}
      <div className="w-52 shrink-0 rounded-xl bg-white border flex flex-col items-center text-center gap-3 p-6" style={{ borderColor: '#e5ddd0' }}>
        {/* Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white transition-opacity hover:opacity-80 overflow-hidden"
            style={{ backgroundColor: '#1c1917' }}
            title="Изменить фото"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>
          {avatarUploading && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <span className="text-white text-xs">...</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <p className="text-xs" style={{ color: '#78716c' }}>Нажмите на фото чтобы изменить</p>

        <div>
          <p className="font-semibold text-sm" style={{ color: '#1c1917' }}>{currentName}</p>
          {selectedCefr && (
            <span className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium border" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
              {selectedCefr}
            </span>
          )}
          {currentBio && (
            <p className="mt-2 text-xs leading-relaxed" style={{ color: '#78716c' }}>{currentBio}</p>
          )}
        </div>

        {/* Save button here */}
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="w-full rounded-lg py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#1c1917' }}
        >
          {isPending ? 'Сохранение...' : 'Сохранить'}
        </button>

        {successMessage && (
          <p className="text-xs text-green-700">{successMessage}</p>
        )}
        {errors.root && (
          <p className="text-xs text-red-600">{errors.root.message}</p>
        )}
      </div>

      {/* Right form */}
      <div className="flex-1 rounded-xl bg-white border p-6" style={{ borderColor: '#e5ddd0' }}>
        <h1 className="mb-5 text-xl font-semibold" style={{ color: '#1c1917' }}>Редактировать профиль</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1 block" style={ls}>Имя <span className="text-red-500">*</span></label>
            <input type="text" {...register('name')} className={ic} style={is} placeholder="Ваше имя" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block" style={ls}>О себе (bio)</label>
            <textarea {...register('bio')} rows={4} className={`${ic} resize-none`} style={is} placeholder="Расскажите о себе..." />
            {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="mb-2 block" style={ls}>Уровень языка</label>
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
          </div>
        </form>
      </div>
    </div>
  )
}
