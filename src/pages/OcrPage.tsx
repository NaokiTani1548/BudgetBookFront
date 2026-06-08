import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import { useCurrentBalance } from '../hooks/useCurrentBalance'
import { expenseApi } from '../api/expenseApi'
import OcrUploader from '../components/ocr/OcrUploader'
import OcrResultList, { type OcrItemWithMeta } from '../components/ocr/OcrResultList'
import BalanceSummary from '../components/common/BalanceSummary'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import type { OcrItem } from '../api/ocrApi'

export default function OcrPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { categories, loading: categoriesLoading, createCategory } = useCategories('EXPENSE')
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const { summary, loading: balanceLoading, refetch: refetchBalance } = useCurrentBalance()

  const [ocrItems, setOcrItems] = useState<OcrItem[] | null>(null)
  const [ocrSubmitting, setOcrSubmitting] = useState(false)

  // OCR解析完了
  const handleOcrComplete = (items: OcrItem[]) => {
    setOcrItems(items)
  }

  // OCR結果を登録
  const handleOcrSubmit = async (items: OcrItemWithMeta[]) => {
    setOcrSubmitting(true)
    try {
      let successCount = 0
      for (const item of items) {
        try {
          await expenseApi.create({
            amount: item.amount,
            expenseDate: item.expenseDate,
            categoryId: item.categoryId,
            description: item.description,
            paymentMethod: item.paymentMethod,
          })
          successCount++
        } catch (err) {
          console.error('登録エラー:', err)
        }
      }
      showSuccess(`${successCount}件の支出を登録しました`)
      setOcrItems(null)
      refetchBalance()
    } catch {
      showError('登録に失敗しました')
    } finally {
      setOcrSubmitting(false)
    }
  }

  // OCRキャンセル
  const handleOcrCancel = () => {
    setOcrItems(null)
  }

  if (categoriesLoading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          📸 レシート読み取り
        </Typography>
        <Typography variant="body2" color="text.secondary">
          レシートや明細の画像から支出を自動登録します
        </Typography>
      </Box>

      {/* 現在の総資産 */}
      <BalanceSummary summary={summary} loading={balanceLoading} />

      {/* OCR機能 */}
      {ocrItems ? (
        <OcrResultList
          items={ocrItems}
          categories={categories}
          onCreateCategory={createCategory}
          onSubmit={handleOcrSubmit}
          onCancel={handleOcrCancel}
          submitting={ocrSubmitting}
        />
      ) : (
        <OcrUploader onAnalyzeComplete={handleOcrComplete} />
      )}

      {/* 使い方ガイド */}
      {!ocrItems && (
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
              { step: '1', text: 'レシートや決済履歴のスクリーンショットを撮影またはアップロード' },
              { step: '2', text: 'AIが自動で店名・金額・日付・支払方法を読み取ります' },
              { step: '3', text: '読み取り結果を確認し、カテゴリを選択' },
              { step: '4', text: 'チェックした項目を一括登録' },
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

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              💡 対応している画像
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              レシート、PayPay・楽天Payなどの決済履歴、クレジットカード明細、銀行アプリの履歴
            </Typography>
          </Box>
        </Box>
      )}

      {/* 通知 */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Container>
  )
}