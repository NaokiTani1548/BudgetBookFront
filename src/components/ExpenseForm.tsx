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
import { CreateExpenseRequest, Category } from '../types/expense'

interface Props {
  categories: Category[]
  onSubmit: (data: CreateExpenseRequest) => void
}

export default function ExpenseForm({ categories, onSubmit }: Props) {
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [memo, setMemo] = useState('')

  // カテゴリが選択されていない場合、最初のカテゴリをデフォルトにする
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

    // フォームリセット
    setAmount('')
    setDescription('')
    setMemo('')
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        支出を追加
      </Typography>
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
          <FormControl sx={{ width: 150 }}>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={selectedCategoryId}
              label="カテゴリ"
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            startIcon={<Add />}
            sx={{ height: 56 }}
          >
            追加
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}