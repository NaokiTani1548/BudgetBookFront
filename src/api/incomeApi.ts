import client from './client'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

export const incomeApi = {
  getAll: async (): Promise<Income[]> => {
    const response = await client.get('/incomes')
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