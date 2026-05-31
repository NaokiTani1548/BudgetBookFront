import { Box, Paper, Typography } from '@mui/material'
import { AccountBalanceWallet } from '@mui/icons-material'
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
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
          border: '1px solid',
          borderColor: 'primary.light',
        }}
      >
        <Typography color="text.secondary">読み込み中...</Typography>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.1) 0%, rgba(129, 199, 132, 0.15) 100%)',
        border: '2px solid',
        borderColor: 'primary.light',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装飾的な背景 */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          fontSize: '8rem',
          opacity: 0.1,
        }}
      >
        💰
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
          }}
        >
          <AccountBalanceWallet />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            現在の総資産
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: summary.currentBalance >= 0 ? 'primary.dark' : 'error.main',
            }}
          >
            {formatCurrency(summary.currentBalance)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}