import client from './client'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

export const expenseApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await client.get('/expenses')
    return response.data
  },

  getPlanned: async (): Promise<Expense[]> => {
    const response = await client.get('/expenses/planned')
    return response.data
  },

  getByDateRange: async (from: string, to: string): Promise<Expense[]> => {
    const response = await client.get('/expenses/date', {
      params: { from, to },
    })
    return response.data
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await client.get(`/expenses/${id}`)
    return response.data
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await client.post('/expenses', data)
    return response.data
  },

  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await client.put(`/expenses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/expenses/${id}`)
  },
}