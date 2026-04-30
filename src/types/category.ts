export interface Category {
  id: string
  name: string
  type: 'EXPENSE' | 'INCOME'
  color?: string
  sortOrder?: number
  isDefault?: boolean
}

export interface CreateCategoryRequest {
  name: string
  type: 'EXPENSE' | 'INCOME'
  color?: string
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  name: string
  type: 'EXPENSE' | 'INCOME'
  color?: string
  sortOrder?: number
}