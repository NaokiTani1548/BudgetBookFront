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
import type { Income } from '../../types/income'
import { isPlanned } from '../../utils/dateUtils'

interface Props {
  incomes: Income[]
  onEdit: (income: Income) => void
  onDelete: (id: string) => void
  showDate?: boolean
}

export default function IncomeList({ incomes, onEdit, onDelete, showDate = true }: Props) {
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
            <TableCell>状態</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showDate ? 6 : 5} align="center">
                データがありません
              </TableCell>
            </TableRow>
          ) : (
            incomes.map((income) => {
              const planned = isPlanned(income.incomeDate)
              return (
                <TableRow key={income.id} hover>
                  {showDate && (
                    <TableCell>
                      {dayjs(income.incomeDate).format('YYYY/MM/DD')}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={income.categoryName || '未分類'}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{income.description || '-'}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    +{formatCurrency(income.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={planned ? '予定' : '実績'}
                      size="small"
                      color={planned ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onEdit(income)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(income.id)}>
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