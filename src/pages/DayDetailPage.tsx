import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'
import { ArrowBack, Add } from '@mui/icons-material'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import ExpenseList from '../components/expense/ExpenseList'
import ExpenseEditDialog from '../components/expense/ExpenseEditDialog'
import ExpenseForm from '../components/expense/ExpenseForm'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

export default function DayDetailPage() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { expenseCategories, createCategory } = useCategories()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const fetchExpenses = async () => {
    if (!date) return
    try {
      setLoading(true)
      const data = await expenseApi.getByDateRange(date, date)
      setExpenses(data)
    } catch {
      showError('支出の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [date])

  const handleCreate = async (data: CreateExpenseRequest) => {
    try {
      const newExpense = await expenseApi.create(data)
      setExpenses((prev) => [newExpense, ...prev])
      showSuccess('支出を追加しました')
      setShowAddForm(false)
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  const handleUpdate = async (id: string, data: UpdateExpenseRequest) => {
    try {
      const updated = await expenseApi.update(id, data)
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
      showSuccess('支出を更新しました')
      setEditingExpense(null)
    } catch {
      showError('支出の更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await expenseApi.delete(deleteTarget)
      setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget))
      showSuccess('支出を削除しました')
      setDeleteTarget(null)
    } catch {
      showError('支出の削除に失敗しました')
    }
  }

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format('YYYY年M月D日 (ddd)') : ''
  }, [date])

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/calendar')}>
          カレンダーに戻る
        </Button>
        <Typography variant="h5">{formattedDate}</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {showAddForm ? (
          <ExpenseForm
            categories={expenseCategories}
            onSubmit={handleCreate}
            onCreateCategory={createCategory}
            initialDate={date}
          />
        ) : (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddForm(true)}
          >
            支出を追加
          </Button>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        支出一覧
      </Typography>
      <ExpenseList
        expenses={expenses}
        onEdit={setEditingExpense}
        onDelete={setDeleteTarget}
        showDate={false}
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