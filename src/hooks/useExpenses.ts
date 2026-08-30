import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseApi } from '../api/expenseApi'
import { queryKeys } from '../lib/queryClient'
import type { CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

export function useExpenses() {
  const queryClient = useQueryClient()

  const { data: expenses = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.expenses.all,
    queryFn: () => expenseApi.getAll(),
  })

  const invalidateExpenseRelated = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.summary.currentBalance })
  }

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

  const createExpense = async (data: CreateExpenseRequest) => {
    return createMutation.mutateAsync(data)
  }

  const updateExpense = async (id: string, data: UpdateExpenseRequest) => {
    return updateMutation.mutateAsync({ id, data })
  }

  const deleteExpense = async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }

  return {
    expenses,
    loading,
    fetchExpenses: invalidateExpenseRelated,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
