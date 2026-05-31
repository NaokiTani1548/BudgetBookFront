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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">💸 支出を追加</Typography>
        {isPlannedDate && (
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            （予定）
          </Typography>
        )}
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(auto-fit, minmax(140px, 1fr))' },
            gap: 2,
          }}
        >
          <TextField
            label="金額"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            label="日付"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            fullWidth
            size={isMobile ? 'small' : 'medium'}
          />
          <CategorySelectWithCreate
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="EXPENSE"
            fullWidth
            size={isMobile ? 'small' : 'medium'}
          />
          <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
            <InputLabel>支払方法</InputLabel>
            <Select
              value={paymentMethod}
              label="支払方法"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="CASH">💵 現金</MenuItem>
              <MenuItem value="CREDIT_CARD">💳 クレカ</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            label="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            fullWidth
            size={isMobile ? 'small' : 'medium'}
          />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button
            type="submit"
            variant="contained"
            color={isPlannedDate ? 'warning' : 'error'}
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{ minWidth: { sm: 140 } }}
          >
            {isPlannedDate ? '予定を追加' : '追加'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}