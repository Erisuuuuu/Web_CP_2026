interface ProgressBarProps {
  taken: number
  total: number
}

export function ProgressBar({ taken, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(Math.round((taken / total) * 100), 100) : 0

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {taken} из {total} мест
      </p>
    </div>
  )
}
