import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Paper, Typography, Button, Box } from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import MicrosoftLinkButton from '../components/mail/MicrosoftLinkButton'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: '連携がキャンセルされました',
}
const DEFAULT_ERROR_MESSAGE = '連携に失敗しました。もう一度お試しください'

export default function MicrosoftCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const status = searchParams.get('status')
  const reason = searchParams.get('reason') ?? ''
  const isSuccess = status === 'success'

  // 連携成功かつログイン中なら、少し待ってメール読み取り画面へ
  useEffect(() => {
    if (!isSuccess || !isAuthenticated) return
    const timer = setTimeout(() => navigate('/mail', { replace: true }), 2000)
    return () => clearTimeout(timer)
  }, [isSuccess, isAuthenticated, navigate])

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        {isSuccess ? (
          <>
            <Typography variant="h3" sx={{ mb: 1 }}>✅</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Microsoftアカウントと連携しました
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {isAuthenticated
                ? 'まもなくメール読み取り画面へ移動します'
                : 'ログインするとメールから支出を取り込めます'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(isAuthenticated ? '/mail' : '/login', { replace: true })}
            >
              {isAuthenticated ? 'メール読み取りへ' : 'ログインページへ'}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h3" sx={{ mb: 1 }}>⚠️</Typography>
            <Typography variant="h5" color="error" sx={{ fontWeight: 700, mb: 1 }}>
              {ERROR_MESSAGES[reason] ?? DEFAULT_ERROR_MESSAGE}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {isAuthenticated ? (
                <>
                  <MicrosoftLinkButton label="もう一度連携する" />
                  <Button onClick={() => navigate('/mail', { replace: true })}>
                    メール読み取りに戻る
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary">
                    もう一度連携するにはログインが必要です
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/login', { replace: true })}>
                    ログインページへ
                  </Button>
                </>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}
