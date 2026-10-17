import client from './client'
import { config } from '../config'
import { mockIncomeApi } from './mockApi'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'
import type { PaginatedResponse, PaginationParams } from '../types/pagination'

const realApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Income>> => {
    const response = await client.get<PaginatedResponse<Income>>('/incomes', {
      params: { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
    })
    return response.data
  },

  getPlanned: async (): Promise<Income[]> => {
    const response = await client.get('/incomes/planned')
    return response.data
  },

  getByDateRange: async (from: string, to: string): Promise<Income[]> => {
    const response = await client.get('/incomes/date', {
      params: { from, to },
    })
    return response.data
  },

  getById: async (id: string): Promise<Income> => {
    const response = await client.get(`/incomes/${id}`)
    return response.data
  },

  create: async (data: CreateIncomeRequest): Promise<Income> => {
    const response = await client.post('/incomes', data)
    return response.data
  },

  update: async (id: string, data: UpdateIncomeRequest): Promise<Income> => {
    const response = await client.put(`/incomes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/incomes/${id}`)
  },
}

export const incomeApi = config.isMockMode ? mockIncomeApi : realApi
