import { Box, Paper, Typography } from '@mui/material'
import { AccountBalance } from '@mui/icons-material'
import type { ForecastSummary } from '../../types/summary'

interface Props {
  summary: ForecastSummary | null
  loading?: boolean
}

export default function BalanceSummary({ summary, loading }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  if (loading || !summary) {
    return (
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(33, 150, 243, 0.08)' }}>
        <Typography color="text.secondary">読み込み中...</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(33, 150, 243, 0.08)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccountBalance color="primary" />
        <Typography variant="h6">現在の資産状況</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            総収入
          </Typography>
          <Typography variant="h6" sx={{ color: 'success.main' }}>
            +{formatCurrency(summary.currentBalance + summary.plannedExpense)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            総支出
          </Typography>
          <Typography variant="h6" sx={{ color: 'error.main' }}>
            -{formatCurrency(summary.plannedExpense)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            総資産
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: summary.currentBalance >= 0 ? 'primary.main' : 'error.main',
            }}
          >
            {formatCurrency(summary.currentBalance)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}