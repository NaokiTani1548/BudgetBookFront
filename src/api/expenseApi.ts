import client from './client'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

export interface ExpenseSearchParams {
  from?: string
  to?: string
  categoryId?: string
  keyword?: string
}

export const expenseApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await client.get<Expense[]>('/expenses')
    return response.data
  },

  getPlanned: async (): Promise<Expense[]> => {
    const response = await client.get<Expense[]>('/expenses/planned')
    return response.data
  },

  getByDateRange: async (from: string, to: string): Promise<Expense[]> => {
    const response = await client.get<Expense[]>('/expenses/search', {
      params: { from, to },
    })
    return response.data
  },

  search: async (params: ExpenseSearchParams): Promise<Expense[]> => {
    // 空文字のパラメータを除外
    const cleanParams: Record<string, string> = {}
    if (params.from) cleanParams.from = params.from
    if (params.to) cleanParams.to = params.to
    if (params.categoryId) cleanParams.categoryId = params.categoryId
    if (params.keyword) cleanParams.keyword = params.keyword

    const response = await client.get<Expense[]>('/expenses/search', {
      params: cleanParams,
    })
    return response.data
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await client.get<Expense>(`/expenses/${id}`)
    return response.data
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await client.post<Expense>('/expenses', data)
    return response.data
  },

  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await client.put<Expense>(`/expenses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/expenses/${id}`)
  },
}