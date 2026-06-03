import { useState, useEffect, useCallback } from 'react'
import { categoryApi } from '../api/categoryApi'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

export function useCategories(type?: 'EXPENSE' | 'INCOME') {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await categoryApi.getAll()
      // typeが指定されている場合はフィルタリング
      const filtered = type ? data.filter((c) => c.type === type) : data
      setCategories(filtered)
    } catch (error) {
      console.error('カテゴリの取得に失敗しました', error)
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
    const newCategory = await categoryApi.create(data)
    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }

  const updateCategory = async (id: string, data: UpdateCategoryRequest) => {
    const updated = await categoryApi.update(id, data)
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  const deleteCategory = async (id: string) => {
    await categoryApi.delete(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}