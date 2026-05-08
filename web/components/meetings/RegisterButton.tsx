'use client'

import { useState, useTransition } from 'react'
import { registerAction, unregisterAction } from '@/app/(app)/meetings/actions'

interface RegisterButtonProps {
  meetingId: string
  isRegistered: boolean
  isFull: boolean
}

export function RegisterButton({ meetingId, isRegistered, isFull }: RegisterButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function handleRegister() {
    setMessage(null)
    startTransition(async () => {
      const result = await registerAction(meetingId)
      if (result.ok) {
        setMessage({ text: 'Вы успешно записаны!', ok: true })
      } else {
        const reasons: Record<string, string> = {
          full: 'Мест больше нет',
          duplicate: 'Вы уже записаны',
          inactive: 'Клуб неактивен',
          forbidden: 'Действие запрещено',
        }
        setMessage({ text: reasons[result.reason] ?? 'Ошибка записи', ok: false })
      }
    })
  }

  function handleUnregister() {
    setMessage(null)
    startTransition(async () => {
      const result = await unregisterAction(meetingId)
      if (result.ok) {
        setMessage({ text: 'Запись отменена', ok: true })
      } else {
        setMessage({ text: 'Не удалось отменить', ok: false })
      }
    })
  }

  if (isFull && !isRegistered) {
    return (
      <button type="button" disabled className="w-full rounded-lg py-2.5 text-sm font-semibold cursor-not-allowed" style={{ backgroundColor: '#e5ddd0', color: '#a8997c' }}>
        Мест нет
      </button>
    )
  }

  if (isRegistered) {
    return (
      <div>
        <button
          type="button"
          onClick={handleUnregister}
          disabled={isPending}
          className="w-full rounded-lg border py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: '#fff' }}
        >
          {isPending ? 'Отменяем...' : 'Отменить запись'}
        </button>
        {message && (
          <p className={`mt-2 text-center text-xs ${message.ok ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRegister}
        disabled={isPending}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: '#1c1917' }}
      >
        {isPending ? 'Записываемся...' : 'Записаться'}
      </button>
      {message && (
        <p className={`mt-2 text-center text-xs ${message.ok ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>
      )}
    </div>
  )
}
