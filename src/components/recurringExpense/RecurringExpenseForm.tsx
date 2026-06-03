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
import type { CreateRecurringExpenseRequest } from '../../types/recurringExpense'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'

interface Props {
  categories: Category[]
  onSubmit: (data: CreateRecurringExpenseRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
}

export default function RecurringExpenseForm({ categories, onSubmit, onCreateCategory }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [amount, setAmount] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
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
      billingDay: Number(billingDay),
      startDate,
      endDate: endDate || undefined,
      categoryId: selectedCategoryId,
      description: description || undefined,
      paymentMethod,
      memo: memo || undefined,
    })

    setAmount('')
    setDescription('')
    setMemo('')
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        🔄 定期支出を追加
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <TextField
            label="金額"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>請求日</InputLabel>
            <Select
              value={billingDay}
              label="請求日"
              onChange={(e) => setBillingDay(e.target.value)}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <MenuItem key={day} value={day}>
                  {day}日
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="開始日"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="終了日"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            size="small"
            helperText={isMobile ? '' : '空欄で無期限'}
          />
          <CategorySelectWithCreate
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="EXPENSE"
            fullWidth
            size="small"
          />
          <FormControl fullWidth size="small">
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
            fullWidth
            size="small"
            sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
          />
          <TextField
            label="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            fullWidth
            size="small"
            sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
          />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{ minWidth: { sm: 120 }, whiteSpace: 'nowrap' }}
          >
            追加
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}