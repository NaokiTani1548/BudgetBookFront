import client from './client'
import { config } from '../config'
import { mockExpenseApi } from './mockApi'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import type { PaginatedResponse, PaginationParams } from '../types/pagination'

export interface ExpenseSearchParams {
  from?: string
  to?: string
  categoryId?: string
  keyword?: string
}

const realApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Expense>> => {
    const response = await client.get<PaginatedResponse<Expense>>('/expenses', {
      params: { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
    })
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

export const expenseApi = config.isMockMode ? mockExpenseApi : realApi
