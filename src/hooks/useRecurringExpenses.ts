import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recurringExpenseApi } from '../api/recurringExpenseApi'
import { queryKeys } from '../lib/queryClient'
import type {
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
} from '../types/recurringExpense'

export function useRecurringExpenses() {
  const queryClient = useQueryClient()

  const { data: recurringExpenses = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.recurringExpenses,
    queryFn: () => recurringExpenseApi.getAll(),
  })

  const invalidateRelated = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.recurringExpenses })
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.summary.currentBalance })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateRecurringExpenseRequest) => recurringExpenseApi.create(data),
    onSuccess: invalidateRelated,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringExpenseRequest }) =>
      recurringExpenseApi.update(id, data),
    onSuccess: invalidateRelated,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recurringExpenseApi.delete(id),
    onSuccess: invalidateRelated,
  })

  const createRecurringExpense = async (data: CreateRecurringExpenseRequest) => {
    return createMutation.mutateAsync(data)
  }

  const updateRecurringExpense = async (id: string, data: UpdateRecurringExpenseRequest) => {
    return updateMutation.mutateAsync({ id, data })
  }

  const deleteRecurringExpense = async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const item = recurringExpenses.find((r) => r.id === id)
    if (!item) return

    return updateMutation.mutateAsync({
      id,
      data: {
        amount: item.amount,
        billingDay: item.billingDay,
        startDate: item.startDate,
        endDate: item.endDate || undefined,
        categoryId: item.categoryId || undefined,
        description: item.description || undefined,
        paymentMethod: item.paymentMethod || undefined,
        memo: item.memo || undefined,
        isActive,
      },
    })
  }

  const activeRecurringExpenses = recurringExpenses.filter((r) => r.isActive)
  const inactiveRecurringExpenses = recurringExpenses.filter((r) => !r.isActive)

  return {
    recurringExpenses,
    activeRecurringExpenses,
    inactiveRecurringExpenses,
    loading,
    error: error ? '定期支出の取得に失敗しました' : null,
    fetchRecurringExpenses: invalidateRelated,
    createRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    toggleActive,
  }
}
