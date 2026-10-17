# KAKEKAKEI - BudgetBook Frontend
家計簿Webアプリのフロントエンド。React + TypeScript + MUI + Vite構成。

## セットアップ & 起動
```bash
npm install                   # 依存インストール
npm run dev:local             # ローカルバックエンド（localhost:8080）
npm run dev:production        # 本番バックエンド（onrender.com）
npm run dev:mock              # モックモード（バックエンド不要）
npm run build                 # 本番ビルド
```
| コマンド | API接続先 | 用途 |
|---------|----------|------|
| `npm run dev` | localhost:8080 | デフォルト |
| `npm run dev:local` | localhost:8080 | ローカルBE |
| `npm run dev:production` | onrender.com | 本番BE |
| `npm run dev:mock` | モック | BE不要 |

開発サーバーは `http://localhost:3000`。`/api` はViteプロキシ経由で転送（`vite.config.ts`）。

### 環境変数
| 変数 | 説明 | 例 |
|------|------|-----|
| `VITE_API_URL` | バックエンドURL | `http://localhost:8080` |
| `VITE_MOCK_MODE` | モック有効化 | `true` |

## 技術スタック
| 技術 | Ver | 用途 |
|------|-----|------|
| React | 19 | UI |
| TypeScript | 6 | 型安全 |
| Vite | 8 | ビルド |
| MUI | 9 | UIコンポーネント |
| React Router | 7 | ルーティング |
| TanStack Query | 5 | サーバー状態管理 |
| Axios | 1 | HTTP通信 |
| Chart.js | 4 | グラフ |
| dayjs | 1 | 日付操作 |

## ディレクトリ構成
```
src/
├── api/                      # APIクライアント（Axios）
│   ├── client.ts             #   共通Axiosインスタンス（認証ヘッダ自動付与・401ハンドリング）
│   ├── authApi.ts            #   認証（Google OAuth / モックログイン）
│   ├── expenseApi.ts         #   支出 CRUD + 検索
│   ├── incomeApi.ts          #   収入 CRUD
│   ├── categoryApi.ts        #   カテゴリ CRUD
│   ├── recurringExpenseApi.ts#   定期支出 CRUD
│   ├── summaryApi.ts         #   残高予測
│   └── ocrApi.ts             #   レシートOCR解析
├── components/               # 再利用コンポーネント
│   ├── common/               #   Loading, ConfirmDialog, Notification, ProtectedRoute, BalanceSummary
│   ├── expense/              #   ExpenseForm, ExpenseList, ExpenseEditDialog, ExpenseCreateDialog, ExpenseSearchBox
│   ├── income/               #   IncomeForm, IncomeList, IncomeEditDialog, IncomeCreateDialog
│   ├── category/             #   CategoryForm, CategoryList, CategorySelectWithCreate
│   ├── recurringExpense/     #   RecurringExpenseForm, RecurringExpenseList
│   ├── calendar/             #   MonthCalendar
│   ├── chart/                #   ExpenseByCategoryChart
│   └── ocr/                  #   OcrUploader, OcrResultList
├── pages/                    # ページ（各ルートに対応）
│   ├── LoginPage.tsx         #   /login
│   ├── AuthCallbackPage.tsx  #   /auth/callback
│   ├── CalendarPage.tsx      #   /calendar（ホーム）
│   ├── DayDetailPage.tsx     #   /day/:date
│   ├── ListPage.tsx          #   /list
│   ├── OcrPage.tsx           #   /ocr
│   ├── RecurringExpensePage.tsx # /recurring
│   ├── CategoryPage.tsx      #   /categories
│   └── StatisticsPage.tsx    #   /statistics
├── hooks/                    # カスタムフック
│   ├── useAuth.ts            #   認証コンテキスト取得
│   ├── useExpenses.ts        #   支出CRUD
│   ├── useIncomes.ts         #   収入CRUD
│   ├── useCategories.ts      #   カテゴリCRUD（type指定でフィルタ）
│   ├── useRecurringExpenses.ts #  定期支出CRUD
│   ├── useCurrentBalance.ts  #   現在残高取得
│   └── useNotification.ts    #   トースト通知状態管理
├── contexts/                 # Reactコンテキスト
│   ├── AuthContext.tsx       #   認証型定義
│   └── AuthProvider.tsx      #   認証Provider（localStorage永続化・JWT期限チェック）
├── types/                    # 型定義
│   ├── auth.ts               #   AuthUser, AuthResponse
│   ├── expense.ts            #   Expense, Create/UpdateExpenseRequest
│   ├── income.ts             #   Income, Create/UpdateIncomeRequest
│   ├── category.ts           #   Category, Create/UpdateCategoryRequest
│   ├── recurringExpense.ts   #   RecurringExpense, Create/UpdateRequest
│   └── summary.ts            #   ForecastSummary
├── utils/
│   ├── authUtils.ts          #   isTokenExpired(token)
│   └── dateUtils.ts          #   isPlanned(date), isActual(date), getToday()
├── lib/
│   └── queryClient.ts        #   React Query設定 & queryKeys定義
├── App.tsx                   #   ルーティング & ナビゲーション（Drawer）
├── main.tsx                  #   エントリーポイント
├── config.ts                 #   環境設定（apiUrl, isMockMode）
└── theme.ts                  #   MUIテーマ（カラー・フォント・コンポーネントスタイル）
```

