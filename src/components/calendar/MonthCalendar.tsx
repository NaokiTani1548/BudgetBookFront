import { useMemo } from 'react'
import { Box, Paper, Typography, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { Expense } from '../../types/expense'

interface Props {
  currentMonth: dayjs.Dayjs
  expenses: Expense[]
  onMonthChange: (month: dayjs.Dayjs) => void
  onDayClick: (date: string) => void
}

export default function MonthCalendar({ currentMonth, expenses, onMonthChange, onDayClick }: Props) {
  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startOfCalendar = startOfMonth.startOf('week')
    const endOfCalendar = endOfMonth.endOf('week')

    const days: dayjs.Dayjs[] = []
    let current = startOfCalendar

    while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
      days.push(current)
      current = current.add(1, 'day')
    }

    return days
  }, [currentMonth])

  const expensesByDate = useMemo(() => {
    const map: Record<string, Expense[]> = {}
    expenses.forEach((expense) => {
      const date = expense.expenseDate
      if (!map[date]) map[date] = []
      map[date].push(expense)
    })
    return map
  }, [expenses])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      notation: 'compact',
    }).format(amount)
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => onMonthChange(currentMonth.subtract(1, 'month'))}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h5">
          {currentMonth.format('YYYY年 M月')}
        </Typography>
        <IconButton onClick={() => onMonthChange(currentMonth.add(1, 'month'))}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* 曜日ヘッダー */}
      <Box sx={{ display: 'flex' }}>
        {weekDays.map((day, index) => (
          <Box
            key={day}
            sx={{
              flex: 1,
              textAlign: 'center',
              py: 1,
              fontWeight: 'bold',
              color: index === 0 ? 'error.main' : index === 6 ? 'primary.main' : 'text.primary',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* カレンダー本体 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {calendarDays.map((day) => {
          const dateStr = day.format('YYYY-MM-DD')
          const dayExpenses = expensesByDate[dateStr] || []
          const isCurrentMonth = day.month() === currentMonth.month()
          const isToday = day.isSame(dayjs(), 'day')
          const dayOfWeek = day.day()

          return (
            <Box
              key={dateStr}
              sx={{
                width: `${100 / 7}%`,
                minHeight: 100,
                border: 1,
                borderColor: 'divider',
                p: 0.5,
                cursor: 'pointer',
                backgroundColor: isToday ? 'action.selected' : 'transparent',
                opacity: isCurrentMonth ? 1 : 0.4,
                boxSizing: 'border-box',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => onDayClick(dateStr)}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isToday ? 'bold' : 'normal',
                  color: dayOfWeek === 0 ? 'error.main' : dayOfWeek === 6 ? 'primary.main' : 'text.primary',
                }}
              >
                {day.date()}
              </Typography>
              <Box sx={{ mt: 0.5, overflow: 'hidden', maxHeight: 70 }}>
                {dayExpenses.slice(0, 3).map((expense) => (
                  <Typography
                    key={expense.id}
                    variant="caption"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'error.main',
                    }}
                  >
                    {expense.description || expense.categoryName}: {formatCurrency(expense.amount)}
                  </Typography>
                ))}
                {dayExpenses.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    他 {dayExpenses.length - 3} 件
                  </Typography>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}