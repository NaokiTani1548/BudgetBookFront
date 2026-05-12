import { useState, useMemo } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { CreateIncomeRequest } from '../../types/income'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'

interface Props {
  categories: Category[]
  onSubmit: (data: CreateIncomeRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
  initialDate?: string
}

export default function IncomeForm({ categories, onSubmit, onCreateCategory, initialDate }: Props) {
  const [amount, setAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState(initialDate || dayjs().format('YYYY-MM-DD'))
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [memo, setMemo] = useState('')

  const selectedCategoryId = useMemo(() => {
    if (categoryId) return categoryId
    if (categories.length > 0) return categories[0].id
    return ''
  }, [categoryId, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !selectedCategoryId) return

    const today = dayjs().format('YYYY-MM-DD')
    const isPlanned = incomeDate > today

    onSubmit({
      amount: Number(amount),
      incomeDate,
      categoryId: selectedCategoryId,
      description: description || undefined,
      memo: memo || undefined,
      isPlanned,
      plannedDate: isPlanned ? incomeDate : undefined,
    })

    setAmount('')
    setDescription('')
    setMemo('')
  }
  const today = dayjs().format('YYYY-MM-DD')
  const isPlannedDate = incomeDate > today

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">収入を追加</Typography>
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
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
            required
            sx={{ width: 170 }}
          />
          <CategorySelectWithCreate
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="INCOME"
            sx={{ width: 180 }}
          />
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
            color="success"
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