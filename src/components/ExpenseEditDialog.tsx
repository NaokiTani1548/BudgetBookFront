import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material'
import { Expense, UpdateExpenseRequest, Category } from '../types/expense'

interface FormProps {
  expense: Expense
  categories: Category[]
  onClose: () => void
  onSubmit: (id: string, data: UpdateExpenseRequest) => void
}

function ExpenseEditForm({ expense, categories, onClose, onSubmit }: FormProps) {
  const [amount, setAmount] = useState(expense.amount.toString())
  const [expenseDate, setExpenseDate] = useState(expense.expenseDate)
  const [categoryId, setCategoryId] = useState(expense.categoryId)
  const [description, setDescription] = useState(expense.description || '')
  const [paymentMethod, setPaymentMethod] = useState(expense.paymentMethod)
  const [memo, setMemo] = useState(expense.memo || '')

  const handleSubmit = () => {
    if (!amount || !categoryId) return

    onSubmit(expense.id, {
      amount: Number(amount),
      expenseDate,
      categoryId,
      description: description || undefined,
      paymentMethod,
      memo: memo || undefined,
    })
  }

  return (
    <>
      <DialogTitle>支出を編集</DialogTitle>
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
          />
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={categoryId}
              label="カテゴリ"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
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
        <Button onClick={handleSubmit} variant="contained">
          保存
        </Button>
      </DialogActions>
    </>
  )
}

interface DialogProps {
  open: boolean
  expense: Expense | null
  categories: Category[]
  onClose: () => void
  onSubmit: (id: string, data: UpdateExpenseRequest) => void
}

export default function ExpenseEditDialog({
  open,
  expense,
  categories,
  onClose,
  onSubmit,
}: DialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {expense && (
        <ExpenseEditForm
          key={expense.id}
          expense={expense}
          categories={categories}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  )
}