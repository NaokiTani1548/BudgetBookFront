import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { incomeApi } from '../api/incomeApi'
import { queryKeys } from '../lib/queryClient'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

const PAGE_SIZE = 20

export function useIncomes() {
  const queryClient = useQueryClient()
  const [offset, setOffset] = useState(0)
  const [accumulated, setAccumulated] = useState<Income[]>([])

  const { data, isLoading: loading, error } = useQuery({
    queryKey: [...queryKeys.incomes.all, offset],
    queryFn: () => incomeApi.getAll({ limit: PAGE_SIZE, offset }),
  })

  useEffect(() => {
    if (!data) return
    if (data.offset === 0) {
      setAccumulated(data.items)
    } else {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        const newItems = data.items.filter((i) => !ids.has(i.id))
        return [...prev, ...newItems]
      })
    }
  }, [data])

  const totalCount = data?.totalCount ?? accumulated.length
  const hasMore = accumulated.length < totalCount

  const loadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE)
  }, [])

  const invalidateIncomeRelated = useCallback(() => {
    setOffset(0)
    queryClient.invalidateQueries({ queryKey: ['incomes'] })
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.summary.currentBalance })
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: (data: CreateIncomeRequest) => incomeApi.create(data),
    onSuccess: invalidateIncomeRelated,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeRequest }) =>
      incomeApi.update(id, data),
    onSuccess: invalidateIncomeRelated,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: invalidateIncomeRelated,
  })

  return {
    incomes: accumulated,
    loading,
    totalCount,
    hasMore,
    loadMore,
    error: error ? '収入の取得に失敗しました' : null,
    fetchIncomes: invalidateIncomeRelated,
    createIncome: (data: CreateIncomeRequest) => createMutation.mutateAsync(data),
    updateIncome: (id: string, data: UpdateIncomeRequest) => updateMutation.mutateAsync({ id, data }),
    deleteIncome: (id: string) => deleteMutation.mutateAsync(id),
  }
}
