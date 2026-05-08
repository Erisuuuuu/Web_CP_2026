interface ProgressBarProps {
  taken: number
  total: number
}

export function ProgressBar({ taken, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(Math.round((taken / total) * 100), 100) : 0
  const isFull = taken >= total

  return (
    <div>
      <div className="h-1.5 w-full rounded-full mb-1" style={{ backgroundColor: '#e5ddd0' }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: isFull ? '#dc2626' : '#1c1917' }}
        />
      </div>
      <p className="text-xs" style={{ color: '#78716c' }}>
        {taken} / {total} мест
      </p>
    </div>
  )
}
