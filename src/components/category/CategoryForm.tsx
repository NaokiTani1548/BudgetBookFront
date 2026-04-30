import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/category'

interface Props {
  open: boolean
  category?: Category | null
  onClose: () => void
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void
}

export default function CategoryForm({ open, category, onClose, onSubmit }: Props) {
  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(category?.type || 'EXPENSE')
  const [color, setColor] = useState(category?.color || '#2196f3')

  const handleSubmit = () => {
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      type,
      color,
    })

    if (!category) {
      setName('')
      setType('EXPENSE')
      setColor('#2196f3')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'カテゴリを編集' : 'カテゴリを追加'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="カテゴリ名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <FormControl fullWidth>
            <InputLabel>タイプ</InputLabel>
            <Select
              value={type}
              label="タイプ"
              onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
            >
              <MenuItem value="EXPENSE">支出</MenuItem>
              <MenuItem value="INCOME">収入</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="カラー"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          {category ? '更新' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}