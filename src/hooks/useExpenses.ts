import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseApi } from '../api/expenseApi'
import { queryKeys } from '../lib/queryClient'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

const PAGE_SIZE = 20

export function useExpenses() {
  const queryClient = useQueryClient()
  const [offset, setOffset] = useState(0)
  const [accumulated, setAccumulated] = useState<Expense[]>([])

  const { data, isLoading: loading } = useQuery({
    queryKey: [...queryKeys.expenses.all, offset],
    queryFn: () => expenseApi.getAll({ limit: PAGE_SIZE, offset }),
  })

  useEffect(() => {
    if (!data) return
    if (data.offset === 0) {
      setAccumulated(data.items)
    } else {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((e) => e.id))
        const newItems = data.items.filter((e) => !ids.has(e.id))
        return [...prev, ...newItems]
      })
    }
  }, [data])

  const totalCount = data?.totalCount ?? accumulated.length
  const hasMore = accumulated.length < totalCount

  const loadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE)
  }, [])

  const invalidateExpenseRelated = useCallback(() => {
    setOffset(0)
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.summary.currentBalance })
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => expenseApi.create(data),
    onSuccess: invalidateExpenseRelated,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      expenseApi.update(id, data),
    onSuccess: invalidateExpenseRelated,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: invalidateExpenseRelated,
  })

  return {
    expenses: accumulated,
    loading,
    totalCount,
    hasMore,
    loadMore,
    fetchExpenses: invalidateExpenseRelated,
    createExpense: (data: CreateExpenseRequest) => createMutation.mutateAsync(data),
    updateExpense: (id: string, data: UpdateExpenseRequest) => updateMutation.mutateAsync({ id, data }),
    deleteExpense: (id: string) => deleteMutation.mutateAsync(id),
  }
}
