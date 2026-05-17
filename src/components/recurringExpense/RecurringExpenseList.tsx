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
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import dayjs from 'dayjs'
import type { RecurringExpense } from '../../types/recurringExpense'

interface Props {
  recurringExpenses: RecurringExpense[]
  onEdit: (item: RecurringExpense) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

export default function RecurringExpenseList({
  recurringExpenses,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
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
            <TableCell>有効</TableCell>
            <TableCell>説明</TableCell>
            <TableCell>カテゴリ</TableCell>
            <TableCell align="right">金額</TableCell>
            <TableCell>引き落とし日</TableCell>
            <TableCell>支払方法</TableCell>
            <TableCell>期間</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recurringExpenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="text.secondary" sx={{ py: 4 }}>
                  定期支出が登録されていません
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            recurringExpenses.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ opacity: item.isActive ? 1 : 0.5 }}
              >
                <TableCell>
                  <Tooltip title={item.isActive ? '有効' : '停止中'}>
                    <Switch
                      checked={item.isActive}
                      onChange={(e) => onToggleActive(item.id, e.target.checked)}
                      color="success"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: item.isActive ? 'bold' : 'normal' }}>
                    {item.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.categoryName || '未分類'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  -{formatCurrency(item.amount)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`毎月 ${item.billingDay} 日`}
                    size="small"
                    color="info"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.paymentMethod === 'CASH' ? '現金' : 'クレカ'}
                    size="small"
                    color={item.paymentMethod === 'CASH' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {dayjs(item.startDate).format('YYYY/MM/DD')} 〜
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.endDate ? dayjs(item.endDate).format('YYYY/MM/DD') : '無期限'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => onEdit(item)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}