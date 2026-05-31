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
import type { Income } from '../../types/income'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  incomes: Income[]
  onEdit: (income: Income) => void
  onDelete: (id: string) => void
  showDate?: boolean
}

export default function IncomeList({ incomes, onEdit, onDelete, showDate = true }: Props) {
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
    if (incomes.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">😢 データがありません</Typography>
        </Paper>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {incomes.map((income) => {
          const planned = isPlanned(income.incomeDate)
          return (
            <Card
              key={income.id}
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
                        📅 {dayjs(income.incomeDate).format('MM/DD')}
                      </Typography>
                    )}
                    <Chip
                      label={income.categoryName || '未分類'}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(129, 199, 132, 0.15)',
                        color: 'success.dark',
                        fontWeight: 500,
                        height: 24,
                      }}
                    />
                  </Box>
                  <Chip
                    label={planned ? '予定' : '実績'}
                    size="small"
                    sx={{
                      backgroundColor: planned ? 'rgba(255, 183, 77, 0.2)' : 'rgba(129, 199, 132, 0.1)',
                      color: planned ? 'warning.dark' : 'text.secondary',
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>

                {/* 中段：説明・金額 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, mr: 2 }}>
                    {income.description || '-'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                    +{formatCurrency(income.amount)}
                  </Typography>
                </Box>

                {/* 下段：操作 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(income)}
                    sx={{ color: 'primary.main' }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(income.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
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
    backgroundColor: 'success.main',
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
            <TableCell sx={headerCellStyle}>📌 状態</TableCell>
            <TableCell sx={headerCellStyle} align="center">⚙️ 操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showDate ? 6 : 5} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">😢 データがありません</Typography>
              </TableCell>
            </TableRow>
          ) : (
            incomes.map((income, index) => {
              const planned = isPlanned(income.incomeDate)
              return (
                <TableRow
                  key={income.id}
                  hover
                  sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(129, 199, 132, 0.03)' }}
                >
                  {showDate && (
                    <TableCell>{dayjs(income.incomeDate).format('YYYY/MM/DD')}</TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={income.categoryName || '未分類'}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(129, 199, 132, 0.15)',
                        color: 'success.dark',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>{income.description || '-'}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    +{formatCurrency(income.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={planned ? '📋 予定' : '✅ 実績'}
                      size="small"
                      sx={{
                        backgroundColor: planned ? 'rgba(255, 183, 77, 0.2)' : 'rgba(129, 199, 132, 0.1)',
                        color: planned ? 'warning.dark' : 'text.secondary',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onEdit(income)} sx={{ color: 'primary.main' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(income.id)} sx={{ color: 'error.main' }}>
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