import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, Box, Paper, useMediaQuery, useTheme } from '@mui/material'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { incomeApi } from '../api/incomeApi'
import { recurringExpenseApi } from '../api/recurringExpenseApi'
import { useCurrentBalance } from '../hooks/useCurrentBalance'
import MonthCalendar from '../components/calendar/MonthCalendar'
import BalanceSummary from '../components/common/BalanceSummary'
import ExpenseByCategoryChart from '../components/chart/ExpenseByCategoryChart'
import Loading from '../components/common/Loading'
import type { Expense } from '../types/expense'
import type { Income } from '../types/income'

export default function CalendarPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const { summary, loading: balanceLoading, refetch: refetchBalance } = useCurrentBalance()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const startOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD')
        const endOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')

        await recurringExpenseApi.getAll().catch(() => {})

        const [actualExpenses, plannedExpenses, actualIncomes, plannedIncomes] = await Promise.all([
          expenseApi.getByDateRange(startOfMonth, endOfMonth).catch(() => []),
          expenseApi.getPlanned().catch(() => []),
          incomeApi.getByDateRange(startOfMonth, endOfMonth).catch(() => []),
          incomeApi.getPlanned().catch(() => []),
        ])

        const filteredPlannedExpenses = plannedExpenses.filter(
          (e) => e.expenseDate >= startOfMonth && e.expenseDate <= endOfMonth
        )
        const filteredPlannedIncomes = plannedIncomes.filter(
          (i) => i.incomeDate >= startOfMonth && i.incomeDate <= endOfMonth
        )

        const allExpenses = [...actualExpenses]
        filteredPlannedExpenses.forEach((pe) => {
          if (!allExpenses.some((e) => e.id === pe.id)) allExpenses.push(pe)
        })

        const allIncomes = [...actualIncomes]
        filteredPlannedIncomes.forEach((pi) => {
          if (!allIncomes.some((i) => i.id === pi.id)) allIncomes.push(pi)
        })

        setExpenses(allExpenses)
        setIncomes(allIncomes)
        refetchBalance()
      } catch (err) {
        console.error('データの取得に失敗しました', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth, refetchBalance])

  const handleDayClick = (date: string) => {
    navigate(`/day/${date}`)
  }

  const monthlyIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const monthlyExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlyBalance = monthlyIncome - monthlyExpense

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          📅 カレンダー
        </Typography>
        {!isMobile && (
          <Typography variant="body2" color="text.secondary">
            日付をタップして詳細を確認しましょう
          </Typography>
        )}
      </Box>

      {/* 現在の総資産 */}
      <BalanceSummary summary={summary} loading={balanceLoading} />

      {/* 月間サマリー */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFAF5 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center', minWidth: { xs: '30%', sm: 'auto' } }}>
          <Typography variant="caption" color="text.secondary">
            📥 収入
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{ color: 'success.main', fontWeight: 700 }}
          >
            +{formatCurrency(monthlyIncome)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', minWidth: { xs: '30%', sm: 'auto' } }}>
          <Typography variant="caption" color="text.secondary">
            📤 支出
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{ color: 'error.main', fontWeight: 700 }}
          >
            -{formatCurrency(monthlyExpense)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', minWidth: { xs: '30%', sm: 'auto' } }}>
          <Typography variant="caption" color="text.secondary">
            📊 収支
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{
              color: monthlyBalance >= 0 ? 'primary.main' : 'error.main',
              fontWeight: 700,
            }}
          >
            {monthlyBalance >= 0 ? '+' : ''}
            {formatCurrency(monthlyBalance)}
          </Typography>
        </Box>
      </Paper>

      {/* カレンダーとグラフ */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Box sx={{ flex: 2 }}>
          <MonthCalendar
            currentMonth={currentMonth}
            expenses={expenses}
            incomes={incomes}
            onMonthChange={setCurrentMonth}
            onDayClick={handleDayClick}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <ExpenseByCategoryChart
            expenses={expenses}
            title={`${currentMonth.format('M月')}のカテゴリ別支出`}
          />
        </Box>
      </Box>
    </Container>
  )
}