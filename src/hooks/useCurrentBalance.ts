import { useQuery, useQueryClient } from '@tanstack/react-query'
import { summaryApi } from '../api/summaryApi'
import { queryKeys } from '../lib/queryClient'

export function useCurrentBalance() {
  const queryClient = useQueryClient()

  const { data: summary = null, isLoading: loading, error } = useQuery({
    queryKey: queryKeys.summary.currentBalance,
    queryFn: () => summaryApi.getCurrentBalance(),
  })

  return {
    summary,
    loading,
    error: error ? '残高の取得に失敗しました' : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.summary.currentBalance }),
  }
}
