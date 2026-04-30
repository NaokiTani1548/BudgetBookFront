import { useState } from 'react'
import { Container, Typography, Button, Box, Tabs, Tab } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import CategoryList from '../components/category/CategoryList'
import CategoryForm from '../components/category/CategoryForm'
import Notification from '../components/common/Notification'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Loading from '../components/common/Loading'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

export default function CategoryPage() {
  const {
    expenseCategories,
    incomeCategories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  const [tabIndex, setTabIndex] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const handleCreate = async (data: CreateCategoryRequest) => {
    try {
      await createCategory(data)
      showSuccess('カテゴリを追加しました')
      setFormOpen(false)
    } catch {
      showError('カテゴリの追加に失敗しました')
    }
  }

  const handleUpdate = async (data: UpdateCategoryRequest) => {
    if (!editingCategory) return
    try {
      await updateCategory(editingCategory.id, data)
      showSuccess('カテゴリを更新しました')
      setEditingCategory(null)
    } catch {
      showError('カテゴリの更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget.id)
      showSuccess('カテゴリを削除しました')
      setDeleteTarget(null)
    } catch {
      showError('カテゴリの削除に失敗しました')
    }
  }

  if (loading) return <Loading />

  const currentCategories = tabIndex === 0 ? expenseCategories : incomeCategories

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🏷️ カテゴリ管理
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
          新規作成
        </Button>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label={`支出カテゴリ (${expenseCategories.length})`} />
        <Tab label={`収入カテゴリ (${incomeCategories.length})`} />
      </Tabs>

      <CategoryList
        categories={currentCategories}
        onEdit={setEditingCategory}
        onDelete={setDeleteTarget}
      />

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <CategoryForm
        open={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="カテゴリの削除"
        message={`カテゴリ「${deleteTarget?.name}」を削除しますか？このカテゴリを使用している支出・収入は「未分類」になります。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {notification && (
        <Notification
          open={true}
          message={notification.message}
          severity={notification.severity}
          onClose={clearNotification}
        />
      )}
    </Container>
  )
}