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
  useMediaQuery,
  useTheme,
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
    if (expenses.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">😢 データがありません</Typography>
        </Paper>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {expenses.map((expense) => {
          const planned = isPlanned(expense.expenseDate)
          return (
            <Card
              key={expense.id}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* 上段：日付・カテゴリ・状態 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {showDate && (
                      <Typography variant="body2" color="text.secondary">
                        📅 {dayjs(expense.expenseDate).format('MM/DD')}
                      </Typography>
                    )}
                    <Chip
                      label={expense.categoryName || '未分類'}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(93, 156, 89, 0.1)',
                        color: 'primary.dark',
                        fontWeight: 500,
                        height: 24,
                      }}
                    />
                  </Box>
                  <Chip
                    label={planned ? '予定' : '実績'}
                    size="small"
                    sx={{
                      backgroundColor: planned ? 'rgba(255, 183, 77, 0.2)' : 'rgba(93, 156, 89, 0.1)',
                      color: planned ? 'warning.dark' : 'text.secondary',
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>

                {/* 中段：説明・金額 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, mr: 2 }}>
                    {expense.description || '-'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
                    -{formatCurrency(expense.amount)}
                  </Typography>
                </Box>

                {/* 下段：支払方法・操作 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={expense.paymentMethod === 'CASH' ? '💵 現金' : '💳 クレカ'}
                    size="small"
                    sx={{
                      backgroundColor: expense.paymentMethod === 'CASH'
                        ? 'rgba(129, 199, 132, 0.2)'
                        : 'rgba(244, 162, 97, 0.2)',
                      color: expense.paymentMethod === 'CASH' ? 'success.dark' : 'secondary.dark',
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(expense)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(expense.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        })}
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
            {showDate && <TableCell sx={headerCellStyle}>📅 日付</TableCell>}
            <TableCell sx={headerCellStyle}>🏷️ カテゴリ</TableCell>
            <TableCell sx={headerCellStyle}>📝 説明</TableCell>
            <TableCell sx={headerCellStyle} align="right">💰 金額</TableCell>
            <TableCell sx={headerCellStyle}>💳 支払方法</TableCell>
            <TableCell sx={headerCellStyle}>📌 状態</TableCell>
            <TableCell sx={headerCellStyle} align="center">⚙️ 操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showDate ? 7 : 6} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">😢 データがありません</Typography>
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense, index) => {
              const planned = isPlanned(expense.expenseDate)
              return (
                <TableRow
                  key={expense.id}
                  hover
                  sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(93, 156, 89, 0.03)' }}
                >
                  {showDate && (
                    <TableCell>{dayjs(expense.expenseDate).format('YYYY/MM/DD')}</TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={expense.categoryName || '未分類'}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(93, 156, 89, 0.1)',
                        color: 'primary.dark',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>{expense.description || '-'}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    -{formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={expense.paymentMethod === 'CASH' ? '💵 現金' : '💳 クレカ'}
                      size="small"
                      sx={{
                        backgroundColor: expense.paymentMethod === 'CASH'
                          ? 'rgba(129, 199, 132, 0.2)'
                          : 'rgba(244, 162, 97, 0.2)',
                        color: expense.paymentMethod === 'CASH' ? 'success.dark' : 'secondary.dark',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={planned ? '📋 予定' : '✅ 実績'}
                      size="small"
                      sx={{
                        backgroundColor: planned ? 'rgba(255, 183, 77, 0.2)' : 'rgba(93, 156, 89, 0.1)',
                        color: planned ? 'warning.dark' : 'text.secondary',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onEdit(expense)} sx={{ color: 'primary.main' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(expense.id)} sx={{ color: 'error.main' }}>
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