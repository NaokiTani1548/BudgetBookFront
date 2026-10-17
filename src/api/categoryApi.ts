import client from './client'
import { config } from '../config'
import { mockCategoryApi } from './mockApi'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

const realApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await client.get('/categories')
    return response.data
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await client.post('/categories', data)
    return response.data
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await client.put(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/categories/${id}`)
  },
}

export const categoryApi = config.isMockMode ? mockCategoryApi : realApi
