import dayjs from 'dayjs'
import type { Category } from '../types/category'
import type { Expense } from '../types/expense'
import type { Income } from '../types/income'
import type { RecurringExpense } from '../types/recurringExpense'

// --- Categories ---
export const mockCategories: Category[] = [
  { id: 'cat-e1', name: '食費', type: 'EXPENSE', color: '#F44336', sortOrder: 1 },
  { id: 'cat-e2', name: '交通費', type: 'EXPENSE', color: '#2196F3', sortOrder: 2 },
  { id: 'cat-e3', name: '住居費', type: 'EXPENSE', color: '#FF9800', sortOrder: 3 },
  { id: 'cat-e4', name: '光熱費', type: 'EXPENSE', color: '#9C27B0', sortOrder: 4 },
  { id: 'cat-e5', name: '日用品', type: 'EXPENSE', color: '#4CAF50', sortOrder: 5 },
  { id: 'cat-e6', name: '娯楽', type: 'EXPENSE', color: '#E91E63', sortOrder: 6 },
  { id: 'cat-e7', name: '通信費', type: 'EXPENSE', color: '#00BCD4', sortOrder: 7 },
  { id: 'cat-e8', name: '医療費', type: 'EXPENSE', color: '#673AB7', sortOrder: 8 },
  { id: 'cat-e9', name: '投資', type: 'EXPENSE', color: '#3F51B5', sortOrder: 9 },
  { id: 'cat-i1', name: '給与', type: 'INCOME', color: '#4CAF50', sortOrder: 1 },
  { id: 'cat-i2', name: '副業', type: 'INCOME', color: '#2196F3', sortOrder: 2 },
  { id: 'cat-i3', name: '投資収益', type: 'INCOME', color: '#FF9800', sortOrder: 3 },
]

// --- Expenses (6 months of data) ---
const now = dayjs()

function generateExpenses(): Expense[] {
  const items: Expense[] = []
  const descriptions: Record<string, string[]> = {
    'cat-e1': ['スーパー', 'コンビニ', 'ランチ', '外食', 'カフェ'],
    'cat-e2': ['電車', 'バス', 'タクシー', 'ガソリン'],
    'cat-e3': ['家賃'],
    'cat-e4': ['電気代', 'ガス代', '水道代'],
    'cat-e5': ['ドラッグストア', 'ティッシュ', '洗剤'],
    'cat-e6': ['映画', 'ゲーム', '書籍', 'サブスク'],
    'cat-e7': ['携帯代', 'インターネット'],
    'cat-e8': ['病院', '薬局'],
    'cat-e9': ['つみたてNISA', '個別株'],
  }
  const amounts: Record<string, [number, number]> = {
    'cat-e1': [300, 5000],
    'cat-e2': [200, 2000],
    'cat-e3': [80000, 80000],
    'cat-e4': [3000, 12000],
    'cat-e5': [200, 3000],
    'cat-e6': [500, 5000],
    'cat-e7': [3000, 8000],
    'cat-e8': [1000, 10000],
    'cat-e9': [10000, 50000],
  }

  let id = 1
  for (let m = 5; m >= 0; m--) {
    const month = now.subtract(m, 'month')
    // 食費: 8-12件/月
    for (let d = 0; d < 10; d++) {
      const cat = mockCategories.find((c) => c.id === 'cat-e1')!
      const day = Math.min(1 + Math.floor(Math.random() * 28), 28)
      const date = month.date(day).format('YYYY-MM-DD')
      const descs = descriptions['cat-e1']
      items.push({
        id: `exp-${id++}`,
        amount: Math.round((amounts['cat-e1'][0] + Math.random() * (amounts['cat-e1'][1] - amounts['cat-e1'][0])) / 10) * 10,
        expenseDate: date,
        categoryId: cat.id,
        categoryName: cat.name,
        description: descs[Math.floor(Math.random() * descs.length)],
        paymentMethod: Math.random() > 0.5 ? 'CASH' : 'CREDIT_CARD',
        memo: null,
        createdAt: date,
        updatedAt: date,
      })
    }
    // 他カテゴリ: 1-3件/月
    for (const catId of ['cat-e2', 'cat-e3', 'cat-e4', 'cat-e5', 'cat-e6', 'cat-e7', 'cat-e8', 'cat-e9']) {
      const count = catId === 'cat-e3' ? 1 : 1 + Math.floor(Math.random() * 3)
      const cat = mockCategories.find((c) => c.id === catId)!
      const [minAmt, maxAmt] = amounts[catId]
      const descs = descriptions[catId]
      for (let d = 0; d < count; d++) {
        const day = Math.min(1 + Math.floor(Math.random() * 28), 28)
        const date = month.date(day).format('YYYY-MM-DD')
        items.push({
          id: `exp-${id++}`,
          amount: Math.round((minAmt + Math.random() * (maxAmt - minAmt)) / 100) * 100,
          expenseDate: date,
          categoryId: cat.id,
          categoryName: cat.name,
          description: descs[Math.floor(Math.random() * descs.length)],
          paymentMethod: Math.random() > 0.4 ? 'CREDIT_CARD' : 'CASH',
          memo: null,
          createdAt: date,
          updatedAt: date,
        })
      }
    }
  }

  // 予定（未来）
  const nextMonth = now.add(1, 'month')
  items.push({
    id: `exp-${id++}`,
    amount: 80000,
    expenseDate: nextMonth.date(25).format('YYYY-MM-DD'),
    categoryId: 'cat-e3',
    categoryName: '住居費',
    description: '家賃',
    paymentMethod: 'CREDIT_CARD',
    memo: null,
    createdAt: now.format('YYYY-MM-DD'),
    updatedAt: now.format('YYYY-MM-DD'),
  })

  return items.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
}

