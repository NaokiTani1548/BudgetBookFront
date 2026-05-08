import axios from 'axios'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

const USER_ID = '11111111-1111-1111-1111-111111111111'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': USER_ID,
  },
})

export const incomeApi = {
  getAll: async (): Promise<Income[]> => {
    const response = await api.get('/incomes')
    return response.data
  },

  getPlanned: async (): Promise<Income[]> => {
    const response = await api.get('/incomes/planned')
    return response.data
  },

  getById: async (id: string): Promise<Income> => {
    const response = await api.get(`/incomes/${id}`)
    return response.data
  },

  getByDateRange: async (from: string, to: string): Promise<Income[]> => {
    const response = await api.get('/incomes/date', {
      params: { from, to },
    })
    return response.data
  },

  create: async (data: CreateIncomeRequest): Promise<Income> => {
    const response = await api.post('/incomes', data)
    return response.data
  },

  update: async (id: string, data: UpdateIncomeRequest): Promise<Income> => {
    const response = await api.put(`/incomes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/incomes/${id}`)
  },
}