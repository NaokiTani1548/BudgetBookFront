import { useState } from 'react'
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useExpenses } from '../hooks/useExpenses'
import { useIncomes } from '../hooks/useIncomes'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import { useCurrentBalance } from '../hooks/useCurrentBalance'
import ExpenseForm from '../components/expense/ExpenseForm'
import ExpenseList from '../components/expense/ExpenseList'
import ExpenseEditDialog from '../components/expense/ExpenseEditDialog'
import IncomeForm from '../components/income/IncomeForm'
import IncomeList from '../components/income/IncomeList'
import IncomeEditDialog from '../components/income/IncomeEditDialog'
import BalanceSummary from '../components/common/BalanceSummary'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

export default function ListPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { expenses, loading: expenseLoading, createExpense, updateExpense, deleteExpense } = useExpenses()
  const { incomes, loading: incomeLoading, createIncome, updateIncome, deleteIncome } = useIncomes()
  const { categories: expenseCategories, createCategory: createExpenseCategory } = useCategories('EXPENSE')
  const { categories: incomeCategories, createCategory: createIncomeCategory } = useCategories('INCOME')
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const { summary, loading: balanceLoading, refetch: refetchBalance } = useCurrentBalance()

  const [tabIndex, setTabIndex] = useState(0)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'expense' | 'income'; id: string; description: string } | null>(null)

  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    try {
      await createExpense(data)
      showSuccess('支出を追加しました')
      refetchBalance()
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  const handleUpdateExpense = async (id: string, data: UpdateExpenseRequest) => {
    try {
      await updateExpense(id, data)
      showSuccess('支出を更新しました')
      setEditingExpense(null)
      refetchBalance()
    } catch {
      showError('支出の更新に失敗しました')
    }
  }

  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    try {
      await createIncome(data)
      showSuccess('収入を追加しました')
      refetchBalance()
    } catch {
      showError('収入の追加に失敗しました')
    }
  }

  const handleUpdateIncome = async (id: string, data: UpdateIncomeRequest) => {
    try {
      await updateIncome(id, data)
      showSuccess('収入を更新しました')
      setEditingIncome(null)
      refetchBalance()
    } catch {
      showError('収入の更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'expense') {
        await deleteExpense(deleteTarget.id)
      } else {
        await deleteIncome(deleteTarget.id)
      }
      showSuccess(`${deleteTarget.type === 'expense' ? '支出' : '収入'}を削除しました`)
      setDeleteTarget(null)
      refetchBalance()
    } catch {
      showError('削除に失敗しました')
    }
  }

  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id)
    if (target) {
      setDeleteTarget({ type: 'expense', id, description: target.description || '' })
    }
  }

  const handleDeleteIncome = (id: string) => {
    const target = incomes.find((i) => i.id === id)
    if (target) {
      setDeleteTarget({ type: 'income', id, description: target.description || '' })
    }
  }

  if (expenseLoading || incomeLoading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          📋 収支一覧
        </Typography>
        <Typography variant="body2" color="text.secondary">
          収入と支出を管理します
        </Typography>
      </Box>

      {/* 現在の総資産 */}
      <BalanceSummary summary={summary} loading={balanceLoading} />

      {/* タブ */}
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
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
        <Tab label={`💸 支出 (${expenses.length})`} />
        <Tab label={`💰 収入 (${incomes.length})`} />
      </Tabs>

      {/* 支出タブ */}
      {tabIndex === 0 && (
        <>
          <ExpenseForm
            categories={expenseCategories}
            onSubmit={handleCreateExpense}
            onCreateCategory={createExpenseCategory}
          />
          <ExpenseList
            expenses={expenses}
            onEdit={setEditingExpense}
            onDelete={handleDeleteExpense}
          />
        </>
      )}

      {/* 収入タブ */}
      {tabIndex === 1 && (
        <>
          <IncomeForm
            categories={incomeCategories}
            onSubmit={handleCreateIncome}
            onCreateCategory={createIncomeCategory}
          />
          <IncomeList
            incomes={incomes}
            onEdit={setEditingIncome}
            onDelete={handleDeleteIncome}
          />
        </>
      )}

      {/* 支出編集ダイアログ */}
      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        categories={expenseCategories}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
        onCreateCategory={createExpenseCategory}
      />

      {/* 収入編集ダイアログ */}
      <IncomeEditDialog
        open={!!editingIncome}
        income={editingIncome}
        categories={incomeCategories}
        onClose={() => setEditingIncome(null)}
        onSubmit={handleUpdateIncome}
        onCreateCategory={createIncomeCategory}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`${deleteTarget?.type === 'expense' ? '支出' : '収入'}の削除`}
        message={`「${deleteTarget?.description || ''}」を削除しますか？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
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