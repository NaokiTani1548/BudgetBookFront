import { useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Email } from '@mui/icons-material'
import { useCategories } from '../hooks/useCategories'
import { useExpenses } from '../hooks/useExpenses'
import { useNotification } from '../hooks/useNotification'
import { useCurrentBalance } from '../hooks/useCurrentBalance'
import { expenseApi } from '../api/expenseApi'
import { mailApi } from '../api/mailApi'
import { queryKeys } from '../lib/queryClient'
import OcrResultList, { type OcrItemWithMeta } from '../components/ocr/OcrResultList'
import MicrosoftLinkButton from '../components/mail/MicrosoftLinkButton'
import BalanceSummary from '../components/common/BalanceSummary'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import { getToday } from '../utils/dateUtils'
import type { OcrItem } from '../api/ocrApi'
import type { Expense } from '../types/expense'

const MAX_RANGE_DAYS = 366

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)

interface DateRange {
  from: string
  to: string
}

/** 候補の日付範囲（登録済み支出の取得に使う） */
const getCandidateRange = (items: OcrItem[]): DateRange | null => {
  if (items.length === 0) return null
  const dates = items.map((i) => i.expenseDate).sort()
  return { from: dates[0], to: dates[dates.length - 1] }
}

/** 同じ日・同じ金額の支出が既に登録されているか */
const isLikelyDuplicate = (expenses: Expense[], date: string, amount: number) =>
  expenses.some((e) => e.expenseDate === date && e.amount === amount)

/**
 * 候補の日付に登録済みの支出を表示する（重複登録の防止用）
 * 編集で日付が取得範囲外になった場合は、その日だけを個別に取得する
 */
