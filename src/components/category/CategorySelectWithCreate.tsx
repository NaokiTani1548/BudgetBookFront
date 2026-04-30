import { useState } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategoryForm from './CategoryForm'

interface Props {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
  type: 'EXPENSE' | 'INCOME'
  label?: string
  fullWidth?: boolean
  sx?: object
}

export default function CategorySelectWithCreate({
  categories,
  value,
  onChange,
  onCreateCategory,
  type,
  label = 'カテゴリ',
  fullWidth = false,
  sx,
}: Props) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleChange = (selectedValue: string) => {
    if (selectedValue === '__create__') {
      setCreateDialogOpen(true)
    } else {
      onChange(selectedValue)
    }
  }

  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    const newCategory = await onCreateCategory({ ...data, type })
    onChange(newCategory.id)
    setCreateDialogOpen(false)
  }

  return (
    <>
      <FormControl fullWidth={fullWidth} sx={sx}>
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
          <MenuItem value="__create__" sx={{ color: 'primary.main' }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Add color="primary" />
            </ListItemIcon>
            <ListItemText primary="新規作成..." />
          </MenuItem>
        </Select>
      </FormControl>

      <CategoryForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateCategory}
      />
    </>
  )
}