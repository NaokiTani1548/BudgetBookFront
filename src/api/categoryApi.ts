import axios from 'axios'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

const USER_ID = '11111111-1111-1111-1111-111111111111'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': USER_ID,
  },
})

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories')
    return response.data
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', data)
    return response.data
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}