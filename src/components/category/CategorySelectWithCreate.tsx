import { useState } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SxProps,
  type Theme,
} from '@mui/material'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategoryForm from './CategoryForm'

interface Props {
  categories: Category[]
  value: string
  onChange: (value: string) => void  // null を削除
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
  type: 'EXPENSE' | 'INCOME'
  label?: string
  sx?: SxProps<Theme>
  fullWidth?: boolean
  size?: 'small' | 'medium'
}

export default function CategorySelectWithCreate({
  categories,
  value,
  onChange,
  onCreateCategory,
  type,
  label = 'カテゴリ',
  sx,
  fullWidth,
  size = 'medium',
}: Props) {
  const [formOpen, setFormOpen] = useState(false)

  const handleChange = (newValue: string) => {
    if (newValue === '__create__') {
      setFormOpen(true)
    } else {
      onChange(newValue)
    }
  }

  const handleCreate = async (data: CreateCategoryRequest) => {
    const newCategory = await onCreateCategory(data)
    onChange(newCategory.id)
    setFormOpen(false)
  }

  return (
    <>
      <FormControl sx={sx} fullWidth={fullWidth} size={size}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => handleChange(e.target.value)}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
          <MenuItem value="__create__" sx={{ color: 'primary.main', fontWeight: 500 }}>
            ＋ 新規作成...
          </MenuItem>
        </Select>
      </FormControl>

      <CategoryForm
        open={formOpen}
        type={type}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  )
}