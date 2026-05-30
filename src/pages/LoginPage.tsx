import { useState } from 'react'
import { Container, Paper, Typography, Button, Box, CircularProgress } from '@mui/material'
import { Google } from '@mui/icons-material'
import { authApi } from '../api/authApi'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      // Google認証URLを取得
      const { url, state } = await authApi.getGoogleAuthUrl()

      // stateをsessionStorageに保存（CSRF検証用）
      sessionStorage.setItem('oauth_state', state)

      // Google認証画面にリダイレクト
      window.location.href = url
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          💰 BudgetBook
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          家計簿アプリにログイン
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Google />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{
            backgroundColor: '#4285F4',
            '&:hover': { backgroundColor: '#357ABD' },
            px: 4,
            py: 1.5,
          }}
        >
          {loading ? 'リダイレクト中...' : 'Googleでログイン'}
        </Button>

        <Box sx={{ mt: 4 }}>
          <Typography variant="caption" color="text.secondary">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}