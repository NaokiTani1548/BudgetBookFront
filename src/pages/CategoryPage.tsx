import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useCategories } from '../hooks/useCategories'
import CategoryList from '../components/category/CategoryList'
import CategoryForm from '../components/category/CategoryForm'
import Loading from '../components/common/Loading'
import Notification from '../components/common/Notification'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { useNotification } from '../hooks/useNotification'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

export default function CategoryPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [tab, setTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const {
    categories: expenseCategories,
    loading: expenseLoading,
    createCategory: createExpenseCategory,
    updateCategory: updateExpenseCategory,
    deleteCategory: deleteExpenseCategory,
  } = useCategories('EXPENSE')
  const {
    categories: incomeCategories,
    loading: incomeLoading,
    createCategory: createIncomeCategory,
    updateCategory: updateIncomeCategory,
    deleteCategory: deleteIncomeCategory,
  } = useCategories('INCOME')

  const { notification, showNotification, hideNotification } = useNotification()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const categories = tab === 'EXPENSE' ? expenseCategories : incomeCategories
  const createCategory = tab === 'EXPENSE' ? createExpenseCategory : createIncomeCategory
  const updateCategory = tab === 'EXPENSE' ? updateExpenseCategory : updateIncomeCategory
  const deleteCategory = tab === 'EXPENSE' ? deleteExpenseCategory : deleteIncomeCategory

  const handleCreate = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      await createCategory(data as CreateCategoryRequest)
      showNotification('カテゴリを作成しました', 'success')
      setFormOpen(false)
    } catch {
      showNotification('作成に失敗しました', 'error')
    }
  }

  const handleUpdate = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    if (!editTarget) return
    try {
      await updateCategory(editTarget.id, data as UpdateCategoryRequest)
      showNotification('カテゴリを更新しました', 'success')
      setEditTarget(null)
    } catch {
      showNotification('更新に失敗しました', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget.id)
      showNotification('カテゴリを削除しました', 'success')
      setDeleteTarget(null)
    } catch {
      showNotification('削除に失敗しました', 'error')
    }
  }

  if (expenseLoading || incomeLoading) return <Loading />

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* ヘッダー */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h1"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            🏷️ カテゴリ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            収支のカテゴリを管理します
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setFormOpen(true)}
          sx={{ whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          追加
        </Button>
      </Box>

      {/* タブ */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            minWidth: { xs: 0, sm: 120 },
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1, sm: 3 },
          },
        }}
      >
        <Tab label="💸 支出" value="EXPENSE" />
        <Tab label="💰 収入" value="INCOME" />
      </Tabs>

      {/* リスト */}
      <CategoryList
        categories={categories}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      {/* 新規作成ダイアログ */}
      <CategoryForm
        open={formOpen}
        type={tab}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      {/* 編集ダイアログ */}
      <CategoryForm
        open={!!editTarget}
        category={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="カテゴリの削除"
        message={`「${deleteTarget?.name || ''}」を削除しますか？このカテゴリに紐づく収支データは残りますが、カテゴリ名が「未分類」になります。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 通知 */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Container>
  )
}