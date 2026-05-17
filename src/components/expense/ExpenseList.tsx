import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { Expense } from '../../types/expense'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  showDate?: boolean
}

export default function ExpenseList({ expenses, onEdit, onDelete, showDate = true }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {showDate && <TableCell>日付</TableCell>}
            <TableCell>カテゴリ</TableCell>
            <TableCell>説明</TableCell>
            <TableCell align="right">金額</TableCell>
            <TableCell>支払方法</TableCell>
            <TableCell>状態</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showDate ? 7 : 6} align="center">
                データがありません
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => {
              const planned = isPlanned(expense.expenseDate)
              return (
                <TableRow key={expense.id} hover>
                  {showDate && (
                    <TableCell>
                      {dayjs(expense.expenseDate).format('YYYY/MM/DD')}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={expense.categoryName || '未分類'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{expense.description || '-'}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    -{formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={expense.paymentMethod === 'CASH' ? '現金' : 'クレカ'}
                      size="small"
                      color={expense.paymentMethod === 'CASH' ? 'success' : 'info'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={planned ? '予定' : '実績'}
                      size="small"
                      color={planned ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onEdit(expense)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(expense.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}