import { useState } from 'react'
import { Box, Button, Typography, Alert } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import { mailApi } from '../../api/mailApi'

interface Props {
  label?: string
  showHint?: boolean
  fullWidth?: boolean
}

export default function MicrosoftLinkButton({
  label = 'Microsoftアカウントと連携',
  showHint = true,
  fullWidth = false,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      // stateは10分で失効するため、押下のたびに取得し直す
      const { url } = await mailApi.getMicrosoftAuthUrl()
      window.location.href = url
    } catch (err) {
      console.error('連携URLの取得に失敗:', err)
      setError('連携URLの取得に失敗しました。時間をおいて再度お試しください')
      setLoading(false)
    }
  }

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<LinkIcon />}
        onClick={handleClick}
        disabled={loading}
        fullWidth={fullWidth}
      >
        {loading ? '連携ページへ移動中...' : label}
      </Button>
      {showHint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          三井住友カードの通知メールを受信しているMicrosoftアカウント（outlook.jp）でログインしてください
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
