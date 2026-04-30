import { useState, useEffect, useCallback } from 'react'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'
import { categoryApi } from '../api/categoryApi'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await categoryApi.getAll()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError('カテゴリの取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = useCallback(async (data: CreateCategoryRequest) => {
    const newCategory = await categoryApi.create(data)
    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }, [])

  const updateCategory = useCallback(async (id: string, data: UpdateCategoryRequest) => {
    const updated = await categoryApi.update(id, data)
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    await categoryApi.delete(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')
  const incomeCategories = categories.filter((c) => c.type === 'INCOME')

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}