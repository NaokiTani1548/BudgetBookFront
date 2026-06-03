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
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import type { RecurringExpense } from '../../types/recurringExpense'

interface Props {
  recurringExpenses: RecurringExpense[]
  onEdit: (expense: RecurringExpense) => void
  onDelete: (expense: RecurringExpense) => void
  onToggleActive: (expense: RecurringExpense) => void
}

export default function RecurringExpenseList({
  recurringExpenses,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  // モバイル用カード表示
  if (isMobile) {
    if (recurringExpenses.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">😢 定期支出がありません</Typography>
        </Paper>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recurringExpenses.map((expense) => (
          <Card
            key={expense.id}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: expense.isActive ? 'divider' : 'error.light',
              opacity: expense.isActive ? 1 : 0.7,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {/* 上段：説明・有効/無効スイッチ */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {expense.description || '-'}
                  </Typography>
                  {!expense.isActive && (
                    <Chip label="停止中" size="small" color="error" sx={{ height: 20 }} />
                  )}
                </Box>
                <Switch
                  checked={expense.isActive}
                  onChange={() => onToggleActive(expense)}
                  size="small"
                  color="primary"
                />
              </Box>

              {/* 中段：金額・請求日 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
                  {formatCurrency(expense.amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  毎月 {expense.billingDay}日
                </Typography>
              </Box>

              {/* 下段：カテゴリ・支払方法・操作 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={expense.categoryName || '未分類'}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(232, 106, 51, 0.1)',
                      color: 'primary.dark',
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                  <Chip
                    label={expense.paymentMethod === 'CASH' ? '現金' : 'クレカ'}
                    size="small"
                    sx={{
                      backgroundColor: expense.paymentMethod === 'CASH'
                        ? 'rgba(39, 174, 96, 0.15)'
                        : 'rgba(52, 152, 219, 0.15)',
                      color: expense.paymentMethod === 'CASH' ? 'success.dark' : 'info.dark',
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => onEdit(expense)} sx={{ color: 'primary.main' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(expense)} sx={{ color: 'error.main' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  // デスクトップ用テーブル表示
  const headerCellStyle = {
    backgroundColor: 'primary.main',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>有効</TableCell>
            <TableCell sx={headerCellStyle}>説明</TableCell>
            <TableCell sx={headerCellStyle}>カテゴリ</TableCell>
            <TableCell sx={headerCellStyle} align="right">金額</TableCell>
            <TableCell sx={headerCellStyle}>請求日</TableCell>
            <TableCell sx={headerCellStyle}>支払方法</TableCell>
            <TableCell sx={headerCellStyle}>期間</TableCell>
            <TableCell sx={headerCellStyle} align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recurringExpenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">😢 定期支出がありません</Typography>
              </TableCell>
            </TableRow>
          ) : (
            recurringExpenses.map((expense, index) => (
              <TableRow
                key={expense.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(232, 106, 51, 0.03)',
                  opacity: expense.isActive ? 1 : 0.6,
                }}
              >
                <TableCell>
                  <Switch
                    checked={expense.isActive}
                    onChange={() => onToggleActive(expense)}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>{expense.description || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={expense.categoryName || '未分類'}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(232, 106, 51, 0.1)',
                      color: 'primary.dark',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>毎月 {expense.billingDay}日</TableCell>
                <TableCell>
                  <Chip
                    label={expense.paymentMethod === 'CASH' ? '現金' : 'クレカ'}
                    size="small"
                    sx={{
                      backgroundColor: expense.paymentMethod === 'CASH'
                        ? 'rgba(39, 174, 96, 0.15)'
                        : 'rgba(52, 152, 219, 0.15)',
                      color: expense.paymentMethod === 'CASH' ? 'success.dark' : 'info.dark',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>
                  {expense.startDate}〜{expense.endDate || '無期限'}
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => onEdit(expense)} sx={{ color: 'primary.main' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(expense)} sx={{ color: 'error.main' }}>
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