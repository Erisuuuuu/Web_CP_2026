'use client'

import { useTransition } from 'react'
import { toggleClubActiveAction } from '@/app/(app)/admin/actions'

interface HideClubButtonProps {
  clubId: string
  clubName: string
  isActive: boolean
}

export default function HideClubButton({ clubId, clubName, isActive }: HideClubButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const verb = isActive ? 'Скрыть' : 'Вернуть'
    const confirmed = window.confirm(`${verb} клуб «${clubName}»?`)
    if (!confirmed) return

    startTransition(async () => {
      await toggleClubActiveAction(clubId, !isActive)
    })
  }

  const style = isActive
    ? { backgroundColor: '#fff7ed', color: '#c2410c' }
    : { backgroundColor: '#f0fdf4', color: '#16a34a' }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 transition-colors"
      style={style}
    >
      {isPending ? '...' : isActive ? 'Скрыть' : 'Вернуть'}
    </button>
  )
}
