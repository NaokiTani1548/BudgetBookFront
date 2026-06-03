import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ArrowBack, ChevronLeft, ChevronRight } from '@mui/icons-material'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { incomeApi } from '../api/incomeApi'
import { summaryApi } from '../api/summaryApi'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import ExpenseForm from '../components/expense/ExpenseForm'
import ExpenseList from '../components/expense/ExpenseList'
import IncomeForm from '../components/income/IncomeForm'
import IncomeList from '../components/income/IncomeList'
import Loading from '../components/common/Loading'
import Notification from '../components/common/Notification'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest } from '../types/expense'
import type { Income, CreateIncomeRequest } from '../types/income'
import type { ForecastSummary } from '../types/summary'

export default function DayDetailPage() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [summary, setSummary] = useState<ForecastSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'expense' | 'income'>('expense')
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null)
  const [deleteIncomeTarget, setDeleteIncomeTarget] = useState<Income | null>(null)

  // カテゴリを別々に取得
  const { categories: expenseCategories, createCategory: createExpenseCategory } = useCategories('EXPENSE')
  const { categories: incomeCategories, createCategory: createIncomeCategory } = useCategories('INCOME')
  const { notification, showSuccess, showError, hideNotification } = useNotification()

  const currentDate = dayjs(date)

  const fetchData = useCallback(async () => {
    if (!date) return
    try {
      setLoading(true)
      const [expenseData, incomeData, summaryData] = await Promise.all([
        expenseApi.getByDateRange(date, date),
        incomeApi.getByDateRange(date, date),
        summaryApi.getForecast(date),
      ])
      setExpenses(expenseData)
      setIncomes(incomeData)
      setSummary(summaryData)
    } catch (error) {
      console.error('データの取得に失敗しました', error)
      showError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [date, showError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    try {
      await expenseApi.create(data)
      showSuccess('支出を追加しました')
      fetchData()
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    try {
      await incomeApi.create(data)
      showSuccess('収入を追加しました')
      fetchData()
    } catch {
      showError('収入の追加に失敗しました')
    }
  }

  const handleDeleteExpense = async () => {
    if (!deleteExpenseTarget) return
    try {
      await expenseApi.delete(deleteExpenseTarget.id)
      showSuccess('支出を削除しました')
      setDeleteExpenseTarget(null)
      fetchData()
    } catch {
      showError('削除に失敗しました')
    }
  }

  const handleDeleteIncome = async () => {
    if (!deleteIncomeTarget) return
    try {
      await incomeApi.delete(deleteIncomeTarget.id)
      showSuccess('収入を削除しました')
      setDeleteIncomeTarget(null)
      fetchData()
    } catch {
      showError('削除に失敗しました')
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev'
      ? currentDate.subtract(1, 'day')
      : currentDate.add(1, 'day')
    navigate(`/day/${newDate.format('YYYY-MM-DD')}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (loading) return <Loading />

  const dayTotal = {
    income: incomes.reduce((sum, i) => sum + i.amount, 0),
    expense: expenses.reduce((sum, e) => sum + e.amount, 0),
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/calendar')}
          sx={{ mb: 1 }}
        >
          カレンダーに戻る
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigateDate('prev')}>
            <ChevronLeft />
          </IconButton>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            📅 {currentDate.format('YYYY年M月D日')}
          </Typography>
          <IconButton onClick={() => navigateDate('next')}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* サマリー */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFAF5 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center', minWidth: { xs: '45%', sm: 'auto' } }}>
          <Typography variant="caption" color="text.secondary">
            📥 収入
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{ color: 'success.main', fontWeight: 700 }}
          >
            +{formatCurrency(dayTotal.income)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', minWidth: { xs: '45%', sm: 'auto' } }}>
          <Typography variant="caption" color="text.secondary">
            📤 支出
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{ color: 'error.main', fontWeight: 700 }}
          >
            -{formatCurrency(dayTotal.expense)}
          </Typography>
        </Box>
        {summary && (
          <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: 'auto' } }}>
            <Typography variant="caption" color="text.secondary">
              💰 この日時点の残高
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{
                color: summary.forecastBalance >= 0 ? 'primary.main' : 'error.main',
                fontWeight: 700,
              }}
            >
              {formatCurrency(summary.forecastBalance)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* タブ */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            minWidth: { xs: 0, sm: 120 },
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1, sm: 3 },
          },
        }}
      >
        <Tab label={`💸 支出 (${expenses.length})`} value="expense" />
        <Tab label={`💰 収入 (${incomes.length})`} value="income" />
      </Tabs>

    {/* フォーム・リスト */}
    {tab === 'expense' ? (
    <>
        <ExpenseForm
        categories={expenseCategories}
        onSubmit={handleCreateExpense}
        onCreateCategory={createExpenseCategory}
        initialDate={date}
        />
        <ExpenseList
        expenses={expenses}
        onEdit={() => {}} // TODO: 編集機能
        onDelete={(id) => {
            const target = expenses.find((e) => e.id === id)
            if (target) setDeleteExpenseTarget(target)
        }}
        showDate={false}
        />
    </>
    ) : (
    <>
        <IncomeForm
        categories={incomeCategories}
        onSubmit={handleCreateIncome}
        onCreateCategory={createIncomeCategory}
        initialDate={date}
        />
        <IncomeList
        incomes={incomes}
        onEdit={() => {}} // TODO: 編集機能
        onDelete={(id) => {
            const target = incomes.find((i) => i.id === id)
            if (target) setDeleteIncomeTarget(target)
        }}
        showDate={false}
        />
    </>
    )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteExpenseTarget}
        title="支出の削除"
        message={`「${deleteExpenseTarget?.description || ''}」を削除しますか？`}
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteExpenseTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteIncomeTarget}
        title="収入の削除"
        message={`「${deleteIncomeTarget?.description || ''}」を削除しますか？`}
        onConfirm={handleDeleteIncome}
        onCancel={() => setDeleteIncomeTarget(null)}
      />

      {/* 通知 */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Container>
  )
}