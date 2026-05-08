export interface Income {
  id: string
  amount: number
  incomeDate: string
  categoryId: string
  categoryName: string | null
  description: string | null
  memo: string | null
  isPlanned: boolean
  plannedDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateIncomeRequest {
  amount: number
  incomeDate: string
  categoryId: string
  description?: string
  memo?: string
  isPlanned?: boolean
  plannedDate?: string
}

export interface UpdateIncomeRequest {
  amount: number
  incomeDate: string
  categoryId: string
  description?: string
  memo?: string
  isPlanned?: boolean
  plannedDate?: string
}