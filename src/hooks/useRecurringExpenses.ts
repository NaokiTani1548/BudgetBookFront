import { useState, useEffect, useCallback } from 'react'
import type {
  RecurringExpense,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
} from '../types/recurringExpense'
import { recurringExpenseApi } from '../api/recurringExpenseApi'

export function useRecurringExpenses() {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recurringExpenseApi.getAll()
      setRecurringExpenses(data)
      setError(null)
    } catch (err) {
      setError('定期支出の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecurringExpenses()
  }, [fetchRecurringExpenses])

  const createRecurringExpense = useCallback(async (data: CreateRecurringExpenseRequest) => {
    const newItem = await recurringExpenseApi.create(data)
    setRecurringExpenses((prev) => [newItem, ...prev])
    return newItem
  }, [])

  const updateRecurringExpense = useCallback(async (id: string, data: UpdateRecurringExpenseRequest) => {
    const updated = await recurringExpenseApi.update(id, data)
    setRecurringExpenses((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }, [])

  const deleteRecurringExpense = useCallback(async (id: string) => {
    await recurringExpenseApi.delete(id)
    setRecurringExpenses((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    const item = recurringExpenses.find((r) => r.id === id)
    if (!item) return

    const updated = await recurringExpenseApi.update(id, {
      amount: item.amount,
      billingDay: item.billingDay,
      startDate: item.startDate,
      endDate: item.endDate || undefined,
      categoryId: item.categoryId || undefined,
      description: item.description || undefined,
      paymentMethod: item.paymentMethod || undefined,
      memo: item.memo || undefined,
      isActive,
    })
    setRecurringExpenses((prev) => prev.map((r) => (r.id === id ? updated : r)))
    return updated
  }, [recurringExpenses])

  const activeRecurringExpenses = recurringExpenses.filter((r) => r.isActive)
  const inactiveRecurringExpenses = recurringExpenses.filter((r) => !r.isActive)

  return {
    recurringExpenses,
    activeRecurringExpenses,
    inactiveRecurringExpenses,
    loading,
    error,
    fetchRecurringExpenses,
    createRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    toggleActive,
  }
}