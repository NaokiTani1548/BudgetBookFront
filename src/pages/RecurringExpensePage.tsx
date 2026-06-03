import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCategories } from '../hooks/useCategories'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import RecurringExpenseForm from '../components/recurringExpense/RecurringExpenseForm'
import RecurringExpenseList from '../components/recurringExpense/RecurringExpenseList'
import Loading from '../components/common/Loading'
import Notification from '../components/common/Notification'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { useNotification } from '../hooks/useNotification'
import type { RecurringExpense, CreateRecurringExpenseRequest } from '../types/recurringExpense'

export default function RecurringExpensePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { categories, loading: categoriesLoading, createCategory } = useCategories('EXPENSE')
  const {
    recurringExpenses,
    loading: expensesLoading,
    createRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useRecurringExpenses()

  const { notification, showNotification, hideNotification } = useNotification()
  const [deleteTarget, setDeleteTarget] = useState<RecurringExpense | null>(null)

  const handleCreate = async (data: CreateRecurringExpenseRequest) => {
    try {
      await createRecurringExpense(data)
      showNotification('定期支出を登録しました', 'success')
    } catch {
      showNotification('登録に失敗しました', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteRecurringExpense(deleteTarget.id)
      showNotification('定期支出を削除しました', 'success')
      setDeleteTarget(null)
    } catch {
      showNotification('削除に失敗しました', 'error')
    }
  }

  const handleToggleActive = async (expense: RecurringExpense) => {
    try {
      await updateRecurringExpense(expense.id, {
        amount: expense.amount,
        billingDay: expense.billingDay,
        startDate: expense.startDate,
        endDate: expense.endDate ?? undefined,
        categoryId: expense.categoryId,
        description: expense.description ?? undefined,
        paymentMethod: expense.paymentMethod,
        memo: expense.memo ?? undefined,
        isActive: !expense.isActive,
      })
      showNotification(
        expense.isActive ? '定期支出を停止しました' : '定期支出を再開しました',
        'success'
      )
    } catch {
      showNotification('更新に失敗しました', 'error')
    }
  }

  // 月額合計（有効なもののみ）
  const monthlyTotal = recurringExpenses
    .filter((e) => e.isActive)
    .reduce((sum, e) => sum + e.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (categoriesLoading || expensesLoading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          🔄 定期支出
        </Typography>
        <Typography variant="body2" color="text.secondary">
          毎月の固定費を管理します
        </Typography>
      </Box>

      {/* 月額合計 */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: 'linear-gradient(135deg, rgba(232, 106, 51, 0.1) 0%, rgba(243, 156, 18, 0.1) 100%)',
          border: '1px solid',
          borderColor: 'primary.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              💰 月額合計（有効分）
            </Typography>
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatCurrency(monthlyTotal)}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              登録件数: {recurringExpenses.length}件
              （有効: {recurringExpenses.filter((e) => e.isActive).length}件）
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* フォーム */}
      <RecurringExpenseForm
        categories={categories}
        onSubmit={handleCreate}
        onCreateCategory={createCategory}
      />

      {/* リスト */}
      <RecurringExpenseList
        recurringExpenses={recurringExpenses}
        onEdit={() => {}} // TODO: 編集機能
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="定期支出の削除"
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