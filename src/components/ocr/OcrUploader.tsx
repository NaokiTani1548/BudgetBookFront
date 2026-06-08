import { useState, useRef } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { CameraAlt, Upload, Receipt } from '@mui/icons-material'
import { ocrApi, type OcrItem } from '../../api/ocrApi'

interface Props {
  onAnalyzeComplete: (items: OcrItem[]) => void
}

export default function OcrUploader({ onAnalyzeComplete }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    // プレビュー表示
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 解析開始
    setLoading(true)
    setError(null)

    try {
      const response = await ocrApi.analyze(file)
      if (response.items.length === 0) {
        setError('画像から支出情報を読み取れませんでした。別の画像をお試しください。')
      } else {
        onAnalyzeComplete(response.items)
      }
    } catch (err: unknown) {
      console.error('OCR解析エラー:', err)
      setError('画像の解析に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // 同じファイルを再選択できるようにリセット
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        📸 レシート・明細を読み取り
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            gap: 2,
          }}
        >
          {preview && (
            <Box
              component="img"
              src={preview}
              alt="解析中"
              sx={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: 2,
                opacity: 0.7,
                mb: 2,
              }}
            />
          )}
          <CircularProgress sx={{ color: 'primary.main' }} />
          <Typography color="text.secondary">
            AIが画像を解析中です...（3〜10秒）
          </Typography>
        </Box>
      ) : (
        <>
          {/* ドロップエリア（PC用） */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed',
              borderColor: 'primary.light',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              backgroundColor: 'rgba(232, 106, 51, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: { xs: 'none', sm: 'block' },
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(232, 106, 51, 0.08)',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Receipt sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              ここに画像をドロップ、またはクリックして選択
            </Typography>
            <Typography variant="caption" color="text.secondary">
              対応形式: JPEG, PNG, WebP（10MB以下）
            </Typography>
          </Box>

          {/* ボタン（モバイル用） */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              mt: { xs: 0, sm: 2 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={() => cameraInputRef.current?.click()}
              fullWidth={isMobile}
              sx={{ flex: 1 }}
            >
              カメラで撮影
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth={isMobile}
              sx={{ flex: 1 }}
            >
              ファイルを選択
            </Button>
          </Box>

          {/* 隠しinput */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      )}

      {/* ヒント */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8 }}>
          💡 対応している画像: レシート、PayPay・楽天Payなどの決済履歴、クレジットカード明細、銀行アプリの履歴
        </Typography>
      </Box>
    </Paper>
  )
}