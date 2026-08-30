import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
})

export const queryKeys = {
  categories: (type?: 'EXPENSE' | 'INCOME') =>
    type ? ['categories', type] as const : ['categories'] as const,
  expenses: {
    all: ['expenses'] as const,
    byDateRange: (from: string, to: string) => ['expenses', 'dateRange', from, to] as const,
    planned: ['expenses', 'planned'] as const,
    search: (params: Record<string, string>) => ['expenses', 'search', params] as const,
  },
  incomes: {
    all: ['incomes'] as const,
    byDateRange: (from: string, to: string) => ['incomes', 'dateRange', from, to] as const,
    planned: ['incomes', 'planned'] as const,
  },
  recurringExpenses: ['recurringExpenses'] as const,
  summary: {
    forecast: (date: string) => ['summary', 'forecast', date] as const,
    currentBalance: ['summary', 'currentBalance'] as const,
  },
  calendar: (month: string) => ['calendar', month] as const,
} as const
