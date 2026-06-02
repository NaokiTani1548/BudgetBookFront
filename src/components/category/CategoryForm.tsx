import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material'
import { Check } from '@mui/icons-material'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/category'

// カラーパレット
const COLOR_OPTIONS = [
  { value: '#E86A33', label: 'オレンジ' },
  { value: '#F39C12', label: 'イエロー' },
  { value: '#27AE60', label: 'グリーン' },
  { value: '#2ECC71', label: 'ライトグリーン' },
  { value: '#3498DB', label: 'ブルー' },
  { value: '#1ABC9C', label: 'ターコイズ' },
  { value: '#9B59B6', label: 'パープル' },
  { value: '#E74C3C', label: 'レッド' },
  { value: '#E91E63', label: 'ピンク' },
  { value: '#795548', label: 'ブラウン' },
  { value: '#607D8B', label: 'グレー' },
  { value: '#34495E', label: 'ダークグレー' },
]

interface Props {
  open: boolean
  category?: Category | null
  type?: 'EXPENSE' | 'INCOME'
  onClose: () => void
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void
}

// フォームの中身を別コンポーネントに分離
function CategoryFormContent({
  category,
  defaultType,
  onClose,
  onSubmit,
}: {
  category?: Category | null
  defaultType?: 'EXPENSE' | 'INCOME'
  onClose: () => void
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void
}) {
  // useState の初期値で設定（useEffect不要）
  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(
    category?.type || defaultType || 'EXPENSE'
  )
  const [color, setColor] = useState(category?.color || COLOR_OPTIONS[0].value)

  const handleSubmit = () => {
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      type,
      color,
    })

    onClose()
  }

  const isTypeFixed = !!defaultType

  return (
    <>
      <DialogTitle>
        {category ? '🏷️ カテゴリを編集' : '🏷️ カテゴリを追加'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="カテゴリ名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            placeholder="例: 食費、交通費、給与"
          />

          {!isTypeFixed && (
            <FormControl fullWidth>
              <InputLabel>種類</InputLabel>
              <Select
                value={type}
                label="種類"
                onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
              >
                <MenuItem value="EXPENSE">💸 支出</MenuItem>
                <MenuItem value="INCOME">💰 収入</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* カラーパレット */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              カラーを選択
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 1,
              }}
            >
              {COLOR_OPTIONS.map((option) => (
                <Box
                  key={option.value}
                  onClick={() => setColor(option.value)}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundColor: option.value,
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: color === option.value ? '3px solid #333' : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  {color === option.value && (
                    <Check sx={{ color: 'white', fontSize: '1.2rem' }} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim()}
          sx={{
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {category ? '更新' : '作成'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function CategoryForm({
  open,
  category,
  type,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* key を使ってダイアログが開くたびにコンテンツを再マウント */}
      {open && (
        <CategoryFormContent
          key={category?.id || 'new'}
          category={category}
          defaultType={type}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  )
}