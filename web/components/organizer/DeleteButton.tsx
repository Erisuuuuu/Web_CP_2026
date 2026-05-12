'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deleteMeetingAction, deleteClubAction } from '@/app/(app)/clubs/actions'

interface DeleteButtonProps {
  type: 'meeting' | 'club'
  id: string
  name: string
  redirectTo?: string
}

export default function DeleteButton({ type, id, name, redirectTo }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    const label = type === 'meeting' ? 'встречу' : 'клуб'
    const extra = type === 'club' ? ' Вместе с ним удалятся все встречи и записи.' : ''
    const confirmed = window.confirm(`Удалить ${label} «${name}»?${extra}`)
    if (!confirmed) return

    startTransition(async () => {
      const result = type === 'meeting'
        ? await deleteMeetingAction(id)
        : await deleteClubAction(id)
      if (result.error) {
        window.alert('Ошибка: ' + result.error)
        return
      }
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
      style={{ borderColor: '#fecaca', color: '#dc2626', backgroundColor: '#fff' }}
    >
      {isPending ? '...' : 'Удалить'}
    </button>
  )
}