function ExistingExpensesOnDate({
  date,
  amount,
  range,
}: {
  date: string
  amount: number
  range: DateRange
}) {
  const inRange = date >= range.from && date <= range.to
  const from = inRange ? range.from : date
  const to = inRange ? range.to : date
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && dayjs(date).isValid()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.expenses.byDateRange(from, to),
    queryFn: () => expenseApi.getByDateRange(from, to),
    enabled: validDate,
  })

  if (!validDate) return null

  const expenses = (data ?? []).filter((e) => e.expenseDate === date)
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.03)',
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
        📋 {dayjs(date).format('M/D')} の登録済み支出
        {!isLoading && `（${expenses.length}件 / ${formatCurrency(total)}）`}
      </Typography>
      {isLoading ? (
        <CircularProgress size={16} />
      ) : expenses.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          この日の支出はまだ登録されていません
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {expenses.map((e) => {
            const sameAmount = e.amount === amount
            return (
              <Box
                key={e.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: sameAmount ? 'rgba(237, 108, 2, 0.12)' : 'transparent',
                }}
              >
                <Typography variant="caption" sx={{ flex: 1, minWidth: 0 }} noWrap>
                  {e.description || '-'}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {' '}・{e.categoryName || '未分類'}・{e.paymentMethod === 'CASH' ? '現金' : 'クレカ'}
                  </Typography>
                </Typography>
                {sameAmount && (
                  <Chip label="同額" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {formatCurrency(e.amount)}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}
      {isLikelyDuplicate(expenses, date, amount) && (
        <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mt: 0.5 }}>
          ⚠️ 同じ日に同じ金額の支出があります。登録済みでないか確認してください
        </Typography>
      )}
    </Box>
  )
}

export default function MailPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const queryClient = useQueryClient()

  const { categories, loading: categoriesLoading, createCategory } = useCategories('EXPENSE')
  const { createExpense } = useExpenses()
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const { summary, loading: balanceLoading, refetch: refetchBalance } = useCurrentBalance()

  const [start, setStart] = useState(getToday())
  const [end, setEnd] = useState(getToday())

  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [notLinked, setNotLinked] = useState(false)

  const [candidates, setCandidates] = useState<OcrItem[] | null>(null)
  const [candidateRange, setCandidateRange] = useState<DateRange | null>(null)
  const [existingAtFetch, setExistingAtFetch] = useState<Expense[]>([])
  const [listKey, setListKey] = useState(0)
  const [remainingCount, setRemainingCount] = useState(0)
  const [allRegistered, setAllRegistered] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 期間のバリデーション
  const rangeError = (() => {
    if (!start || !end) return '開始日と終了日を入力してください'
    if (start > end) return '開始日は終了日以前の日付を指定してください'
    if (dayjs(end).diff(dayjs(start), 'day') + 1 > MAX_RANGE_DAYS) {
      return `期間は${MAX_RANGE_DAYS}日以内で指定してください`
    }
    return null
  })()

  const handleFetch = async () => {
    if (rangeError) return

    setFetching(true)
    setFetchError(null)
    setNotLinked(false)
    setCandidates(null)
    setAllRegistered(false)

    try {
      const { items: rawItems } = await mailApi.getSmbcUsages(start, end)
      // カード利用明細なので支払方法はクレカをデフォルトにする
      const items = rawItems.map((item) => ({ ...item, paymentMethod: 'CREDIT_CARD' }))
      const range = getCandidateRange(items)

      // 重複らしき候補の初期チェックを外すため、先に登録済み支出を取得しておく
      let existing: Expense[] = []
      if (range) {
        existing = await queryClient.fetchQuery({
          queryKey: queryKeys.expenses.byDateRange(range.from, range.to),
          queryFn: () => expenseApi.getByDateRange(range.from, range.to),
          staleTime: 0,
        })
      }

      setExistingAtFetch(existing)
      setCandidateRange(range)
      setCandidates(items)
      setRemainingCount(items.length)
      setListKey((k) => k + 1)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as { error?: string; code?: string } | undefined
        if (status === 409 && data?.code === 'MICROSOFT_NOT_LINKED') {
          setNotLinked(true)
          return
        }
        if (status === 401) {
          // 共通のインターセプターでログイン画面へ遷移する
          return
        }
        if (status === 400 && data?.error) {
          setFetchError(data.error)
          return
        }
      }
      console.error('メールの取得に失敗:', err)
      setFetchError('メールの取得に失敗しました')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (items: OcrItemWithMeta[]): Promise<string[]> => {
    setSubmitting(true)
    const succeededIds: string[] = []
    let failCount = 0

    for (const item of items) {
      try {
        await createExpense({
          amount: item.amount,
          expenseDate: item.expenseDate,
          categoryId: item.categoryId,
          description: item.description,
          paymentMethod: item.paymentMethod,
        })
        succeededIds.push(item.id)
      } catch (err) {
        console.error('登録失敗:', item.description, err)
        failCount++
      }
    }

    setSubmitting(false)

    if (succeededIds.length > 0) {
      refetchBalance()
      const remaining = remainingCount - succeededIds.length
      setRemainingCount(remaining)
      if (remaining <= 0) {
        setCandidates(null)
        setAllRegistered(true)
      }
      if (failCount > 0) {
        showSuccess(`${succeededIds.length}件を登録しました（${failCount}件失敗）`)
      } else {
        showSuccess(`${succeededIds.length}件の支出を登録しました`)
      }
    } else {
      showError('登録に失敗しました')
    }

    return succeededIds
  }

  const handleCancel = () => {
    setCandidates(null)
  }

  if (categoriesLoading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          📧 メール読み取り
        </Typography>
        <Typography variant="body2" color="text.secondary">
          三井住友カードの「ご利用のお知らせ」メールから支出を登録します
        </Typography>
      </Box>

      <BalanceSummary summary={summary} loading={balanceLoading} />

      {/* 期間指定 */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          🗓️ 取得期間
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            label="開始日"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            size="small"
            error={!!start && !!end && start > end}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="終了日"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            size="small"
            error={!!start && !!end && start > end}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button
            variant="contained"
            startIcon={<Email />}
            onClick={handleFetch}
            disabled={!!rangeError || fetching || submitting}
          >
            {fetching ? '取得中...' : 'メールから取得'}
          </Button>
        </Box>
        {rangeError && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            {rangeError}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          ※ 期間はメールを受信した日で絞り込まれます（手動転送したメールは転送した日）
        </Typography>
      </Paper>

      {/* 取得中 */}
      {fetching && (
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>メールを取得しています...</Typography>
          <Typography variant="caption" color="text.secondary">
            サーバーの起動直後は数十秒かかることがあります
          </Typography>
        </Paper>
      )}

      {/* 未連携 */}
      {notLinked && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Microsoftアカウントの連携が必要です
          </Alert>
          <MicrosoftLinkButton fullWidth={isMobile} />
        </Paper>
      )}

      {/* エラー */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fetchError}
        </Alert>
      )}

      {/* 結果 */}
      {candidates && candidates.length === 0 && (
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            📭 該当するご利用通知メールはありませんでした
          </Typography>
        </Paper>
      )}

      {allRegistered && (
        <Alert severity="success" sx={{ mb: 3 }}>
          取得した候補をすべて登録しました
        </Alert>
      )}

      {candidates && candidates.length > 0 && candidateRange && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            各候補の下に、同じ日に登録済みの支出を表示しています。二重登録にならないか確認してください。
            同じ日・同じ金額の支出がある候補は、最初からチェックを外しています。
          </Alert>
          <OcrResultList
            key={listKey}
            items={candidates}
            categories={categories}
            onCreateCategory={createCategory}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitting={submitting}
            title="💳 ご利用明細"
            initialChecked={(item) =>
              !isLikelyDuplicate(existingAtFetch, item.expenseDate, item.amount)
            }
            renderItemExtra={(item) => (
              <ExistingExpensesOnDate
                date={item.expenseDate}
                amount={item.amount}
                range={candidateRange}
              />
            )}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -2, mb: 3 }}>
            ※ 金額は通知時点（承認照会）のもので、確定した請求額と異なる場合があります
          </Typography>
        </>
      )}

      {/* 連携設定・使い方 */}
      {!candidates && !fetching && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            backgroundColor: 'rgba(232, 106, 51, 0.05)',
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            📖 使い方
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { step: '1', text: '初回のみ、下のボタンからMicrosoftアカウント（outlook.jp）と連携' },
              { step: '2', text: '取得期間を指定して「メールから取得」を押す' },
              { step: '3', text: '利用明細と、同じ日の登録済み支出を見比べて重複がないか確認' },
              { step: '4', text: 'カテゴリを選択し、チェックした項目を一括登録' },
            ].map((item) => (
              <Box key={item.step} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {!notLinked && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                🔗 Microsoftアカウント連携
              </Typography>
              <MicrosoftLinkButton fullWidth={isMobile} />
            </Box>
          )}
        </Box>
      )}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Container>
  )
}
