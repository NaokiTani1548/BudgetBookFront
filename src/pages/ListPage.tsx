import { useState } from 'react'
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useExpenses } from '../hooks/useExpenses'
import { useIncomes } from '../hooks/useIncomes'
import { useCategories } from '../hooks/useCategories'
import { useNotification } from '../hooks/useNotification'
import { useCurrentBalance } from '../hooks/useCurrentBalance'
import { expenseApi, type ExpenseSearchParams } from '../api/expenseApi'
import ExpenseList from '../components/expense/ExpenseList'
import ExpenseCreateDialog from '../components/expense/ExpenseCreateDialog'
import ExpenseEditDialog from '../components/expense/ExpenseEditDialog'
import ExpenseSearchBox from '../components/expense/ExpenseSearchBox'
import IncomeList from '../components/income/IncomeList'
import IncomeCreateDialog from '../components/income/IncomeCreateDialog'
import IncomeEditDialog from '../components/income/IncomeEditDialog'
import BalanceSummary from '../components/common/BalanceSummary'
import Notification from '../components/common/Notification'
import Loading from '../components/common/Loading'
import ConfirmDialog from '../components/common/ConfirmDialog'
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '../types/income'

export default function ListPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { expenses, loading: expenseLoading, totalCount: expenseTotalCount, hasMore: hasMoreExpenses, loadMore: loadMoreExpenses, createExpense, updateExpense, deleteExpense } = useExpenses()
  const { incomes, loading: incomeLoading, totalCount: incomeTotalCount, hasMore: hasMoreIncomes, loadMore: loadMoreIncomes, createIncome, updateIncome, deleteIncome } = useIncomes()
  const { categories: expenseCategories, createCategory: createExpenseCategory } = useCategories('EXPENSE')
  const { categories: incomeCategories, createCategory: createIncomeCategory } = useCategories('INCOME')
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const { summary, loading: balanceLoading, refetch: refetchBalance } = useCurrentBalance()

  const [tabIndex, setTabIndex] = useState(0)
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false)
  const [createIncomeOpen, setCreateIncomeOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'expense' | 'income'; id: string; description: string } | null>(null)

  // 検索関連
  const [searchResults, setSearchResults] = useState<Expense[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // 表示する支出（検索結果 or 通常一覧）
  const displayedExpenses = searchResults !== null ? searchResults : expenses

  // 支出検索
  const handleSearch = async (params: ExpenseSearchParams) => {
    setSearchLoading(true)
    try {
      const results = await expenseApi.search(params)
      setSearchResults(results)
      setIsSearching(true)
    } catch {
      showError('検索に失敗しました')
    } finally {
      setSearchLoading(false)
    }
  }

  // 検索クリア
  const handleSearchClear = () => {
    setSearchResults(null)
    setIsSearching(false)
  }

  // 支出作成
  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    try {
      await createExpense(data)
      showSuccess('支出を追加しました')
      refetchBalance()
      // 検索中なら検索結果をリフレッシュ
      if (isSearching) {
        handleSearchClear()
      }
    } catch {
      showError('支出の追加に失敗しました')
    }
  }

  // 支出更新
  const handleUpdateExpense = async (id: string, data: UpdateExpenseRequest) => {
    try {
      await updateExpense(id, data)
      showSuccess('支出を更新しました')
      setEditingExpense(null)
      refetchBalance()
      if (isSearching) {
        handleSearchClear()
      }
    } catch {
      showError('支出の更新に失敗しました')
    }
  }

  // 収入作成
  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    try {
      await createIncome(data)
      showSuccess('収入を追加しました')
      refetchBalance()
    } catch {
      showError('収入の追加に失敗しました')
    }
  }

  // 収入更新
  const handleUpdateIncome = async (id: string, data: UpdateIncomeRequest) => {
    try {
      await updateIncome(id, data)
      showSuccess('収入を更新しました')
      setEditingIncome(null)
      refetchBalance()
    } catch {
      showError('収入の更新に失敗しました')
    }
  }

  // 削除
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'expense') {
        await deleteExpense(deleteTarget.id)
        if (isSearching) {
          setSearchResults((prev) => prev ? prev.filter((e) => e.id !== deleteTarget.id) : null)
        }
      } else {
        await deleteIncome(deleteTarget.id)
      }
      showSuccess(`${deleteTarget.type === 'expense' ? '支出' : '収入'}を削除しました`)
      setDeleteTarget(null)
      refetchBalance()
    } catch {
      showError('削除に失敗しました')
    }
  }

  const handleDeleteExpense = (id: string) => {
    const allExpenses = searchResults !== null ? searchResults : expenses
    const target = allExpenses.find((e) => e.id === id)
    if (target) {
      setDeleteTarget({ type: 'expense', id, description: target.description || '' })
    }
  }

  const handleDeleteIncome = (id: string) => {
    const target = incomes.find((i) => i.id === id)
    if (target) {
      setDeleteTarget({ type: 'income', id, description: target.description || '' })
    }
  }

  if (expenseLoading || incomeLoading) return <Loading />

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          📋 収支一覧
        </Typography>
        <Typography variant="body2" color="text.secondary">
          収入と支出を管理します
        </Typography>
      </Box>

      {/* 現在の総資産 */}
      <BalanceSummary summary={summary} loading={balanceLoading} />

      {/* タブ + 新規作成ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => {
            setTabIndex(v)
            // タブ切り替え時に検索をクリア
            if (v !== 0) handleSearchClear()
          }}
          sx={{
            '& .MuiTab-root': {
              minWidth: { xs: 0, sm: 120 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 1, sm: 3 },
            },
          }}
        >
          <Tab label={`💸 支出 (${isSearching ? displayedExpenses.length : expenseTotalCount})`} />
          <Tab label={`💰 収入 (${incomeTotalCount})`} />
        </Tabs>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => tabIndex === 0 ? setCreateExpenseOpen(true) : setCreateIncomeOpen(true)}
          sx={{ whiteSpace: 'nowrap', borderRadius: 3 }}
          size={isMobile ? 'small' : 'medium'}
        >
          {isMobile ? '追加' : tabIndex === 0 ? '支出を追加' : '収入を追加'}
        </Button>
      </Box>

      {/* 支出タブ */}
      {tabIndex === 0 && (
        <>
          {/* 検索ボックス */}
          <ExpenseSearchBox
            categories={expenseCategories}
            onSearch={handleSearch}
            onClear={handleSearchClear}
            isSearching={isSearching}
            resultCount={searchResults?.length}
          />

          {searchLoading ? (
            <Loading />
          ) : (
            <>
              <ExpenseList
                expenses={displayedExpenses}
                onEdit={setEditingExpense}
                onDelete={handleDeleteExpense}
              />
              {!isSearching && hasMoreExpenses && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button onClick={loadMoreExpenses} variant="outlined" sx={{ borderRadius: 3 }}>
                    もっと読み込む（{expenses.length} / {expenseTotalCount}件）
                  </Button>
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* 収入タブ */}
      {tabIndex === 1 && (
        <>
          <IncomeList
            incomes={incomes}
            onEdit={setEditingIncome}
            onDelete={handleDeleteIncome}
          />
          {hasMoreIncomes && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button onClick={loadMoreIncomes} variant="outlined" sx={{ borderRadius: 3 }}>
                もっと読み込む（{incomes.length} / {incomeTotalCount}件）
              </Button>
            </Box>
          )}
        </>
      )}

      {/* 支出作成モーダル */}
      <ExpenseCreateDialog
        open={createExpenseOpen}
        categories={expenseCategories}
        onClose={() => setCreateExpenseOpen(false)}
        onSubmit={handleCreateExpense}
        onCreateCategory={createExpenseCategory}
      />

      {/* 収入作成モーダル */}
      <IncomeCreateDialog
        open={createIncomeOpen}
        categories={incomeCategories}
        onClose={() => setCreateIncomeOpen(false)}
        onSubmit={handleCreateIncome}
        onCreateCategory={createIncomeCategory}
      />

      {/* 支出編集ダイアログ */}
      <ExpenseEditDialog
        open={!!editingExpense}
        expense={editingExpense}
        categories={expenseCategories}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
        onCreateCategory={createExpenseCategory}
      />

      {/* 収入編集ダイアログ */}
      <IncomeEditDialog
        open={!!editingIncome}
        income={editingIncome}
        categories={incomeCategories}
        onClose={() => setEditingIncome(null)}
        onSubmit={handleUpdateIncome}
        onCreateCategory={createIncomeCategory}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`${deleteTarget?.type === 'expense' ? '支出' : '収入'}の削除`}
        message={`「${deleteTarget?.description || ''}」を削除しますか？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 通知 */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Container>
  )
}