import { useState } from 'react'
import { Container, Typography } from '@mui/material'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import ExpenseForm from '../components/expense/ExpenseForm'
import ExpenseList from '../components/expense/ExpenseList'
import ExpenseEditDialog from '../components/expense/ExpenseEditDialog'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

export default function ListPage() {
  const { expenses, loading, createExpense, updateExpense, deleteExpense } = useExpenses()
  const { expenseCategories, createCategory } = useCategories()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleCreate = async (data: CreateExpenseRequest) => {
    try {
      await createExpense(data)
      showSuccess('支出を追加しました')
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  const handleUpdate = async (id: string, data: UpdateExpenseRequest) => {
    try {
      await updateExpense(id, data)
      showSuccess('支出を更新しました')
      setEditingExpense(null)
    } catch {
      showError('支出の更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteExpense(deleteTarget)
      showSuccess('支出を削除しました')
      setDeleteTarget(null)
    } catch {
      showError('支出の削除に失敗しました')
    }
  }

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        💰 支出一覧
      </Typography>

      <ExpenseForm
        categories={expenseCategories}
        onSubmit={handleCreate}
        onCreateCategory={createCategory}
      />

      <ExpenseList
        expenses={expenses}
        onEdit={setEditingExpense}
        onDelete={setDeleteTarget}
      />

      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        categories={expenseCategories}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdate}
        onCreateCategory={createCategory}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="支出の削除"
        message="この支出を削除しますか？"
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