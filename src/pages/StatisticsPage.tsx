import { useState, useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
} from 'chart.js'
import { Bar, Line, Doughnut, Chart } from 'react-chartjs-2'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { expenseApi } from '../api/expenseApi'
import { incomeApi } from '../api/incomeApi'
import { summaryApi } from '../api/summaryApi'
import { recurringExpenseApi } from '../api/recurringExpenseApi'
import { queryKeys } from '../lib/queryClient'
import Loading from '../components/common/Loading'
import { useCategories } from '../hooks/useCategories'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
)

/** 投資額（元金）として集計する支出カテゴリ名（完全一致） */
const INVESTMENT_CATEGORY_NAME = '投資'
/** 総投資額の集計開始日（全期間を対象にするための十分に古い日付） */
const INVESTMENT_FROM = '2000-01-01'

const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722',
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)

const formatCompact = (amount: number) => {
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万`
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}千`
  return `¥${amount}`
}

export default function StatisticsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [year, setYear] = useState(dayjs().year())
  const [checkedCategories, setCheckedCategories] = useState<Set<string> | null>(null) // null = all

  const endMonth = dayjs().year(year).month(11)
  const startMonth = endMonth.subtract(11, 'month')

  const months = useMemo(() => {
    const result: dayjs.Dayjs[] = []
    let current = startMonth
    while (current.isBefore(endMonth) || current.isSame(endMonth, 'month')) {
      result.push(current)
      current = current.add(1, 'month')
    }
    return result
  }, [startMonth.format('YYYY-MM'), endMonth.format('YYYY-MM')])

  const from = startMonth.startOf('month').format('YYYY-MM-DD')
  const to = endMonth.endOf('month').format('YYYY-MM-DD')

  const currentMonthKey = dayjs().format('YYYY-MM')

  // Only show months up to current month
  const visibleMonths = useMemo(
    () => months.filter((m) => m.format('YYYY-MM') <= currentMonthKey),
    [months, currentMonthKey]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['statistics', from, to],
    queryFn: async () => {
      const [expenses, incomes, balance] = await Promise.all([
        expenseApi.getByDateRange(from, to),
        incomeApi.getByDateRange(from, to),
        summaryApi.getCurrentBalance(),
      ])
      return { expenses, incomes, balance }
    },
  })

  const { data: recurringExpenses = [] } = useQuery({
    queryKey: queryKeys.recurringExpenses,
    queryFn: () => recurringExpenseApi.getAll(),
  })

  // 「投資」カテゴリの支出を全期間分取得（総投資額・累計の算出用）
  const { categories: expenseCategories } = useCategories('EXPENSE')
  const investmentCategoryId = expenseCategories.find(
    (c) => c.name === INVESTMENT_CATEGORY_NAME
  )?.id
  const todayKey = dayjs().format('YYYY-MM-DD')
  const { data: allInvestments = [], isLoading: investmentLoading } = useQuery({
    queryKey: queryKeys.expenses.search({
      categoryId: investmentCategoryId ?? '',
      from: INVESTMENT_FROM,
      to: todayKey,
    }),
    queryFn: () =>
      expenseApi.search({ categoryId: investmentCategoryId, from: INVESTMENT_FROM, to: todayKey }),
    enabled: !!investmentCategoryId,
  })

  if (isLoading) return <Loading />

  const expenses = data?.expenses ?? []
  const incomes = data?.incomes ?? []
  const currentBalance = data?.balance?.currentBalance ?? 0

  // Group by month (only visible months)
  const todayStr = dayjs().format('YYYY-MM-DD')
  const visibleMonthlyData = visibleMonths.map((m) => {
    const key = m.format('YYYY-MM')
    const isCurrentMonth = key === currentMonthKey
    const monthExpenses = expenses.filter((e) => e.expenseDate.startsWith(key))
    const monthIncomes = incomes.filter((i) => i.incomeDate.startsWith(key))
    const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0)
    const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0)
    // For balance calculation: current month only counts transactions up to today
    const balanceExpense = isCurrentMonth
      ? monthExpenses.filter((e) => e.expenseDate <= todayStr).reduce((s, e) => s + e.amount, 0)
      : totalExpense
    const balanceIncome = isCurrentMonth
      ? monthIncomes.filter((i) => i.incomeDate <= todayStr).reduce((s, i) => s + i.amount, 0)
      : totalIncome
    return {
      label: m.format('M月'),
      key,
      totalExpense,
      totalIncome,
      net: totalIncome - totalExpense,
      balanceNet: balanceIncome - balanceExpense,
      expenses: monthExpenses,
      incomes: monthIncomes,
    }
  })

  // Build balance per month-end by accumulating net from the first month
  const totalBalanceNet = visibleMonthlyData.reduce((s, m) => s + m.balanceNet, 0)
  const baseBalance = currentBalance - totalBalanceNet
  const balances = visibleMonthlyData.reduce<number[]>((acc, m) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : baseBalance
    acc.push(prev + m.balanceNet)
    return acc
  }, [])

  // Category breakdown for expenses
  const categoryExpenseMap = new Map<string, number>()
  expenses.forEach((e) => {
    const cat = e.categoryName || '未分類'
    categoryExpenseMap.set(cat, (categoryExpenseMap.get(cat) || 0) + e.amount)
  })
  const sortedCategories = Array.from(categoryExpenseMap.entries()).sort((a, b) => b[1] - a[1])

  // Category checkbox logic
  const allCategoryNames = sortedCategories.map(([name]) => name)
  const isAllChecked = checkedCategories === null
  const displayCategories = isAllChecked
    ? allCategoryNames
    : allCategoryNames.filter((name) => checkedCategories.has(name))
  const categoryMonthlyData = displayCategories.map((cat) => {
    return visibleMonthlyData.map((m) =>
      m.expenses
        .filter((e) => (e.categoryName || '未分類') === cat)
        .reduce((s, e) => s + e.amount, 0)
    )
  })

  const handleToggleAll = () => {
    if (isAllChecked) {
      setCheckedCategories(new Set())
    } else {
      setCheckedCategories(null)
    }
  }

  const handleToggleCategory = (name: string) => {
    const current = checkedCategories ?? new Set(allCategoryNames)
    const next = new Set(current)
    if (next.has(name)) {
      next.delete(name)
    } else {
      next.add(name)
    }
    // 全部チェックされたら null (= all) に戻す
    if (next.size === allCategoryNames.length) {
      setCheckedCategories(null)
    } else {
      setCheckedCategories(next)
    }
  }

  const isCategoryChecked = (name: string) =>
    isAllChecked || checkedCategories.has(name)

  const monthLabels = visibleMonthlyData.map((m) => m.label)
  const totalExpenseSum = expenses.reduce((s, e) => s + e.amount, 0)
  const totalIncomeSum = incomes.reduce((s, i) => s + i.amount, 0)

  // 投資額（元金）の集計。今日までの実績のみを対象にする
  const investments = allInvestments.filter(
    (e) => e.categoryName === INVESTMENT_CATEGORY_NAME && e.expenseDate <= todayStr
  )
  const totalInvestment = investments.reduce((s, e) => s + e.amount, 0)
  const firstMonthKey = visibleMonthlyData[0]?.key ?? ''
  const investmentBeforePeriod = investments
    .filter((e) => e.expenseDate.slice(0, 7) < firstMonthKey)
    .reduce((s, e) => s + e.amount, 0)
  const monthlyInvestments = visibleMonthlyData.map((m) =>
    investments
      .filter((e) => e.expenseDate.startsWith(m.key))
      .reduce((s, e) => s + e.amount, 0)
  )
  const cumulativeInvestments = monthlyInvestments.reduce<number[]>((acc, amount) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : investmentBeforePeriod
    acc.push(prev + amount)
    return acc
  }, [])
  const periodInvestment = monthlyInvestments.reduce((s, a) => s + a, 0)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            `${ctx.dataset.label}: ${formatCurrency(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => formatCompact(Number(value)),
        },
      },
    },
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={() => setYear(year - 1)}>
            <ChevronLeft />
          </IconButton>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {year}年 統計
          </Typography>
          <IconButton onClick={() => setYear(year + 1)}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">現在の残高</Typography>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {formatCurrency(currentBalance)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">期間収入合計</Typography>
          <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
            {formatCurrency(totalIncomeSum)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">期間支出合計</Typography>
          <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
            {formatCurrency(totalExpenseSum)}
          </Typography>
        </Paper>
      </Box>

      {/* Chart 1: Monthly Income vs Expense */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          月別 収入・支出
        </Typography>
        <Box sx={{ height: { xs: 250, md: 350 } }}>
          <Bar
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: '収入',
                  data: visibleMonthlyData.map((m) => m.totalIncome),
                  backgroundColor: 'rgba(129, 199, 132, 0.7)',
                  borderColor: '#4CAF50',
                  borderWidth: 1,
                },
                {
                  label: '支出',
                  data: visibleMonthlyData.map((m) => m.totalExpense),
                  backgroundColor: 'rgba(229, 115, 115, 0.7)',
                  borderColor: '#F44336',
                  borderWidth: 1,
                },
              ],
            }}
            options={chartOptions}
          />
        </Box>
      </Paper>

      {/* Chart 2: Net Balance Trend (Line) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          月別 収支差額の推移
        </Typography>
        <Box sx={{ height: { xs: 250, md: 350 } }}>
          <Bar
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: '収支差額',
                  data: visibleMonthlyData.map((m) => m.net),
                  backgroundColor: visibleMonthlyData.map((m) =>
                    m.net >= 0 ? 'rgba(129, 199, 132, 0.7)' : 'rgba(229, 115, 115, 0.7)'
                  ),
                  borderColor: visibleMonthlyData.map((m) =>
                    m.net >= 0 ? '#4CAF50' : '#F44336'
                  ),
                  borderWidth: 1,
                },
              ],
            }}
            options={chartOptions}
          />
        </Box>
      </Paper>

      {/* Chart 3: Balance Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          資産残高の推移
        </Typography>
        <Box sx={{ height: { xs: 250, md: 350 } }}>
          <Line
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: '残高',
                  data: balances,
                  borderColor: '#5D9C59',
                  backgroundColor: 'rgba(93, 156, 89, 0.1)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 4,
                  pointBackgroundColor: '#5D9C59',
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Chart: Investment Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          投資額（元金）の推移
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(63, 81, 181, 0.06)', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">総投資額（元金・今日まで）</Typography>
            <Typography variant="h5" sx={{ color: '#3F51B5', fontWeight: 700 }}>
              {investmentLoading ? '...' : formatCurrency(totalInvestment)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.03)', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">{year}年の投資額</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {investmentLoading ? '...' : formatCurrency(periodInvestment)}
            </Typography>
          </Box>
        </Box>
        {!investmentCategoryId ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            「{INVESTMENT_CATEGORY_NAME}」カテゴリがありません。支出カテゴリに「{INVESTMENT_CATEGORY_NAME}」を作成して登録すると表示されます
          </Typography>
        ) : (
          <Box sx={{ height: { xs: 250, md: 350 } }}>
            <Chart
              type="bar"
              data={{
                labels: monthLabels,
                datasets: [
                  {
                    type: 'line' as const,
                    label: '累計投資額',
                    data: cumulativeInvestments,
                    borderColor: '#3F51B5',
                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#3F51B5',
                    yAxisID: 'y',
                  },
                  {
                    type: 'bar' as const,
                    label: '月間投資額',
                    data: monthlyInvestments,
                    backgroundColor: 'rgba(121, 134, 203, 0.6)',
                    borderColor: '#7986CB',
                    borderWidth: 1,
                    yAxisID: 'y1',
                  },
                ],
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    position: 'left',
                    beginAtZero: true,
                    title: { display: !isMobile, text: '累計' },
                    ticks: { callback: (value: string | number) => formatCompact(Number(value)) },
                  },
                  y1: {
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    title: { display: !isMobile, text: '月間' },
                    ticks: { callback: (value: string | number) => formatCompact(Number(value)) },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Chart 4: Category Expense Bar with Checkboxes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          カテゴリ別支出の推移
        </Typography>
        <FormGroup row sx={{ mb: 2, flexWrap: 'wrap', gap: 0 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllChecked}
                indeterminate={!isAllChecked && displayCategories.length > 0}
                onChange={handleToggleAll}
                size="small"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>全て</Typography>}
            sx={{ mr: 2 }}
          />
          {allCategoryNames.map((name, i) => (
            <FormControlLabel
              key={name}
              control={
                <Checkbox
                  checked={isCategoryChecked(name)}
                  onChange={() => handleToggleCategory(name)}
                  size="small"
                  sx={{ color: COLORS[i % COLORS.length], '&.Mui-checked': { color: COLORS[i % COLORS.length] } }}
                />
              }
              label={<Typography variant="body2">{name}</Typography>}
              sx={{ mr: 1 }}
            />
          ))}
        </FormGroup>
        <Box sx={{ height: { xs: 300, md: 400 } }}>
          {displayCategories.length > 0 ? (
            <Bar
              data={{
                labels: monthLabels,
                datasets: displayCategories.map((cat, i) => {
                  const colorIndex = allCategoryNames.indexOf(cat)
                  return {
                    label: cat,
                    data: categoryMonthlyData[i],
                    backgroundColor: COLORS[colorIndex % COLORS.length] + 'CC',
                    borderColor: COLORS[colorIndex % COLORS.length],
                    borderWidth: 1,
                  }
                }),
              }}
              options={{
                ...chartOptions,
                scales: {
                  x: { stacked: true },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                      callback: (value: string | number) => formatCompact(Number(value)),
                    },
                  },
                },
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">カテゴリを選択してください</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Chart 5: Category Doughnut */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            カテゴリ別支出割合
          </Typography>
          {sortedCategories.length > 0 ? (
            <>
              <Box sx={{ height: 220, mb: 2 }}>
                <Doughnut
                  data={{
                    labels: sortedCategories.map(([name]) => name),
                    datasets: [
                      {
                        data: sortedCategories.map(([, amount]) => amount),
                        backgroundColor: COLORS.slice(0, sortedCategories.length),
                        borderWidth: 2,
                        borderColor: '#fff',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx: { label: string; raw: unknown }) => {
                            const amount = ctx.raw as number
                            const pct = ((amount / totalExpenseSum) * 100).toFixed(1)
                            return `${ctx.label}: ${formatCurrency(amount)} (${pct}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
              <Box>
                {sortedCategories.map(([name, amount], i) => (
                  <Box
                    key={name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      borderBottom: i < sortedCategories.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          backgroundColor: COLORS[i % COLORS.length],
                          borderRadius: '2px',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2">{name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              データがありません
            </Typography>
          )}
        </Paper>

        {/* Recurring Expenses List */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            定期支出一覧
          </Typography>
          {recurringExpenses.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>内容</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell>期間</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recurringExpenses.map((r) => {
                  const start = dayjs(r.startDate).format('YYYY/M')
                  const end = r.endDate ? dayjs(r.endDate).format('YYYY/M') : ''
                  const periodLabel = end ? `${start}~${end}` : `${start}~`
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {r.description || r.categoryName || '—'}
                        </Typography>
                        {r.categoryName && r.description && (
                          <Typography variant="caption" color="text.secondary">
                            {r.categoryName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {formatCurrency(r.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          毎月{r.billingDay}日
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {periodLabel}
                        </Typography>
                        <br />
                        <Chip
                          label={r.isActive ? '有効' : '無効'}
                          size="small"
                          color={r.isActive ? 'success' : 'default'}
                          sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              定期支出がありません
            </Typography>
          )}
          {recurringExpenses.length > 0 && (
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                月額合計（有効のみ）:{' '}
                <Box component="span" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {formatCurrency(
                    recurringExpenses
                      .filter((r) => r.isActive)
                      .reduce((s, r) => s + r.amount, 0)
                  )}
                </Box>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  )
}
