import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
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
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
    {/* 左側：ブランドエリア */}
    <Box
    sx={{
        flex: { xs: 'none', md: 1 },
        minHeight: { xs: '300px', md: '100vh' },
        background: 'linear-gradient(135deg, #fef9f3 0%, #f5e6d3 50%, #ffe8d6 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, md: 4 },
        position: 'relative',
    }}
    >
    {/* フルロゴ */}
    <Box
        component="img"
        src="/logo-full.png"
        alt="KAKEKAKEI"
        sx={{
        width: { xs: '85%', sm: '80%', md: '85%' },
        maxWidth: { xs: '350px', sm: '450px', md: '550px' },
        height: 'auto',
        filter: 'drop-shadow(0 8px 32px rgba(232, 106, 51, 0.3))',
        }}
    />

    {/* フッター */}
    <Box
        sx={{
        position: 'absolute',
        bottom: 24,
        }}
    >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
        © 2024 KAKEKAKEI
        </Typography>
    </Box>
    </Box>

      {/* 右側：ログインフォーム */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 4, md: 8 },
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* モバイルではここにもロゴを表示（任意） */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="KAKEKAKEI"
              sx={{ width: 60, height: 'auto' }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: '#333',
            }}
          >
            ログイン
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 4,
            }}
          >
            Googleアカウントでログインしてください。
          </Typography>

          {error && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 1,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid',
                borderColor: 'error.main',
              }}
            >
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          {/* Googleログインボタン */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Google />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              backgroundColor: '#111111',
              color: '#FFFFFF',
              py: 1.8,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '50px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#333333',
                boxShadow: 'none',
              },
              '&:disabled': {
                backgroundColor: '#666666',
                color: '#CCCCCC',
              },
            }}
          >
            {loading ? 'リダイレクト中...' : 'Googleでログイン'}
          </Button>

          {/* 区切り線 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              my: 4,
            }}
          >
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0' }} />
            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>
              はじめての方へ
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0' }} />
          </Box>

          {/* 利用規約 */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 4,
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            ログインすることで、
            <Box
              component="span"
              sx={{
                color: '#E86A33',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              利用規約
            </Box>
            と
            <Box
              component="span"
              sx={{
                color: '#E86A33',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              プライバシーポリシー
            </Box>
            に同意したものとみなされます。
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}