## アーキテクチャ
```
┌──────────────────────────────────────────────────────────────┐
│ App.tsx                                                      │
│  QueryClientProvider > ThemeProvider > AuthProvider           │
│  > BrowserRouter > Navigation + Routes                       │
└──────────┬───────────────────────────────────────────────────┘
           │
  ┌────────┴────────┐
  │   Pages          │
  │  ┌────────────┐  │
  │  │ hooks      │──┼──→ React Query ──→ api/ ──→ Backend
  │  └─────┬──────┘  │      (キャッシュ)    (Axios)   (REST)
  │  ┌─────┴──────┐  │
  │  │ components │  │
  │  └────────────┘  │
  └──────────────────┘
```
**データフロー**: Page → Hook → React Query → API(Axios) → Backend REST API
**状態管理**: サーバー状態=React Query / 認証=Context+localStorage / UI=useState

## ルーティング
| パス | ページ | 認証 | 説明 |
|------|--------|------|------|
| `/login` | LoginPage | 不要 | Google OAuthログイン |
| `/auth/callback` | AuthCallbackPage | 不要 | OAuth認証コールバック |
| `/` | → `/calendar` | 要 | リダイレクト |
| `/calendar` | CalendarPage | 要 | 月間カレンダー（ホーム） |
| `/day/:date` | DayDetailPage | 要 | 日別詳細（収支登録・編集） |
| `/list` | ListPage | 要 | 収支リスト・検索 |
| `/ocr` | OcrPage | 要 | レシート画像読取 |
| `/recurring` | RecurringExpensePage | 要 | 定期支出管理 |
| `/categories` | CategoryPage | 要 | カテゴリ管理 |
| `/statistics` | StatisticsPage | 要 | 統計・グラフ |

## APIエンドポイント
### 支出 (`expenseApi.ts`)
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/expenses` | 全件 |
| GET | `/expenses/planned` | 予定のみ |
| GET | `/expenses/search?from&to&categoryId&keyword` | 検索 |
| GET | `/expenses/:id` | 1件 |
| POST | `/expenses` | 作成 |
| PUT | `/expenses/:id` | 更新 |
| DELETE | `/expenses/:id` | 削除 |

### 収入 (`incomeApi.ts`)
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/incomes` | 全件 |
| GET | `/incomes/planned` | 予定のみ |
| GET | `/incomes/date?from&to` | 期間取得 |
| POST | `/incomes` | 作成 |
| PUT | `/incomes/:id` | 更新 |
| DELETE | `/incomes/:id` | 削除 |

### カテゴリ (`categoryApi.ts`)
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/categories` | 全件 |
| POST | `/categories` | 作成 |
| PUT | `/categories/:id` | 更新 |
| DELETE | `/categories/:id` | 削除 |

### 定期支出 (`recurringExpenseApi.ts`)
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/recurring-expenses` | 全件 |
| POST | `/recurring-expenses` | 作成 |
| PUT | `/recurring-expenses/:id` | 更新 |
| DELETE | `/recurring-expenses/:id` | 削除 |

### サマリー / OCR / 認証
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/summary/forecast?targetDate` | 残高予測 |
| POST | `/ocr/analyze` | レシートOCR（multipart） |
| GET | `/auth/google/url` | Google認証URL取得 |
| GET | `/auth/google/callback?code&state` | 認証コールバック |

## 型定義
### Expense
```ts
Expense { id, amount, expenseDate, categoryId, categoryName?, description?, paymentMethod, memo?, createdAt, updatedAt }
CreateExpenseRequest { amount, expenseDate, categoryId, description?, paymentMethod?, memo? }
UpdateExpenseRequest { amount, expenseDate, categoryId, description?, paymentMethod, memo? }
```
### Income
```ts
Income { id, amount, incomeDate, categoryId, categoryName?, description?, memo?, createdAt, updatedAt }
CreateIncomeRequest { amount, incomeDate, categoryId, description?, memo? }
UpdateIncomeRequest { amount, incomeDate, categoryId, description?, memo? }
```
### Category
```ts
Category { id, name, type: 'EXPENSE'|'INCOME', color?, sortOrder?, isDefault? }
CreateCategoryRequest { name, type, color?, sortOrder? }
```
### RecurringExpense
```ts
RecurringExpense { id, amount, billingDay, startDate, endDate?, categoryId, categoryName?,
  description?, paymentMethod, memo?, isActive, createdAt, updatedAt }
