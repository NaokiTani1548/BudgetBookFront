import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import dayjs from 'dayjs'
import type { CreateExpenseRequest } from '../../types/expense'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  open: boolean
  categories: Category[]
  onClose: () => void
  onSubmit: (data: CreateExpenseRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
}

function ExpenseCreateForm({ categories, onClose, onSubmit, onCreateCategory }: Omit<Props, 'open'>) {
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [memo, setMemo] = useState('')

  const selectedCategoryId = useMemo(() => {
    if (categoryId) return categoryId
    if (categories.length > 0) return categories[0].id
    return ''
  }, [categoryId, categories])

  const handleSubmit = () => {
    if (!amount || !selectedCategoryId) return

    onSubmit({
      amount: Number(amount),
      expenseDate,
      categoryId: selectedCategoryId,
      description: description || undefined,
      paymentMethod,
      memo: memo || undefined,
    })

    onClose()
  }

  const isPlannedDate = isPlanned(expenseDate)

  return (
    <>
      <DialogTitle>
        {isPlannedDate ? '📋 支出予定を追加' : '💸 支出を追加'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="金額"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="日付"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <CategorySelectWithCreate
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="EXPENSE"
            fullWidth
          />
          <FormControl fullWidth>
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
          />
          <TextField
            label="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!amount}
          color={isPlannedDate ? 'warning' : 'primary'}
        >
          {isPlannedDate ? '予定追加' : '追加'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function ExpenseCreateDialog({ open, categories, onClose, onSubmit, onCreateCategory }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open && (
        <ExpenseCreateForm
          key="create"
          categories={categories}
          onClose={onClose}
          onSubmit={onSubmit}
          onCreateCategory={onCreateCategory}
        />
      )}
    </Dialog>
  )
}