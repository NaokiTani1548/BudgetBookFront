import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useExpenses } from '../hooks/useExpenses'
import MonthCalendar from '../components/calendar/MonthCalendar'
import Loading from '../components/common/Loading'

export default function CalendarPage() {
  const navigate = useNavigate()
  const { expenses, loading, fetchExpensesByDateRange } = useExpenses()
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  useEffect(() => {
    const startOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD')
    const endOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')
    fetchExpensesByDateRange(startOfMonth, endOfMonth)
  }, [currentMonth, fetchExpensesByDateRange])

  const handleDayClick = (date: string) => {
    navigate(`/day/${date}`)
  }

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        📅 カレンダー
      </Typography>

      <MonthCalendar
        currentMonth={currentMonth}
        expenses={expenses}
        onMonthChange={setCurrentMonth}
        onDayClick={handleDayClick}
      />
    </Container>
  )
}