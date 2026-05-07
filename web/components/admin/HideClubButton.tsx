'use client'

import { useTransition } from 'react'
import { hideClubAction } from '@/app/(app)/admin/actions'

interface HideClubButtonProps {
  clubId: string
  clubName: string
}

export default function HideClubButton({ clubId, clubName }: HideClubButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = window.confirm(
      `Скрыть клуб «${clubName}»? Клуб станет недоступен для участников.`
    )
    if (!confirmed) return

    startTransition(async () => {
      await hideClubAction(clubId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-100 disabled:opacity-50"
    >
      {isPending ? 'Скрытие…' : 'Скрыть'}
    </button>
  )
}
