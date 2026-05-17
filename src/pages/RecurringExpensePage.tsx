import { useState } from 'react'
import { Container, Typography, Button, Box, Alert } from '@mui/material'
import { Add, Repeat } from '@mui/icons-material'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import RecurringExpenseList from '../components/recurringExpense/RecurringExpenseList'
import RecurringExpenseForm from '../components/recurringExpense/RecurringExpenseForm'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { RecurringExpense, CreateRecurringExpenseRequest, UpdateRecurringExpenseRequest } from '../types/recurringExpense'

export default function RecurringExpensePage() {
  const {
    recurringExpenses,
    loading,
    createRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    toggleActive,
  } = useRecurringExpenses()
  const { expenseCategories } = useCategories()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringExpense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleCreate = async (data: CreateRecurringExpenseRequest) => {
    try {
      await createRecurringExpense(data)
      showSuccess('定期支出を登録しました')
      setFormOpen(false)
    } catch {
      showError('定期支出の登録に失敗しました')
    }
  }

  const handleUpdate = async (data: UpdateRecurringExpenseRequest) => {
    if (!editingItem) return
    try {
      await updateRecurringExpense(editingItem.id, data)
      showSuccess('定期支出を更新しました')
      setEditingItem(null)
    } catch {
      showError('定期支出の更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteRecurringExpense(deleteTarget)
      showSuccess('定期支出を削除しました')
      setDeleteTarget(null)
    } catch {
      showError('定期支出の削除に失敗しました')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleActive(id, isActive)
      showSuccess(isActive ? '定期支出を有効にしました' : '定期支出を停止しました')
    } catch {
      showError('状態の変更に失敗しました')
    }
  }

  const totalMonthlyExpense = recurringExpenses
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Repeat color="primary" />
          <Typography variant="h4" component="h1">
            定期支出
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
          新規登録
        </Button>
      </Box>

      {/* 月額合計 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          有効な定期支出の月額合計: <strong>{formatCurrency(totalMonthlyExpense)}</strong>
          （{recurringExpenses.filter((r) => r.isActive).length} 件）
        </Typography>
      </Alert>

      <RecurringExpenseList
        recurringExpenses={recurringExpenses}
        onEdit={setEditingItem}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
      />

      {/* 新規作成フォーム */}
      <RecurringExpenseForm
        open={formOpen}
        categories={expenseCategories}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      {/* 編集フォーム */}
      <RecurringExpenseForm
        open={!!editingItem}
        recurringExpense={editingItem}
        categories={expenseCategories}
        onClose={() => setEditingItem(null)}
        onSubmit={handleUpdate}
      />

      {/* 削除確認 */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="定期支出の削除"
        message="この定期支出を削除しますか？過去に生成された支出データは削除されません。"
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