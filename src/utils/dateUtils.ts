import dayjs from 'dayjs'

/**
 * 日付が今日以前かどうか（実績）
 */
export const isActual = (date: string): boolean => {
  const today = dayjs().format('YYYY-MM-DD')
  return date <= today
}

/**
 * 日付が未来かどうか（予定）
 */
export const isPlanned = (date: string): boolean => {
  const today = dayjs().format('YYYY-MM-DD')
  return date > today
}

/**
 * 今日の日付を取得
 */
export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD')
}