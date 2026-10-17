import dayjs from 'dayjs'
import {
  mockCategories,
  mockExpenses,
  mockIncomes,
  mockRecurringExpenses,
  getNextExpenseId,
  getNextIncomeId,
  getNextCategoryId,
  getNextRecurringId,
} from './mockData'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'
import type { PaginatedResponse, PaginationParams } from '../types/pagination'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'
import type {
  RecurringExpense,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
} from '../types/recurringExpense'
import type { ForecastSummary } from '../types/summary'
import type { ExpenseSearchParams } from './expenseApi'
import type { OcrResponse } from './ocrApi'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))
const now = () => dayjs().format('YYYY-MM-DD')

// --- Expense ---
export const mockExpenseApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Expense>> => {
    await delay()
    const limit = params?.limit ?? 20
    const offset = params?.offset ?? 0
    return {
      items: mockExpenses.slice(offset, offset + limit),
      totalCount: mockExpenses.length,
      limit,
      offset,
    }
  },
  getPlanned: async (): Promise<Expense[]> => {
    await delay()
    return mockExpenses.filter((e) => e.expenseDate > now())
  },
  getByDateRange: async (from: string, to: string): Promise<Expense[]> => {
    await delay()
    return mockExpenses.filter((e) => e.expenseDate >= from && e.expenseDate <= to)
  },
  search: async (params: ExpenseSearchParams): Promise<Expense[]> => {
    await delay()
    return mockExpenses.filter((e) => {
      if (params.from && e.expenseDate < params.from) return false
      if (params.to && e.expenseDate > params.to) return false
      if (params.categoryId && e.categoryId !== params.categoryId) return false
      if (params.keyword && !(e.description || '').includes(params.keyword)) return false
      return true
    })
  },
  getById: async (id: string): Promise<Expense> => {
    await delay()
    const e = mockExpenses.find((e) => e.id === id)
    if (!e) throw new Error('Not found')
    return e
  },
  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    await delay()
    const cat = mockCategories.find((c) => c.id === data.categoryId)
    const expense: Expense = {
      id: getNextExpenseId(),
      amount: data.amount,
      expenseDate: data.expenseDate,
      categoryId: data.categoryId,
      categoryName: cat?.name ?? null,
      description: data.description ?? null,
      paymentMethod: data.paymentMethod ?? 'CASH',
      memo: data.memo ?? null,
      createdAt: now(),
      updatedAt: now(),
    }
    mockExpenses.unshift(expense)
    return expense
  },
  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    await delay()
    const idx = mockExpenses.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Not found')
    const cat = mockCategories.find((c) => c.id === data.categoryId)
    mockExpenses[idx] = {
      ...mockExpenses[idx],
      ...data,
      categoryName: cat?.name ?? null,
      description: data.description ?? null,
      memo: data.memo ?? null,
      updatedAt: now(),
    }
    return mockExpenses[idx]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const idx = mockExpenses.findIndex((e) => e.id === id)
    if (idx !== -1) mockExpenses.splice(idx, 1)
  },
}

// --- Income ---
export const mockIncomeApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Income>> => {
    await delay()
    const limit = params?.limit ?? 20
    const offset = params?.offset ?? 0
    return {
      items: mockIncomes.slice(offset, offset + limit),
      totalCount: mockIncomes.length,
      limit,
      offset,
    }
  },
  getPlanned: async (): Promise<Income[]> => {
    await delay()
    return mockIncomes.filter((i) => i.incomeDate > now())
  },
  getByDateRange: async (from: string, to: string): Promise<Income[]> => {
    await delay()
    return mockIncomes.filter((i) => i.incomeDate >= from && i.incomeDate <= to)
  },
  getById: async (id: string): Promise<Income> => {
    await delay()
    const i = mockIncomes.find((i) => i.id === id)
    if (!i) throw new Error('Not found')
    return i
  },
  create: async (data: CreateIncomeRequest): Promise<Income> => {
    await delay()
    const cat = mockCategories.find((c) => c.id === data.categoryId)
    const income: Income = {
      id: getNextIncomeId(),
      amount: data.amount,
      incomeDate: data.incomeDate,
      categoryId: data.categoryId,
      categoryName: cat?.name ?? null,
      description: data.description ?? null,
      memo: data.memo ?? null,
      createdAt: now(),
      updatedAt: now(),
    }
    mockIncomes.unshift(income)
    return income
  },
  update: async (id: string, data: UpdateIncomeRequest): Promise<Income> => {
    await delay()
    const idx = mockIncomes.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Not found')
    const cat = mockCategories.find((c) => c.id === data.categoryId)
    mockIncomes[idx] = {
      ...mockIncomes[idx],
      ...data,
      categoryName: cat?.name ?? null,
      description: data.description ?? null,
      memo: data.memo ?? null,
      updatedAt: now(),
    }
    return mockIncomes[idx]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const idx = mockIncomes.findIndex((i) => i.id === id)
    if (idx !== -1) mockIncomes.splice(idx, 1)
  },
}

