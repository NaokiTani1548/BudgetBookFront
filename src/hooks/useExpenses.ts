import { useState, useEffect, useCallback } from 'react'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import { expenseApi } from '../api/expenseApi'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await expenseApi.getAll()
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError('支出の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchExpensesByDateRange = useCallback(async (from: string, to: string) => {
    try {
      setLoading(true)
      const data = await expenseApi.getByDateRange(from, to)
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError('支出の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const createExpense = useCallback(async (data: CreateExpenseRequest) => {
    const newExpense = await expenseApi.create(data)
    setExpenses((prev) => [newExpense, ...prev])
    return newExpense
  }, [])

  const updateExpense = useCallback(async (id: string, data: UpdateExpenseRequest) => {
    const updated = await expenseApi.update(id, data)
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    await expenseApi.delete(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    fetchExpensesByDateRange,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}