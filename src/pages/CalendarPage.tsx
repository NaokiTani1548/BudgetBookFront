import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { incomeApi } from '../api/incomeApi'
import { useCurrentBalance } from '../hooks/useCurrentBalance'
import MonthCalendar from '../components/calendar/MonthCalendar'
import BalanceSummary from '../components/common/BalanceSummary'
import Loading from '../components/common/Loading'
import type { Expense } from '../types/expense'
import type { Income } from '../types/income'

export default function CalendarPage() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const { summary, loading: balanceLoading } = useCurrentBalance()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const startOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD')
        const endOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')

        // 通常データと予定データを両方取得
        const [
          actualExpenses,
          plannedExpenses,
          actualIncomes,
          plannedIncomes,
        ] = await Promise.all([
          expenseApi.getByDateRange(startOfMonth, endOfMonth).catch(() => []),
          expenseApi.getPlanned().catch(() => []),
          incomeApi.getByDateRange(startOfMonth, endOfMonth).catch(() => []),
          incomeApi.getPlanned().catch(() => []),
        ])

        // 予定データを当月でフィルタリング
        const filteredPlannedExpenses = plannedExpenses.filter((e) => {
          const expDate = e.expenseDate || e.plannedDate
          return expDate && expDate >= startOfMonth && expDate <= endOfMonth
        })

        const filteredPlannedIncomes = plannedIncomes.filter((i) => {
          const incDate = i.incomeDate || i.plannedDate
          return incDate && incDate >= startOfMonth && incDate <= endOfMonth
        })

        // 重複を除いて結合（IDベースで重複チェック）
        const allExpenses = [...actualExpenses]
        filteredPlannedExpenses.forEach((pe) => {
          if (!allExpenses.some((e) => e.id === pe.id)) {
            allExpenses.push(pe)
          }
        })

        const allIncomes = [...actualIncomes]
        filteredPlannedIncomes.forEach((pi) => {
          if (!allIncomes.some((i) => i.id === pi.id)) {
            allIncomes.push(pi)
          }
        })

        setExpenses(allExpenses)
        setIncomes(allIncomes)
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

      {/* 現在の総資産 */}
      <BalanceSummary summary={summary} loading={balanceLoading} />

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