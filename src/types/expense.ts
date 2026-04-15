export interface Expense {
  id: string
  amount: number
  expenseDate: string
  categoryId: string
  categoryName: string | null
  description: string | null
  paymentMethod: string
  memo: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseRequest {
  amount: number
  expenseDate: string
  categoryId: string
  description?: string
  paymentMethod?: string
  memo?: string
}

export interface UpdateExpenseRequest {
  amount: number
  expenseDate: string
  categoryId: string
  description?: string
  paymentMethod: string
  memo?: string
}

export interface Category {
  id: string
  name: string
  type: string
  color?: string
  sortOrder?: number
  isDefault?: boolean
}