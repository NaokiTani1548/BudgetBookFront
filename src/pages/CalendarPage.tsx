import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { incomeApi } from '../api/incomeApi'
import MonthCalendar from '../components/calendar/MonthCalendar'
import Loading from '../components/common/Loading'
import type { Expense } from '../types/expense'
import type { Income } from '../types/income'

export default function CalendarPage() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const startOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD')
        const endOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')

        const [expensesData, incomesData] = await Promise.all([
          expenseApi.getByDateRange(startOfMonth, endOfMonth),
          incomeApi.getByDateRange(startOfMonth, endOfMonth),
        ])

        setExpenses(expensesData)
        setIncomes(incomesData)
      } catch (err) {
        console.error('データの取得に失敗しました', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth])

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
        incomes={incomes}
        onMonthChange={setCurrentMonth}
        onDayClick={handleDayClick}
      />
    </Container>
  )
}