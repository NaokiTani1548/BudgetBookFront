import axios from 'axios'
import type {
  RecurringExpense,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
} from '../types/recurringExpense'

const USER_ID = '11111111-1111-1111-1111-111111111111'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': USER_ID,
  },
})

export const recurringExpenseApi = {
  // 一覧取得（このAPIを叩くと未処理の定期支出が自動生成される）
  getAll: async (): Promise<RecurringExpense[]> => {
    const response = await api.get('/recurring-expenses')
    return response.data
  },

  getById: async (id: string): Promise<RecurringExpense> => {
    const response = await api.get(`/recurring-expenses/${id}`)
    return response.data
  },

  create: async (data: CreateRecurringExpenseRequest): Promise<RecurringExpense> => {
    const response = await api.post('/recurring-expenses', data)
    return response.data
  },

  update: async (id: string, data: UpdateRecurringExpenseRequest): Promise<RecurringExpense> => {
    const response = await api.put(`/recurring-expenses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recurring-expenses/${id}`)
  },
}