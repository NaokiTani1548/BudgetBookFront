import axios from 'axios'
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

const USER_ID = '11111111-1111-1111-1111-111111111111'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000, // 5秒タイムアウト
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': USER_ID,
  },
})

export const expenseApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses')
    return response.data
  },

  getPlanned: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses/planned')
    return response.data
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`)
    return response.data
  },

  getByDateRange: async (from: string, to: string): Promise<Expense[]> => {
    const response = await api.get('/expenses/date', {
      params: { from, to },
    })
    return response.data
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await api.post('/expenses', data)
    return response.data
  },

  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`)
  },
}
