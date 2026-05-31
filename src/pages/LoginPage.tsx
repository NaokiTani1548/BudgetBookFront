import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Paper, Typography, Button, Box, CircularProgress } from '@mui/material'
import { Google } from '@mui/icons-material'
import { authApi } from '../api/authApi'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/list', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const { url, state } = await authApi.getGoogleAuthUrl()
      sessionStorage.setItem('oauth_state', state)
      window.location.href = url
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          {/* ロゴ・タイトル */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem' },
                mb: 1,
              }}
            >
              🏠
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
                家計簿
            </Typography>
          </Box>

          {/* イラスト風の装飾 */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(93, 156, 89, 0.08)',
              border: '2px dashed',
              borderColor: 'primary.light',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              📊 収支をかんたん記録<br />
              📅 カレンダーで見える化<br />
              🔄 定期支出も自動管理<br />
              📈 カテゴリ別で分析
            </Typography>
          </Box>

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
              fontSize: '1rem',
              borderRadius: 3,
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

        {/* フッター */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Made with 💚 for your family
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}