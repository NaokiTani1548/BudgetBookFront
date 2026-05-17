import { useState, useMemo } from 'react'
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { CreateExpenseRequest } from '../../types/expense'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  categories: Category[]
  onSubmit: (data: CreateExpenseRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
  initialDate?: string
}

export default function ExpenseForm({ categories, onSubmit, onCreateCategory, initialDate }: Props) {
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(initialDate || dayjs().format('YYYY-MM-DD'))
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [memo, setMemo] = useState('')

  const selectedCategoryId = useMemo(() => {
    if (categoryId) return categoryId
    if (categories.length > 0) return categories[0].id
    return ''
  }, [categoryId, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !selectedCategoryId) return

    onSubmit({
      amount: Number(amount),
      expenseDate,
      categoryId: selectedCategoryId,
      description: description || undefined,
      paymentMethod,
      memo: memo || undefined,
    })

    setAmount('')
    setDescription('')
    setMemo('')
  }

  const isPlannedDate = isPlanned(expenseDate)

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">支出を追加</Typography>
        {isPlannedDate && (
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            （予定として登録されます）
          </Typography>
        )}
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="金額"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            sx={{ width: 150 }}
          />
          <TextField
            label="日付"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            sx={{ width: 170 }}
          />
          <CategorySelectWithCreate
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="EXPENSE"
            sx={{ width: 180 }}
          />
          <FormControl sx={{ width: 120 }}>
            <InputLabel>支払方法</InputLabel>
            <Select
              value={paymentMethod}
              label="支払方法"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="CASH">現金</MenuItem>
              <MenuItem value="CREDIT_CARD">クレカ</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ width: 200 }}
          />
          <TextField
            label="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            sx={{ width: 200 }}
          />
          <Button
            type="submit"
            variant="contained"
            color={isPlannedDate ? 'warning' : 'error'}
            startIcon={<Add />}
            sx={{ height: 56 }}
          >
            {isPlannedDate ? '予定を追加' : '追加'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}