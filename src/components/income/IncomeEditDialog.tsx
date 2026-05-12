import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import type { Income, UpdateIncomeRequest } from '../../types/income'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'

interface FormProps {
  income: Income
  categories: Category[]
  onClose: () => void
  onSubmit: (id: string, data: UpdateIncomeRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
}

function IncomeEditForm({ income, categories, onClose, onSubmit, onCreateCategory }: FormProps) {
  const [amount, setAmount] = useState(income.amount.toString())
  const [incomeDate, setIncomeDate] = useState(income.incomeDate)
  const [categoryId, setCategoryId] = useState(income.categoryId)
  const [description, setDescription] = useState(income.description || '')
  const [memo, setMemo] = useState(income.memo || '')

    const today = dayjs().format('YYYY-MM-DD')
  const isPlannedDate = incomeDate > today

  const handleSubmit = () => {
    if (!amount || !categoryId) return

    const today = dayjs().format('YYYY-MM-DD')
    const isPlanned = incomeDate > today

    onSubmit(income.id, {
      amount: Number(amount),
      incomeDate,
      categoryId,
      description: description || undefined,
      memo: memo || undefined,
      isPlanned,
      plannedDate: isPlanned ? incomeDate : undefined,
    })
  }

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          収入を編集
          {isPlannedDate && (
            <Typography variant="body2" sx={{ color: 'warning.main' }}>
              （予定）
            </Typography>
          )}
        </Box>
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
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
            required
            fullWidth
          />
          <CategorySelectWithCreate
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            onCreateCategory={onCreateCategory}
            type="INCOME"
            fullWidth
          />
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
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" color="success">
          保存
        </Button>
      </DialogActions>
    </>
  )
}

interface DialogProps {
  open: boolean
  income: Income | null
  categories: Category[]
  onClose: () => void
  onSubmit: (id: string, data: UpdateIncomeRequest) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
}

export default function IncomeEditDialog({
  open,
  income,
  categories,
  onClose,
  onSubmit,
  onCreateCategory,
}: DialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {income && (
        <IncomeEditForm
          key={income.id}
          income={income}
          categories={categories}
          onClose={onClose}
          onSubmit={onSubmit}
          onCreateCategory={onCreateCategory}
        />
      )}
    </Dialog>
  )
}