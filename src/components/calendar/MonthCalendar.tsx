import { useMemo } from 'react'
import { Box, Paper, Typography, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { Expense } from '../../types/expense'
import type { Income } from '../../types/income'

interface Props {
  currentMonth: dayjs.Dayjs
  expenses: Expense[]
  incomes: Income[]
  onMonthChange: (month: dayjs.Dayjs) => void
  onDayClick: (date: string) => void
}

export default function MonthCalendar({
  currentMonth,
  expenses,
  incomes,
  onMonthChange,
  onDayClick,
}: Props) {
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

  const incomesByDate = useMemo(() => {
    const map: Record<string, Income[]> = {}
    incomes.forEach((income) => {
      const date = income.incomeDate
      if (!map[date]) map[date] = []
      map[date].push(income)
    })
    return map
  }, [incomes])

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
        <Typography variant="h5">{currentMonth.format('YYYY年 M月')}</Typography>
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
          const dayIncomes = incomesByDate[dateStr] || []
          const isCurrentMonth = day.month() === currentMonth.month()
          const isToday = day.isSame(dayjs(), 'day')
          const isFuture = day.isAfter(dayjs(), 'day')
          const dayOfWeek = day.day()

          const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
          const totalIncome = dayIncomes.reduce((sum, i) => sum + i.amount, 0)
          const hasData = dayExpenses.length > 0 || dayIncomes.length > 0

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
                backgroundColor: isToday
                  ? 'action.selected'
                  : isFuture && hasData
                    ? 'rgba(255, 235, 59, 0.08)'
                    : 'transparent',
                opacity: isCurrentMonth ? 1 : 0.4,
                boxSizing: 'border-box',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => onDayClick(dateStr)}
            >
              {/* 日付 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday ? 'bold' : 'normal',
                    color:
                      dayOfWeek === 0 ? 'error.main' : dayOfWeek === 6 ? 'primary.main' : 'text.primary',
                  }}
                >
                  {day.date()}
                </Typography>
                {isFuture && hasData && (
                  <Typography variant="caption" sx={{ color: 'warning.main', fontSize: '0.6rem' }}>
                    予定
                  </Typography>
                )}
              </Box>

              {/* 収支サマリー */}
              <Box sx={{ mt: 0.5 }}>
                {totalIncome > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'success.main',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                    }}
                  >
                    +{formatCurrency(totalIncome)}
                  </Typography>
                )}
                {totalExpense > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'error.main',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                    }}
                  >
                    -{formatCurrency(totalExpense)}
                  </Typography>
                )}

                {/* 件数表示 */}
                {hasData && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      fontSize: '0.6rem',
                      mt: 0.5,
                    }}
                  >
                    {dayIncomes.length > 0 && `収入${dayIncomes.length}件`}
                    {dayIncomes.length > 0 && dayExpenses.length > 0 && ' / '}
                    {dayExpenses.length > 0 && `支出${dayExpenses.length}件`}
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