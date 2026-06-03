import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import type { Category } from '../../types/category'

interface Props {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoryList({ categories, onEdit, onDelete }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // モバイル用カード表示
  if (isMobile) {
    if (categories.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">😢 カテゴリがありません</Typography>
        </Paper>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {categories.map((category) => (
          <Card
            key={category.id}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* カラーインジケーター */}
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: category.color || '#E86A33',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {category.name}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => onEdit(category)} sx={{ color: 'primary.main' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(category)} sx={{ color: 'error.main' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  // デスクトップ用テーブル表示
  const headerCellStyle = {
    backgroundColor: 'primary.main',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.875rem',
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>カラー</TableCell>
            <TableCell sx={headerCellStyle}>カテゴリ名</TableCell>
            <TableCell sx={headerCellStyle} align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">😢 カテゴリがありません</Typography>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category, index) => (
              <TableRow
                key={category.id}
                sx={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(232, 106, 51, 0.03)' }}
              >
                <TableCell>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: category.color || '#E86A33',
                    }}
                  />
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => onEdit(category)} sx={{ color: 'primary.main' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(category)} sx={{ color: 'error.main' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}