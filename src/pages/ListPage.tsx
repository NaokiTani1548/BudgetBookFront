import { useState } from 'react'
import { Container, Typography, Tabs, Tab } from '@mui/material'
import { useExpenses } from '../hooks/useExpenses'
import { useIncomes } from '../hooks/useIncomes'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import ExpenseForm from '../components/expense/ExpenseForm'
import ExpenseList from '../components/expense/ExpenseList'
import ExpenseEditDialog from '../components/expense/ExpenseEditDialog'
import IncomeForm from '../components/income/IncomeForm'
import IncomeList from '../components/income/IncomeList'
import IncomeEditDialog from '../components/income/IncomeEditDialog'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

export default function ListPage() {
  const { expenses, loading: expenseLoading, createExpense, updateExpense, deleteExpense } = useExpenses()
  const { incomes, loading: incomeLoading, createIncome, updateIncome, deleteIncome } = useIncomes()
  const { expenseCategories, incomeCategories, createCategory } = useCategories()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  const [tabIndex, setTabIndex] = useState(0)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'expense' | 'income'; id: string } | null>(null)

  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    try {
      await createExpense(data)
      showSuccess('支出を追加しました')
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  const handleUpdateExpense = async (id: string, data: UpdateExpenseRequest) => {
    try {
      await updateExpense(id, data)
      showSuccess('支出を更新しました')
      setEditingExpense(null)
    } catch {
      showError('支出の更新に失敗しました')
    }
  }

  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    try {
      await createIncome(data)
      showSuccess('収入を追加しました')
    } catch {
      showError('収入の追加に失敗しました')
    }
  }

  const handleUpdateIncome = async (id: string, data: UpdateIncomeRequest) => {
    try {
      await updateIncome(id, data)
      showSuccess('収入を更新しました')
      setEditingIncome(null)
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
    } catch {
      showError('削除に失敗しました')
    }
  }

  if (expenseLoading || incomeLoading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        💰 収支一覧
      </Typography>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label={`支出 (${expenses.length})`} />
        <Tab label={`収入 (${incomes.length})`} />
      </Tabs>

      {/* 支出タブ */}
      {tabIndex === 0 && (
        <>
          <ExpenseForm
            categories={expenseCategories}
            onSubmit={handleCreateExpense}
            onCreateCategory={createCategory}
          />
          <ExpenseList
            expenses={expenses}
            onEdit={setEditingExpense}
            onDelete={(id) => setDeleteTarget({ type: 'expense', id })}
          />
        </>
      )}

      {/* 収入タブ */}
      {tabIndex === 1 && (
        <>
          <IncomeForm
            categories={incomeCategories}
            onSubmit={handleCreateIncome}
            onCreateCategory={createCategory}
          />
          <IncomeList
            incomes={incomes}
            onEdit={setEditingIncome}
            onDelete={(id) => setDeleteTarget({ type: 'income', id })}
          />
        </>
      )}

      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        categories={expenseCategories}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
        onCreateCategory={createCategory}
      />

      <IncomeEditDialog
        open={!!editingIncome}
        income={editingIncome}
        categories={incomeCategories}
        onClose={() => setEditingIncome(null)}
        onSubmit={handleUpdateIncome}
        onCreateCategory={createCategory}
      />

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