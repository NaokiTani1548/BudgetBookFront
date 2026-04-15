import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, Category } from './types/expense'
import { expenseApi, categoryApi } from './api/expenseApi'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import ExpenseEditDialog from './components/ExpenseEditDialog'

export default function App() {
  console.log('App component rendered')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const fetchData = async () => {
    try {
      console.log('Fetching data...')
      setLoading(true)
      const [expensesData, categoriesData] = await Promise.all([
        expenseApi.getAll(),
        categoryApi.getAll(),
      ])
      console.log('Data fetched:', expensesData, categoriesData)
      setExpenses(expensesData)
      setCategories(categoriesData.filter((c) => c.type === 'EXPENSE'))
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('データの取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: CreateExpenseRequest) => {
    try {
      await expenseApi.create(data)
      setSuccess('支出を追加しました')
      fetchData()
    } catch (err) {
      setError('支出の追加に失敗しました')
      console.error(err)
    }
  }

  const handleUpdate = async (id: string, data: UpdateExpenseRequest) => {
    try {
      await expenseApi.update(id, data)
      setSuccess('支出を更新しました')
      setEditingExpense(null)
      fetchData()
    } catch (err) {
      setError('支出の更新に失敗しました')
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('この支出を削除しますか？')) return

    try {
      await expenseApi.delete(id)
      setSuccess('支出を削除しました')
      fetchData()
    } catch (err) {
      setError('支出の削除に失敗しました')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        💰 BudgetBook
      </Typography>

      <ExpenseForm categories={categories} onSubmit={handleCreate} />

      <ExpenseList
        expenses={expenses}
        onEdit={setEditingExpense}
        onDelete={handleDelete}
      />

      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        categories={categories}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdate}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  )
}