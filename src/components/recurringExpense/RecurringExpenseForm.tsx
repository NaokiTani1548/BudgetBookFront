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
import dayjs from 'dayjs'
import type { RecurringExpense, CreateRecurringExpenseRequest, UpdateRecurringExpenseRequest } from '../../types/recurringExpense'
import type { Category } from '../../types/category'

interface Props {
  open: boolean
  recurringExpense?: RecurringExpense | null
  categories: Category[]
  onClose: () => void
  onSubmit: (data: CreateRecurringExpenseRequest | UpdateRecurringExpenseRequest) => void
}

export default function RecurringExpenseForm({
  open,
  recurringExpense,
  categories,
  onClose,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState(recurringExpense?.amount.toString() || '')
  const [billingDay, setBillingDay] = useState(recurringExpense?.billingDay.toString() || '1')
  const [startDate, setStartDate] = useState(
    recurringExpense?.startDate || dayjs().format('YYYY-MM-DD')
  )
  const [endDate, setEndDate] = useState(recurringExpense?.endDate || '')
  const [categoryId, setCategoryId] = useState(recurringExpense?.categoryId || '')
  const [description, setDescription] = useState(recurringExpense?.description || '')
  const [paymentMethod, setPaymentMethod] = useState(recurringExpense?.paymentMethod || 'CREDIT_CARD')
  const [memo, setMemo] = useState(recurringExpense?.memo || '')

  const handleSubmit = () => {
    if (!amount || !billingDay) return

    const data: CreateRecurringExpenseRequest | UpdateRecurringExpenseRequest = {
      amount: Number(amount),
      billingDay: Number(billingDay),
      startDate,
      endDate: endDate || undefined,
      categoryId: categoryId || undefined,
      description: description || undefined,
      paymentMethod,
      memo: memo || undefined,
    }

    if (recurringExpense) {
      (data as UpdateRecurringExpenseRequest).isActive = recurringExpense.isActive
    }

    onSubmit(data)
  }

  const billingDays = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {recurringExpense ? '定期支出を編集' : '定期支出を追加'}
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
          <FormControl fullWidth>
            <InputLabel>引き落とし日</InputLabel>
            <Select
              value={billingDay}
              label="引き落とし日"
              onChange={(e) => setBillingDay(e.target.value)}
            >
              {billingDays.map((day) => (
                <MenuItem key={day} value={day.toString()}>
                  毎月 {day} 日
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
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
          <TextField
            label="終了日（任意）"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
            helperText="空欄の場合は無期限"
          />
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={categoryId}
              label="カテゴリ"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">未分類</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="例: Netflix, 家賃, スポーツジム"
          />
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
            label="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!amount || !billingDay}>
          {recurringExpense ? '更新' : '登録'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}