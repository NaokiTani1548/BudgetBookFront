import { useState, useEffect, useCallback } from 'react'
import { expenseApi } from '../api/expenseApi'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await expenseApi.getAll()
      setExpenses(data)
    } catch (error) {
      console.error('支出の取得に失敗しました', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const createExpense = async (data: CreateExpenseRequest) => {
    const newExpense = await expenseApi.create(data)
    setExpenses((prev) => [newExpense, ...prev])
    return newExpense
  }

  const updateExpense = async (id: string, data: UpdateExpenseRequest) => {
    const updated = await expenseApi.update(id, data)
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }

  const deleteExpense = async (id: string) => {
    await expenseApi.delete(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}