'use client'

import { useTransition } from 'react'
import { blockUserAction } from '@/app/(app)/admin/actions'

interface BlockUserButtonProps {
  userId: string
  userName: string
}

export default function BlockUserButton({ userId, userName }: BlockUserButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = window.confirm(
      `Заблокировать пользователя «${userName || userId}»? Это действие нельзя отменить из UI.`
    )
    if (!confirmed) return

    startTransition(async () => {
      await blockUserAction(userId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
    >
      {isPending ? 'Блокировка…' : 'Заблокировать'}
    </button>
  )
}
