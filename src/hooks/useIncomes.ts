import { useState, useEffect, useCallback } from 'react'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'
import { incomeApi } from '../api/incomeApi'

export function useIncomes() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await incomeApi.getAll()
      setIncomes(data)
      setError(null)
    } catch (err) {
      setError('収入の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchIncomesByDateRange = useCallback(async (from: string, to: string) => {
    try {
      setLoading(true)
      const data = await incomeApi.getByDateRange(from, to)
      setIncomes(data)
      setError(null)
    } catch (err) {
      setError('収入の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const createIncome = useCallback(async (data: CreateIncomeRequest) => {
    const newIncome = await incomeApi.create(data)
    setIncomes((prev) => [newIncome, ...prev])
    return newIncome
  }, [])

  const updateIncome = useCallback(async (id: string, data: UpdateIncomeRequest) => {
    const updated = await incomeApi.update(id, data)
    setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)))
    return updated
  }, [])

  const deleteIncome = useCallback(async (id: string) => {
    await incomeApi.delete(id)
    setIncomes((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return {
    incomes,
    loading,
    error,
    fetchIncomes,
    fetchIncomesByDateRange,
    createIncome,
    updateIncome,
    deleteIncome,
  }
}