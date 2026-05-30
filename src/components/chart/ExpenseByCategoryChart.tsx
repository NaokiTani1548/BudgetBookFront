import { useMemo } from 'react'
import { Paper, Typography, Box } from '@mui/material'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { Expense } from '../../types/expense'

// Chart.js の登録
ChartJS.register(ArcElement, Tooltip, Legend)

// カテゴリごとの色
const COLORS = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFC107',
  '#FF9800',
  '#FF5722',
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

interface Props {
  expenses: Expense[]
  title?: string
}

export default function ExpenseByCategoryChart({ expenses, title = 'カテゴリ別支出' }: Props) {
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>()

    expenses.forEach((expense) => {
      const categoryName = expense.categoryName || '未分類'
      const existing = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, existing + expense.amount)
    })

    // 金額の大きい順にソート
    const sorted = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([name]) => name),
      amounts: sorted.map(([, amount]) => amount),
    }
  }, [expenses])

  const totalAmount = useMemo(() => {
    return chartData.amounts.reduce((sum, amount) => sum + amount, 0)
  }, [chartData.amounts])

  if (expenses.length === 0 || chartData.labels.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          この月の支出データがありません
        </Typography>
      </Paper>
    )
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.amounts,
        backgroundColor: COLORS.slice(0, chartData.labels.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 下部に独自の凡例を表示するため非表示
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; raw: unknown }) => {
            const amount = context.raw as number
            const percentage = ((amount / totalAmount) * 100).toFixed(1)
            return `${context.label}: ${formatCurrency(amount)} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        合計: {formatCurrency(totalAmount)}
      </Typography>

      <Box sx={{ width: '100%', height: 200, mb: 2 }}>
        <Doughnut data={data} options={options} />
      </Box>

      {/* カテゴリ別金額一覧 */}
      <Box>
        {chartData.labels.map((name, index) => {
          const amount = chartData.amounts[index]
          const percentage = ((amount / totalAmount) * 100).toFixed(1)
          return (
            <Box
              key={name}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.75,
                borderBottom: index < chartData.labels.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: COLORS[index % COLORS.length],
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {percentage}%
                </Typography>
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold', minWidth: 80, textAlign: 'right' }}>
                  {formatCurrency(amount)}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}