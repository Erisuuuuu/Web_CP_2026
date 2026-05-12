'use client'

import { useTransition } from 'react'
import { toggleUserActiveAction } from '@/app/(app)/admin/actions'

interface BlockUserButtonProps {
  userId: string
  userName: string
  isActive: boolean
}

export default function BlockUserButton({ userId, userName, isActive }: BlockUserButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const verb = isActive ? 'Заблокировать' : 'Разблокировать'
    const confirmed = window.confirm(`${verb} пользователя «${userName || userId}»?`)
    if (!confirmed) return

    startTransition(async () => {
      await toggleUserActiveAction(userId, !isActive)
    })
  }

  const baseClass = 'rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 transition-colors'
  const style = isActive
    ? { backgroundColor: '#fef2f2', color: '#dc2626' }
    : { backgroundColor: '#f0fdf4', color: '#16a34a' }

  return (
    <button onClick={handleClick} disabled={isPending} className={baseClass} style={style}>
      {isPending ? '...' : isActive ? 'Заблокировать' : 'Разблокировать'}
    </button>
  )
}
