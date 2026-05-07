export type CsvRow = {
  name: string
  email: string
  cefr_level: string
  registered_at: string
}

function escapeField(value: string): string {
  // Wrap in quotes if the value contains comma, quote, or newline
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

export function generateCSV(rows: CsvRow[]): string {
  const header = 'name,email,cefr_level,registered_at'
  const lines = rows.map(
    (row) =>
      [
        escapeField(row.name),
        escapeField(row.email),
        escapeField(row.cefr_level),
        escapeField(row.registered_at),
      ].join(',')
  )
  return [header, ...lines].join('\n')
}
