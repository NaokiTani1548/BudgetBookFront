import client from './client'
import { config } from '../config'
import { mockRecurringExpenseApi } from './mockApi'
import type {
  RecurringExpense,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
} from '../types/recurringExpense'

const realApi = {
  getAll: async (): Promise<RecurringExpense[]> => {
    const response = await client.get('/recurring-expenses')
    return response.data
  },

  getById: async (id: string): Promise<RecurringExpense> => {
    const response = await client.get(`/recurring-expenses/${id}`)
    return response.data
  },

  create: async (data: CreateRecurringExpenseRequest): Promise<RecurringExpense> => {
    const response = await client.post('/recurring-expenses', data)
    return response.data
  },

  update: async (id: string, data: UpdateRecurringExpenseRequest): Promise<RecurringExpense> => {
    const response = await client.put(`/recurring-expenses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/recurring-expenses/${id}`)
  },
}

export const recurringExpenseApi = config.isMockMode ? mockRecurringExpenseApi : realApi