// --- Incomes ---
function generateIncomes(): Income[] {
  const items: Income[] = []
  let id = 1
  for (let m = 5; m >= 0; m--) {
    const month = now.subtract(m, 'month')
    // 給与
    items.push({
      id: `inc-${id++}`,
      amount: 350000,
      incomeDate: month.date(25).format('YYYY-MM-DD'),
      categoryId: 'cat-i1',
      categoryName: '給与',
      description: '月給',
      memo: null,
      createdAt: month.format('YYYY-MM-DD'),
      updatedAt: month.format('YYYY-MM-DD'),
    })
    // 副業（隔月）
    if (m % 2 === 0) {
      items.push({
        id: `inc-${id++}`,
        amount: 30000 + Math.floor(Math.random() * 20000),
        incomeDate: month.date(15).format('YYYY-MM-DD'),
        categoryId: 'cat-i2',
        categoryName: '副業',
        description: 'フリーランス案件',
        memo: null,
        createdAt: month.format('YYYY-MM-DD'),
        updatedAt: month.format('YYYY-MM-DD'),
      })
    }
  }
  // 予定収入
  items.push({
    id: `inc-${id++}`,
    amount: 350000,
    incomeDate: now.add(1, 'month').date(25).format('YYYY-MM-DD'),
    categoryId: 'cat-i1',
    categoryName: '給与',
    description: '月給',
    memo: null,
    createdAt: now.format('YYYY-MM-DD'),
    updatedAt: now.format('YYYY-MM-DD'),
  })
  return items.sort((a, b) => b.incomeDate.localeCompare(a.incomeDate))
}

// --- Recurring Expenses ---
export const mockRecurringExpenses: RecurringExpense[] = [
  {
    id: 'rec-1', amount: 80000, billingDay: 25,
    startDate: '2024-04-01', endDate: null,
    categoryId: 'cat-e3', categoryName: '住居費',
    description: '家賃', paymentMethod: 'CREDIT_CARD', memo: null,
    isActive: true, createdAt: '2024-04-01', updatedAt: '2024-04-01',
  },
  {
    id: 'rec-2', amount: 3500, billingDay: 10,
    startDate: '2024-01-01', endDate: null,
    categoryId: 'cat-e7', categoryName: '通信費',
    description: '携帯代', paymentMethod: 'CREDIT_CARD', memo: null,
    isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  },
  {
    id: 'rec-3', amount: 5000, billingDay: 1,
    startDate: '2024-06-01', endDate: null,
    categoryId: 'cat-e7', categoryName: '通信費',
    description: 'インターネット', paymentMethod: 'CREDIT_CARD', memo: null,
    isActive: true, createdAt: '2024-06-01', updatedAt: '2024-06-01',
  },
  {
    id: 'rec-4', amount: 1500, billingDay: 1,
    startDate: '2025-01-01', endDate: '2025-12-31',
    categoryId: 'cat-e6', categoryName: '娯楽',
    description: '動画サブスク', paymentMethod: 'CREDIT_CARD', memo: null,
    isActive: true, createdAt: '2025-01-01', updatedAt: '2025-01-01',
  },
  {
    id: 'rec-5', amount: 2000, billingDay: 15,
    startDate: '2024-01-01', endDate: '2025-06-30',
    categoryId: 'cat-e6', categoryName: '娯楽',
    description: 'ジム会費', paymentMethod: 'CASH', memo: null,
    isActive: false, createdAt: '2024-01-01', updatedAt: '2025-07-01',
  },
]

// Generate once and reuse
export let mockExpenses: Expense[] = generateExpenses()
export let mockIncomes: Income[] = generateIncomes()

let nextExpenseId = mockExpenses.length + 1
let nextIncomeId = mockIncomes.length + 1
let nextCategoryId = mockCategories.length + 1
let nextRecurringId = mockRecurringExpenses.length + 1

export function getNextExpenseId() { return `exp-${nextExpenseId++}` }
export function getNextIncomeId() { return `inc-${nextIncomeId++}` }
export function getNextCategoryId() { return `cat-${nextCategoryId++}` }
export function getNextRecurringId() { return `rec-${nextRecurringId++}` }
