import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Popover,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ChevronLeft, ChevronRight, ArrowDropDown } from '@mui/icons-material'
import dayjs, { Dayjs } from 'dayjs'
import type { Expense } from '../../types/expense'
import type { Income } from '../../types/income'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  currentMonth: Dayjs
  expenses: Expense[]
  incomes: Income[]
  onMonthChange: (month: Dayjs) => void
  onDayClick: (date: string) => void
}

export default function MonthCalendar({
  currentMonth,
  expenses,
  incomes,
  onMonthChange,
  onDayClick,
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  // 月選択ポップオーバー
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null)
  const [pickerYear, setPickerYear] = useState(currentMonth.year())

  const openPicker = (e: React.MouseEvent<HTMLElement>) => {
    setPickerYear(currentMonth.year())
    setPickerAnchor(e.currentTarget)
  }

  const closePicker = () => setPickerAnchor(null)

  const selectMonth = (year: number, month: number) => {
    onMonthChange(dayjs(new Date(year, month, 1)))
    closePicker()
  }

  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startDay = startOfMonth.day()
    const daysInMonth = endOfMonth.date()

    const days: Array<{ date: Dayjs | null; isCurrentMonth: boolean }> = []

    // 前月の日を追加
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }

    // 当月の日を追加
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: currentMonth.date(i), isCurrentMonth: true })
    }

    return days
  }, [currentMonth])

  const getDataForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const dayExpenses = expenses.filter((e) => e.expenseDate === dateStr)
    const dayIncomes = incomes.filter((i) => i.incomeDate === dateStr)
    const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = dayIncomes.reduce((sum, i) => sum + i.amount, 0)
    const hasPlanned = dayExpenses.some((e) => isPlanned(e.expenseDate)) ||
                       dayIncomes.some((i) => isPlanned(i.incomeDate))

    return { totalExpense, totalIncome, count: dayExpenses.length + dayIncomes.length, hasPlanned }
  }

  const formatCompact = (amount: number) => {
    if (amount >= 10000) {
      return `${Math.floor(amount / 10000)}万`
    }
    if (amount >= 1000) {
      return `${Math.floor(amount / 1000)}千`
    }
    return `${amount}`
  }

  const today = dayjs().format('YYYY-MM-DD')

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={() => onMonthChange(currentMonth.subtract(1, 'month'))}>
          <ChevronLeft />
        </IconButton>
        <Button
          onClick={openPicker}
          endIcon={<ArrowDropDown />}
          sx={{ color: 'text.primary', borderRadius: 2, px: 1.5 }}
        >
          <Typography variant={isMobile ? 'h6' : 'h5'} component="span" sx={{ fontWeight: 600 }}>
            {currentMonth.format('YYYY年 M月')}
          </Typography>
        </Button>
        <IconButton onClick={() => onMonthChange(currentMonth.add(1, 'month'))}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Popover
        open={Boolean(pickerAnchor)}
        anchorEl={pickerAnchor}
        onClose={closePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2, borderRadius: 3, width: 280 } } }}
      >
        {/* 年の切り替え */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <IconButton size="small" onClick={() => setPickerYear((y) => y - 1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {pickerYear}年
          </Typography>
          <IconButton size="small" onClick={() => setPickerYear((y) => y + 1)}>
            <ChevronRight />
          </IconButton>
        </Box>

        {/* 月の選択 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {Array.from({ length: 12 }, (_, m) => {
            const isSelected = pickerYear === currentMonth.year() && m === currentMonth.month()
            const isThisMonth = pickerYear === dayjs().year() && m === dayjs().month()
            return (
              <Button
                key={m}
                size="small"
                variant={isSelected ? 'contained' : isThisMonth ? 'outlined' : 'text'}
                onClick={() => selectMonth(pickerYear, m)}
                sx={{ minWidth: 0, borderRadius: 2 }}
              >
                {m + 1}月
              </Button>
            )
          })}
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={() => selectMonth(dayjs().year(), dayjs().month())}>
            今月
          </Button>
        </Box>
      </Popover>

      {/* 曜日ヘッダー */}
      <Box sx={{ display: 'flex', mb: 1 }}>
        {weekDays.map((day, index) => (
          <Box
            key={day}
            sx={{
              width: `${100 / 7}%`,
              textAlign: 'center',
              py: 0.5,
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              color: index === 0 ? 'error.main' : index === 6 ? 'primary.main' : 'text.secondary',
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* カレンダー本体 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {calendarDays.map((day, index) => {
          if (!day.date) {
            return (
              <Box
                key={`empty-${index}`}
                sx={{
                  width: `${100 / 7}%`,
                  aspectRatio: isMobile ? '1' : '1.2',
                }}
              />
            )
          }

          const dateStr = day.date.format('YYYY-MM-DD')
          const data = getDataForDate(day.date)
          const isToday = dateStr === today
          const dayOfWeek = day.date.day()

          return (
            <Box
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              sx={{
                width: `${100 / 7}%`,
                aspectRatio: isMobile ? '1' : '1.2',
                p: { xs: 0.25, sm: 0.5 },
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  p: { xs: 0.5, sm: 1 },
                  backgroundColor: isToday
                    ? 'primary.light'
                    : data.hasPlanned
                    ? 'rgba(255, 235, 59, 0.2)'
                    : 'transparent',
                  border: isToday ? '2px solid' : '1px solid',
                  borderColor: isToday ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: isToday ? 'primary.light' : 'rgba(93, 156, 89, 0.1)',
                    transform: 'scale(1.02)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 日付 */}
                <Typography
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    fontWeight: isToday ? 700 : 500,
                    color: isToday
                      ? 'primary.contrastText'
                      : dayOfWeek === 0
                      ? 'error.main'
                      : dayOfWeek === 6
                      ? 'primary.main'
                      : 'text.primary',
                  }}
                >
                  {day.date.date()}
                </Typography>

                {/* 収支表示 */}
                {data.count > 0 && (
                  <Box sx={{ mt: 'auto', overflow: 'hidden' }}>
                    {data.totalIncome > 0 && (
                      <Typography
                        sx={{
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: 'success.main',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        +{formatCompact(data.totalIncome)}
                      </Typography>
                    )}
                    {data.totalExpense > 0 && (
                      <Typography
                        sx={{
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: 'error.main',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        -{formatCompact(data.totalExpense)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}