// --- Category ---
export const mockCategoryApi = {
  getAll: async (): Promise<Category[]> => {
    await delay()
    return [...mockCategories]
  },
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    await delay()
    const cat: Category = {
      id: getNextCategoryId(),
      name: data.name,
      type: data.type,
      color: data.color,
      sortOrder: data.sortOrder,
    }
    mockCategories.push(cat)
    return cat
  },
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    await delay()
    const idx = mockCategories.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Not found')
    mockCategories[idx] = { ...mockCategories[idx], ...data }
    return mockCategories[idx]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const idx = mockCategories.findIndex((c) => c.id === id)
    if (idx !== -1) mockCategories.splice(idx, 1)
  },
}

// --- Recurring Expense ---
export const mockRecurringExpenseApi = {
  getAll: async (): Promise<RecurringExpense[]> => {
    await delay()
    return [...mockRecurringExpenses]
  },
  getById: async (id: string): Promise<RecurringExpense> => {
    await delay()
    const r = mockRecurringExpenses.find((r) => r.id === id)
    if (!r) throw new Error('Not found')
    return r
  },
  create: async (data: CreateRecurringExpenseRequest): Promise<RecurringExpense> => {
    await delay()
    const cat = mockCategories.find((c) => c.id === data.categoryId)
    const rec: RecurringExpense = {
      id: getNextRecurringId(),
      amount: data.amount,
      billingDay: data.billingDay,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      categoryId: data.categoryId ?? '',
      categoryName: cat?.name ?? null,
      description: data.description ?? null,
      paymentMethod: data.paymentMethod ?? 'CASH',
      memo: data.memo ?? null,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    }
    mockRecurringExpenses.push(rec)
    return rec
  },
  update: async (id: string, data: UpdateRecurringExpenseRequest): Promise<RecurringExpense> => {
    await delay()
    const idx = mockRecurringExpenses.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Not found')
    const cat = data.categoryId ? mockCategories.find((c) => c.id === data.categoryId) : null
    mockRecurringExpenses[idx] = {
      ...mockRecurringExpenses[idx],
      ...data,
      endDate: data.endDate ?? mockRecurringExpenses[idx].endDate,
      categoryName: cat?.name ?? mockRecurringExpenses[idx].categoryName,
      description: data.description ?? mockRecurringExpenses[idx].description,
      memo: data.memo ?? mockRecurringExpenses[idx].memo,
      updatedAt: now(),
    }
    return mockRecurringExpenses[idx]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const idx = mockRecurringExpenses.findIndex((r) => r.id === id)
    if (idx !== -1) mockRecurringExpenses.splice(idx, 1)
  },
}

// --- Summary ---
export const mockSummaryApi = {
  getForecast: async (targetDate: string): Promise<ForecastSummary> => {
    await delay()
    const today = now()
    const totalIncome = mockIncomes
      .filter((i) => i.incomeDate <= targetDate)
      .reduce((s, i) => s + i.amount, 0)
    const totalExpense = mockExpenses
      .filter((e) => e.expenseDate <= targetDate)
      .reduce((s, e) => s + e.amount, 0)
    const plannedIncome = mockIncomes
      .filter((i) => i.incomeDate > today && i.incomeDate <= targetDate)
      .reduce((s, i) => s + i.amount, 0)
    const plannedExpense = mockExpenses
      .filter((e) => e.expenseDate > today && e.expenseDate <= targetDate)
      .reduce((s, e) => s + e.amount, 0)
    return {
      targetDate,
      currentBalance: totalIncome - totalExpense,
      plannedIncome,
      plannedExpense,
      forecastBalance: totalIncome - totalExpense,
    }
  },
  getCurrentBalance: async (): Promise<ForecastSummary> => {
    return mockSummaryApi.getForecast(now())
  },
}

// --- OCR ---
export const mockOcrApi = {
  analyze: async (_image: File): Promise<OcrResponse> => {
    await delay(500)
    return {
      items: [
        { description: 'コーヒー', amount: 450, expenseDate: now(), paymentMethod: 'CASH' },
        { description: 'サンドイッチ', amount: 380, expenseDate: now(), paymentMethod: 'CASH' },
      ],
    }
  },
}
