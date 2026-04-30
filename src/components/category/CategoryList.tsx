import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Typography,
  Box,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import type { Category } from '../../types/category'

interface Props {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoryList({ categories, onEdit, onDelete }: Props) {
  return (
    <Paper sx={{ p: 2 }}>
      {categories.length === 0 ? (
        <Typography color="text.secondary" align="center">
          カテゴリがありません
        </Typography>
      ) : (
        <List>
          {categories.map((category) => (
            <ListItem key={category.id} divider>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: category.color || '#ccc',
                  mr: 2,
                }}
              />
              <ListItemText
                primary={category.name}
                secondary={
                  <Chip
                    label={category.type === 'EXPENSE' ? '支出' : '収入'}
                    size="small"
                    color={category.type === 'EXPENSE' ? 'error' : 'success'}
                    sx={{ mt: 0.5 }}
                  />
                }
              />
              <ListItemSecondaryAction>
                {!category.isDefault && (
                  <>
                    <IconButton edge="end" onClick={() => onEdit(category)} sx={{ mr: 1 }}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" onClick={() => onDelete(category)} color="error">
                      <Delete />
                    </IconButton>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}