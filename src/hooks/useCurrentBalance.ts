import { useState, useEffect, useCallback } from 'react'
import { summaryApi } from '../api/summaryApi'
import type { ForecastSummary } from '../types/summary'

export function useCurrentBalance() {
  const [summary, setSummary] = useState<ForecastSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      const data = await summaryApi.getCurrentBalance()
      setSummary(data)
      setError(null)
    } catch (err) {
      setError('残高の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    summary,
    loading,
    error,
    refetch: fetchBalance,
  }
}