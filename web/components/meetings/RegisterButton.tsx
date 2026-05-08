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
          duplicate: 'Вы уже записаны на эту встречу',
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
        setMessage({ text: 'Не удалось отменить запись', ok: false })
      }
    })
  }

  if (isFull && !isRegistered) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed"
        >
          Мест нет
        </button>
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div>
        <button
          type="button"
          onClick={handleUnregister}
          disabled={isPending}
          className="w-full rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Отменяем...' : 'Отменить запись'}
        </button>
        {message && (
          <p className={`mt-2 text-center text-xs ${message.ok ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
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
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Записываемся...' : 'Записаться'}
      </button>
      {message && (
        <p className={`mt-2 text-center text-xs ${message.ok ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
