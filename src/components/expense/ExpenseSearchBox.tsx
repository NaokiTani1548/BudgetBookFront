import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Search, FilterList, Close } from '@mui/icons-material'
import type { Category } from '../../types/category'
import type { ExpenseSearchParams } from '../../api/expenseApi'

interface Props {
  categories: Category[]
  onSearch: (params: ExpenseSearchParams) => void
  onClear: () => void
  isSearching: boolean
  resultCount?: number
}

export default function ExpenseSearchBox({
  categories,
  onSearch,
  onClear,
  isSearching,
  resultCount,
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [keyword, setKeyword] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch({ keyword, from, to, categoryId })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setKeyword('')
    setFrom('')
    setTo('')
    setCategoryId('')
    setShowFilters(false)
    onClear()
  }

  const hasActiveFilters = from || to || categoryId

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        🔍 支出を検索
      </Typography>

      {/* キーワード検索 */}
      <Box sx={{ display: 'flex', gap: 1, mb: showFilters ? 2 : 0 }}>
        <TextField
          placeholder="キーワードで検索（例: ランチ、コンビニ）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: { xs: 44, sm: 80 }, whiteSpace: 'nowrap', px: { xs: 1, sm: 2 } }}
        >
          {isMobile ? <Search /> : '検索'}
        </Button>
        <IconButton
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            color: hasActiveFilters ? 'primary.main' : 'text.secondary',
          }}
        >
          <FilterList />
        </IconButton>
      </Box>

      {/* 詳細フィルター */}
      <Collapse in={showFilters}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap: 1.5,
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            label="開始日"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="終了日"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={categoryId}
              label="カテゴリ"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">すべて</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Collapse>

      {/* 検索中の表示 */}
      {isSearching && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`検索結果: ${resultCount}件`}
            color="primary"
            size="small"
          />
          {keyword && (
            <Chip label={`キーワード: ${keyword}`} size="small" variant="outlined" />
          )}
          {from && (
            <Chip label={`開始: ${from}`} size="small" variant="outlined" />
          )}
          {to && (
            <Chip label={`終了: ${to}`} size="small" variant="outlined" />
          )}
          {categoryId && (
            <Chip
              label={`カテゴリ: ${categories.find((c) => c.id === categoryId)?.name || ''}`}
              size="small"
              variant="outlined"
            />
          )}
          <Button
            size="small"
            startIcon={<Close />}
            onClick={handleClear}
            sx={{ ml: 'auto' }}
          >
            クリア
          </Button>
        </Box>
      )}
    </Paper>
  )
}