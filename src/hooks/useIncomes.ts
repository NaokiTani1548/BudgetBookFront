import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { incomeApi } from '../api/incomeApi'
import { queryKeys } from '../lib/queryClient'
import type { CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

export function useIncomes() {
  const queryClient = useQueryClient()

  const { data: incomes = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.incomes.all,
    queryFn: () => incomeApi.getAll(),
  })

  const invalidateIncomeRelated = () => {
    queryClient.invalidateQueries({ queryKey: ['incomes'] })
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.summary.currentBalance })
  }

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

  const createExpense = async (data: CreateIncomeRequest) => {
    return createMutation.mutateAsync(data)
  }

  const updateIncome = async (id: string, data: UpdateIncomeRequest) => {
    return updateMutation.mutateAsync({ id, data })
  }

  const deleteIncome = async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }

  return {
    incomes,
    loading,
    error: error ? '収入の取得に失敗しました' : null,
    fetchIncomes: invalidateIncomeRelated,
    fetchIncomesByDateRange: invalidateIncomeRelated,
    createIncome: createExpense,
    updateIncome,
    deleteIncome,
  }
}
