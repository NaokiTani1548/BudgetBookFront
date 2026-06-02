import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Paper, Typography, CircularProgress } from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import { config } from '../config'
import { authApi } from '../api/authApi'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = () => {
      // URLパラメータから認証情報を取得
      const token = searchParams.get('token')
      const userId = searchParams.get('userId')
      const email = searchParams.get('email')
      const name = searchParams.get('name')
      if (config.isMockMode || searchParams.get('mock') === 'true') {
        const mockUser = authApi.mockLogin()
        login(mockUser.token, {
          userId: mockUser.userId,
          email: mockUser.email,
          name: mockUser.name,
        })
        navigate('/calendar', { replace: true })
        return
      }


      if (!token || !userId || !email || !name) {
        setError('認証情報が不完全です')
        return
      }

      // 認証情報を保存
      login(token, {
        userId,
        email,
        name,
      })

      // メインページにリダイレクト
      navigate('/calendar', { replace: true })
    }

    handleCallback()
  }, [searchParams, navigate, login])

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            認証エラー
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Typography
            component="a"
            href="/login"
            sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
          >
            ログインページに戻る
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">認証中...</Typography>
        <Typography color="text.secondary">しばらくお待ちください</Typography>
      </Paper>
    </Container>
  )
}