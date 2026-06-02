import { useState, useMemo } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { CreateIncomeRequest } from '../../types/income'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  categories: Category[]
  onSubmit: (data: CreateIncomeRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
  initialDate?: string
}

export default function IncomeForm({ categories, onSubmit, onCreateCategory, initialDate }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [amount, setAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState(initialDate || dayjs().format('YYYY-MM-DD'))
  const [categoryId, setCategoryId] = useState('')
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

    onSubmit({
      amount: Number(amount),
      incomeDate,
      categoryId: selectedCategoryId,
      description: description || undefined,
      memo: memo || undefined,
    })

    setAmount('')
    setDescription('')
    setMemo('')
  }

  const isPlannedDate = isPlanned(incomeDate)

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          💰 収入を追加
        </Typography>
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
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
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
          <TextField
            label="日付"
            type="date"
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <CategorySelectWithCreate
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="INCOME"
            fullWidth
            size="small"
          />
          <TextField
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
            sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
          />
          <TextField
            label="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            fullWidth
            size="small"
            sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
          />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button
            type="submit"
            variant="contained"
            color={isPlannedDate ? 'warning' : 'success'}
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{
              minWidth: { sm: 120 },
              whiteSpace: 'nowrap',
              px: { xs: 2, sm: 3 },
            }}
          >
            {isPlannedDate ? '予定追加' : '追加'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}