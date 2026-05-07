/**
 * Форматирует счётчик мест: "X из N мест"
 */
export function formatSeats(taken: number, total: number): string {
  return `${taken} из ${total} мест`
}
