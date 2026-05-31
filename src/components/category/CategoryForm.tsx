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
} from '@mui/material'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/category'

interface Props {
  open: boolean
  category?: Category | null
  type?: 'EXPENSE' | 'INCOME'
  onClose: () => void
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void
}

export default function CategoryForm({
  open,
  category,
  type: defaultType,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(
    category?.type || defaultType || 'EXPENSE'
  )
  const [color, setColor] = useState(category?.color || '')

  const handleSubmit = () => {
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      type,
      color: color || undefined,
    })

    // フォームをリセット
    if (!category) {
      setName('')
      setColor('')
    }
  }

  // ダイアログを閉じる際にフォームをリセット
  const handleClose = () => {
    if (!category) {
      setName('')
      setType(defaultType || 'EXPENSE')
      setColor('')
    }
    onClose()
  }

  // typeが固定されているかどうか（CategorySelectWithCreateから呼ばれた場合）
  const isTypeFixed = !!defaultType

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? '🏷️ カテゴリを編集' : '🏷️ カテゴリを追加'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
          <TextField
            label="カラー（任意）"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            fullWidth
            placeholder="#FF5722"
            helperText="カラーコードを入力（例: #FF5722）"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim()}
        >
          {category ? '更新' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}