```
### Summary / Auth
```ts
ForecastSummary { targetDate, currentBalance, plannedIncome, plannedExpense, forecastBalance }
AuthUser { userId, email, name }
AuthResponse { token, userId, email, name }
```

## コンポーネントProps早見表
### 共通
| コンポーネント | Props |
|-------------|-------|
| `Loading` | なし |
| `ConfirmDialog` | `open, title, message, onConfirm, onCancel` |
| `Notification` | `open, message, severity, onClose` |
| `ProtectedRoute` | `children` |
| `BalanceSummary` | `summary, loading?` |

### 支出
| コンポーネント | Props |
|-------------|-------|
| `ExpenseForm` | `categories, onSubmit, onCreateCategory, initialDate?` |
| `ExpenseList` | `expenses, onEdit(Expense), onDelete(id), showDate?` |
| `ExpenseEditDialog` | `open, expense, categories, onClose, onSubmit(id,data), onCreateCategory` |
| `ExpenseCreateDialog` | `open, categories, onClose, onSubmit, onCreateCategory` |
| `ExpenseSearchBox` | `categories, onSearch, onClear, isSearching, resultCount?` |

### 収入
| コンポーネント | Props |
|-------------|-------|
| `IncomeForm` | `categories, onSubmit, onCreateCategory, initialDate?` |
| `IncomeList` | `incomes, onEdit(Income), onDelete(id), showDate?` |
| `IncomeEditDialog` | `open, income, categories, onClose, onSubmit(id,data), onCreateCategory` |
| `IncomeCreateDialog` | `open, categories, onClose, onSubmit, onCreateCategory` |

### カテゴリ / カレンダー / チャート / OCR / 定期支出
| コンポーネント | Props |
|-------------|-------|
| `CategoryForm` | `open, category?, type?, onClose, onSubmit` |
| `CategoryList` | `categories, onEdit, onDelete` |
| `CategorySelectWithCreate` | `categories, value, onChange, onCreateCategory, type` |
| `MonthCalendar` | `currentMonth, expenses, incomes, onMonthChange, onDayClick` |
| `ExpenseByCategoryChart` | `expenses, title?` |
| `OcrUploader` | `onAnalyzeComplete(items)` |
| `OcrResultList` | `items, categories, onCreateCategory, onSubmit, onCancel, submitting` |
| `RecurringExpenseForm` | `categories, onSubmit, onCreateCategory` |
| `RecurringExpenseList` | `recurringExpenses, onEdit, onDelete, onToggleActive` |

## React Queryキー (`lib/queryClient.ts`)
```
categories(type?)     → ['categories'] | ['categories', type]
expenses.all          → ['expenses']
expenses.byDateRange  → ['expenses', 'dateRange', from, to]
expenses.planned      → ['expenses', 'planned']
expenses.search       → ['expenses', 'search', params]
incomes.all           → ['incomes']
incomes.byDateRange   → ['incomes', 'dateRange', from, to]
incomes.planned       → ['incomes', 'planned']
recurringExpenses     → ['recurringExpenses']
summary.forecast      → ['summary', 'forecast', date]
summary.currentBalance→ ['summary', 'currentBalance']
calendar              → ['calendar', month]
```
ミューテーション成功時は関連キーを`invalidateQueries`で無効化し再取得。

## テーマ (`theme.ts`)
| 項目 | 値 | 用途 |
|------|-----|------|
| Primary | `#5D9C59` 緑 | メイン |
| Secondary | `#F4A261` オレンジ | アクセント |
| Error | `#E57373` 赤 | エラー・支出 |
| Success | `#81C784` 緑 | 成功・収入 |
| Warning | `#FFB74D` オレンジ | 警告・予定 |
| Background | `#FFF8F0` クリーム | 背景 |
| Font | Noto Sans JP | 日本語 |

## タスク別 編集箇所ガイド
| やりたいこと | 編集ファイル |
|-------------|-------------|
| 新しいページ追加 | `pages/`に作成 → `App.tsx`にルート+メニュー追加 |
| APIエンドポイント追加 | `api/`にメソッド → `types/`に型 → `lib/queryClient.ts`にキー |
| フォーム項目追加 | `components/*/Form.tsx` + `types/*.ts` |
| 一覧の表示変更 | `components/*/List.tsx` |
| カラー・フォント変更 | `theme.ts` |
| 認証フロー変更 | `api/authApi.ts` + `contexts/AuthProvider.tsx` |
| グラフ追加 | `components/chart/` or `pages/StatisticsPage.tsx` |
| キャッシュ戦略変更 | `lib/queryClient.ts` |
| プロキシ・ポート変更 | `vite.config.ts` |
