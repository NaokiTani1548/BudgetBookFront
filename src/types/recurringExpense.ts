export interface RecurringExpense {
  id: string
  amount: number
  billingDay: number
  startDate: string
  endDate: string | null
  categoryId: string
  categoryName: string | null
  description: string | null
  paymentMethod: string
  memo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRecurringExpenseRequest {
  amount: number
  billingDay: number
  startDate: string
  endDate?: string
  categoryId?: string
  description?: string
  paymentMethod?: string
  memo?: string
}

export interface UpdateRecurringExpenseRequest {
  amount: number
  billingDay: number
  startDate: string
  endDate?: string
  categoryId?: string
  description?: string
  paymentMethod?: string
  memo?: string
  isActive?: boolean
}