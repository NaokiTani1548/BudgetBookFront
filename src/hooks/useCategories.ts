import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '../api/categoryApi'
import { queryKeys } from '../lib/queryClient'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

export function useCategories(type?: 'EXPENSE' | 'INCOME') {
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: async () => {
      const data = await categoryApi.getAll()
      return type ? data.filter((c) => c.type === type) : data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const createCategory = async (data: CreateCategoryRequest) => {
    return createMutation.mutateAsync(data)
  }

  const updateCategory = async (id: string, data: UpdateCategoryRequest) => {
    return updateMutation.mutateAsync({ id, data })
  }

  const deleteCategory = async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }

  return {
    categories,
    loading,
    fetchCategories: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
