import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Close, Save, Edit } from '@mui/icons-material'
import type { OcrItem } from '../../api/ocrApi'
import type { Category, CreateCategoryRequest } from '../../types/category'
import CategorySelectWithCreate from '../category/CategorySelectWithCreate'

export interface OcrItemWithMeta extends OcrItem {
  id: string
  checked: boolean
  categoryId: string
  isEditing: boolean
}

interface Props {
  items: OcrItem[]
  categories: Category[]
  onCreateCategory: (data: CreateCategoryRequest) => Promise<Category>
  onSubmit: (items: OcrItemWithMeta[]) => void
  onCancel: () => void
  submitting: boolean
}

export default function OcrResultList({
  items,
  categories,
  onCreateCategory,
  onSubmit,
  onCancel,
  submitting,
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // 各アイテムにID・チェック状態・カテゴリを追加
  const [ocrItems, setOcrItems] = useState<OcrItemWithMeta[]>(() =>
    items.map((item, index) => ({
      ...item,
      id: `ocr-${index}-${Date.now()}`,
      checked: true,
      categoryId: categories.length > 0 ? categories[0].id : '',
      isEditing: false,
    }))
  )

  const handleToggle = (id: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const handleToggleAll = (checked: boolean) => {
    setOcrItems((prev) => prev.map((item) => ({ ...item, checked })))
  }

  const handleChangeDescription = (id: string, value: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description: value } : item
      )
    )
  }

  const handleChangeAmount = (id: string, value: number) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: value } : item
      )
    )
  }

  const handleChangeDate = (id: string, value: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, expenseDate: value } : item
      )
    )
  }

  const handleChangePaymentMethod = (id: string, value: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, paymentMethod: value } : item
      )
    )
  }

  const handleChangeCategoryId = (id: string, value: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, categoryId: value } : item
      )
    )
  }

  const handleToggleEdit = (id: string) => {
    setOcrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEditing: !item.isEditing } : item
      )
    )
  }

  const handleSubmit = () => {
    const checkedItems = ocrItems.filter((item) => item.checked && item.categoryId)
    onSubmit(checkedItems)
  }

  const checkedCount = ocrItems.filter((item) => item.checked).length
  const allChecked = ocrItems.length > 0 && checkedCount === ocrItems.length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          📝 読み取り結果（{ocrItems.length}件）
        </Typography>
        <IconButton onClick={onCancel} size="small">
          <Close />
        </IconButton>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        内容を確認し、カテゴリを選択してください。チェックした項目のみ登録されます。
      </Alert>

      {/* 全選択 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Checkbox
          checked={allChecked}
          indeterminate={checkedCount > 0 && !allChecked}
          onChange={(e) => handleToggleAll(e.target.checked)}
        />
        <Typography variant="body2" color="text.secondary">
          すべて選択
        </Typography>
      </Box>

      {/* アイテムリスト */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ocrItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: item.checked ? 'primary.light' : 'divider',
              backgroundColor: item.checked ? 'rgba(232, 106, 51, 0.03)' : 'transparent',
              opacity: item.checked ? 1 : 0.6,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Checkbox
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                sx={{ mt: -0.5 }}
              />
              <Box sx={{ flex: 1 }}>
                {item.isEditing ? (
                  // 編集モード
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      label="説明"
                      value={item.description}
                      onChange={(e) => handleChangeDescription(item.id, e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="金額"
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleChangeAmount(item.id, Number(e.target.value))}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="日付"
                      type="date"
                      value={item.expenseDate}
                      onChange={(e) => handleChangeDate(item.id, e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel>支払方法</InputLabel>
                      <Select
                        value={item.paymentMethod}
                        label="支払方法"
                        onChange={(e) => handleChangePaymentMethod(item.id, e.target.value)}
                      >
                        <MenuItem value="CASH">現金</MenuItem>
                        <MenuItem value="CREDIT_CARD">クレカ</MenuItem>
                      </Select>
                    </FormControl>
                    <CategorySelectWithCreate
                      categories={categories}
                      value={item.categoryId}
                      onChange={(value) => handleChangeCategoryId(item.id, value)}
                      onCreateCategory={onCreateCategory}
                      type="EXPENSE"
                      size="small"
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={() => handleToggleEdit(item.id)}
                        startIcon={<Save />}
                      >
                        完了
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // 表示モード
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.expenseDate} ・ {item.paymentMethod === 'CASH' ? '現金' : 'クレカ'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
                          {formatCurrency(item.amount)}
                        </Typography>
                        <IconButton size="small" onClick={() => handleToggleEdit(item.id)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {/* カテゴリ選択（常に表示） */}
                    <CategorySelectWithCreate
                      categories={categories}
                      value={item.categoryId}
                      onChange={(value) => handleChangeCategoryId(item.id, value)}
                      onCreateCategory={onCreateCategory}
                      type="EXPENSE"
                      size="small"
                      fullWidth
                      label="カテゴリを選択"
                    />
                  </>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* 登録ボタン */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button variant="outlined" onClick={onCancel} fullWidth={isMobile}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={checkedCount === 0 || submitting}
          fullWidth={isMobile}
        >
          {submitting ? '登録中...' : `${checkedCount}件を登録`}
        </Button>
      </Box>
    </Paper>
  )
}