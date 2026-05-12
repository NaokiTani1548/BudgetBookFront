import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Typography, Button, Box, Paper, Tabs, Tab, Divider } from '@mui/material'
import { ArrowBack, Add, AccountBalance } from '@mui/icons-material'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { incomeApi } from '../api/incomeApi'
import { summaryApi } from '../api/summaryApi'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import ExpenseList from '../components/expense/ExpenseList'
import ExpenseEditDialog from '../components/expense/ExpenseEditDialog'
import ExpenseForm from '../components/expense/ExpenseForm'
import IncomeList from '../components/income/IncomeList'
import IncomeEditDialog from '../components/income/IncomeEditDialog'
import IncomeForm from '../components/income/IncomeForm'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'
import type { ForecastSummary } from '../types/summary'

export default function DayDetailPage() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { expenseCategories, incomeCategories, createCategory } = useCategories()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [summary, setSummary] = useState<ForecastSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'expense' | 'income'; id: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState<'expense' | 'income' | null>(null)
  const [tabIndex, setTabIndex] = useState(0)

  const isFuture = useMemo(() => {
    if (!date) return false
    return dayjs(date).isAfter(dayjs(), 'day')
  }, [date])

  const isToday = useMemo(() => {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'day')
  }, [date])

  const fetchData = async () => {
    if (!date) return
    try {
      setLoading(true)

      // 通常データと予定データを両方取得
      const [
        actualExpenses,
        plannedExpenses,
        actualIncomes,
        plannedIncomes,
        summaryData,
      ] = await Promise.all([
        expenseApi.getByDateRange(date, date).catch(() => []),
        expenseApi.getPlanned().catch(() => []),
        incomeApi.getByDateRange(date, date).catch(() => []),
        incomeApi.getPlanned().catch(() => []),
        summaryApi.getForecast(date),
      ])

      // 日付でフィルタリングして結合
      const filteredPlannedExpenses = plannedExpenses.filter(
        (e) => e.expenseDate === date || e.plannedDate === date
      )
      const filteredPlannedIncomes = plannedIncomes.filter(
        (i) => i.incomeDate === date || i.plannedDate === date
      )

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
      setSummary(summaryData)
    } catch (err) {
      showError('データの取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [date])

  // 支出のハンドラー
  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    try {
      const newExpense = await expenseApi.create(data)
      setExpenses((prev) => [newExpense, ...prev])
      showSuccess('支出を追加しました')
      setShowAddForm(null)
      // サマリー更新
      const summaryData = await summaryApi.getForecast(date!)
      setSummary(summaryData)
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  const handleUpdateExpense = async (id: string, data: UpdateExpenseRequest) => {
    try {
      const updated = await expenseApi.update(id, data)
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
      showSuccess('支出を更新しました')
      setEditingExpense(null)
      const summaryData = await summaryApi.getForecast(date!)
      setSummary(summaryData)
    } catch {
      showError('支出の更新に失敗しました')
    }
  }

  // 収入のハンドラー
  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    try {
      const newIncome = await incomeApi.create(data)
      setIncomes((prev) => [newIncome, ...prev])
      showSuccess('収入を追加しました')
      setShowAddForm(null)
      const summaryData = await summaryApi.getForecast(date!)
      setSummary(summaryData)
    } catch {
      showError('収入の追加に失敗しました')
    }
  }

  const handleUpdateIncome = async (id: string, data: UpdateIncomeRequest) => {
    try {
      const updated = await incomeApi.update(id, data)
      setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)))
      showSuccess('収入を更新しました')
      setEditingIncome(null)
      const summaryData = await summaryApi.getForecast(date!)
      setSummary(summaryData)
    } catch {
      showError('収入の更新に失敗しました')
    }
  }

  // 削除ハンドラー
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'expense') {
        await expenseApi.delete(deleteTarget.id)
        setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      } else {
        await incomeApi.delete(deleteTarget.id)
        setIncomes((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      }
      showSuccess(`${deleteTarget.type === 'expense' ? '支出' : '収入'}を削除しました`)
      setDeleteTarget(null)
      const summaryData = await summaryApi.getForecast(date!)
      setSummary(summaryData)
    } catch {
      showError('削除に失敗しました')
    }
  }

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format('YYYY年M月D日 (ddd)') : ''
  }, [date])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/calendar')}>
          カレンダーに戻る
        </Button>
        <Typography variant="h5">{formattedDate}</Typography>
        {isFuture && (
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            （予定）
          </Typography>
        )}
        {isToday && (
          <Typography variant="body2" sx={{ color: 'primary.main' }}>
            （今日）
          </Typography>
        )}
      </Box>

      {/* 総資産・予測サマリー */}
      {summary && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: isFuture ? 'rgba(255, 235, 59, 0.1)' : 'rgba(33, 150, 243, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccountBalance color={isFuture ? 'warning' : 'primary'} />
            <Typography variant="h6">
              {isFuture ? `${formattedDate} 時点の予測` : '資産状況'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* 現在残高 */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                現在残高
              </Typography>
              <Typography variant="h6">{formatCurrency(summary.currentBalance)}</Typography>
            </Box>

            {/* 予定収入（未来の場合のみ詳細表示） */}
            {isFuture && (
              <>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    予定収入
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    +{formatCurrency(summary.plannedIncome)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    予定支出
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'error.main' }}>
                    -{formatCurrency(summary.plannedExpense)}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
              </>
            )}

            {/* 予測残高 / 総資産 */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                {isFuture ? '予測残高' : '総資産'}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: summary.forecastBalance >= 0 ? 'primary.main' : 'error.main',
                }}
              >
                {formatCurrency(summary.forecastBalance)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* 追加ボタン */}
      <Box sx={{ mb: 3 }}>
        {showAddForm === 'expense' ? (
          <Box>
            <ExpenseForm
              categories={expenseCategories}
              onSubmit={handleCreateExpense}
              onCreateCategory={createCategory}
              initialDate={date}
            />
            <Button onClick={() => setShowAddForm(null)} sx={{ mt: 1 }}>
              キャンセル
            </Button>
          </Box>
        ) : showAddForm === 'income' ? (
          <Box>
            <IncomeForm
              categories={incomeCategories}
              onSubmit={handleCreateIncome}
              onCreateCategory={createCategory}
              initialDate={date}
            />
            <Button onClick={() => setShowAddForm(null)} sx={{ mt: 1 }}>
              キャンセル
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<Add />}
              onClick={() => setShowAddForm('expense')}
            >
              支出を追加
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={() => setShowAddForm('income')}
            >
              収入を追加
            </Button>
          </Box>
        )}
      </Box>

      {/* タブ */}
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={`支出 (${expenses.length})`} />
        <Tab label={`収入 (${incomes.length})`} />
      </Tabs>

      {/* 支出一覧 */}
      {tabIndex === 0 && (
        <ExpenseList
          expenses={expenses}
          onEdit={setEditingExpense}
          onDelete={(id) => setDeleteTarget({ type: 'expense', id })}
          showDate={false}
        />
      )}

      {/* 収入一覧 */}
      {tabIndex === 1 && (
        <IncomeList
          incomes={incomes}
          onEdit={setEditingIncome}
          onDelete={(id) => setDeleteTarget({ type: 'income', id })}
          showDate={false}
        />
      )}

      {/* 支出編集ダイアログ */}
      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        categories={expenseCategories}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
        onCreateCategory={createCategory}
      />

      {/* 収入編集ダイアログ */}
      <IncomeEditDialog
        open={!!editingIncome}
        income={editingIncome}
        categories={incomeCategories}
        onClose={() => setEditingIncome(null)}
        onSubmit={handleUpdateIncome}
        onCreateCategory={createCategory}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`${deleteTarget?.type === 'expense' ? '支出' : '収入'}の削除`}
        message={`この${deleteTarget?.type === 'expense' ? '支出' : '収入'}を削除しますか？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {notification && (
        <Notification
          open={true}
          message={notification.message}
          severity={notification.severity}
          onClose={clearNotification}
        />
      )}
    </Container>
  )
}