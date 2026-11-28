# KAKEKAKEI - BudgetBook Frontend
家計簿Webアプリのフロントエンド。React + TypeScript + MUI + Vite構成。

## セットアップ & 起動
```bash
npm install                   # 依存インストール
npm run dev                   # ローカルバックエンド（localhost:8080）
npm run dev:mock              # モックモード（バックエンド不要）
npm run build                 # 本番ビルド（tsc -b && vite build）
npm run lint                  # ESLint
npm run preview               # ビルド成果物のプレビュー
```
| コマンド | API接続先 | 用途 |
|---------|----------|------|
| `npm run dev` | localhost:8080（Viteプロキシ） | ローカルBE |
| `npm run dev:mock` | モック（`.env.mock`） | BE不要 |
| `npm run build` | `.env.production` の `VITE_API_URL` | 本番ビルド |

開発サーバーは `http://localhost:3000`。`VITE_API_URL` 未設定時は `/api` をViteプロキシ経由で `localhost:8080` に転送（`vite.config.ts`）。

### 環境変数
| 変数 | 説明 | 例 |
|------|------|-----|
| `VITE_API_URL` | バックエンドURL | `http://localhost:8080` |
| `VITE_MOCK_MODE` | モック有効化 | `true` |

| ファイル | 内容 |
|---------|------|
| `.env.mock` | `VITE_MOCK_MODE=true`（`--mode mock`で読込） |
| `.env.production` | 本番バックエンドの `VITE_API_URL` |

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
│   ├── ocrApi.ts             #   レシートOCR解析
│   ├── mailApi.ts            #   Microsoft連携・カード利用通知メール読取
│   ├── mockApi.ts            #   モックモード用API実装（各APIを差し替え）
│   └── mockData.ts           #   モックデータ
├── components/               # 再利用コンポーネント
│   ├── common/               #   Loading, ConfirmDialog, Notification, ProtectedRoute, BalanceSummary
│   ├── expense/              #   ExpenseForm, ExpenseList, ExpenseEditDialog, ExpenseCreateDialog, ExpenseSearchBox
│   ├── income/               #   IncomeForm, IncomeList, IncomeEditDialog, IncomeCreateDialog
│   ├── category/             #   CategoryForm, CategoryList, CategorySelectWithCreate
│   ├── recurringExpense/     #   RecurringExpenseForm, RecurringExpenseList
│   ├── calendar/             #   MonthCalendar
│   ├── chart/                #   ExpenseByCategoryChart
│   ├── ocr/                  #   OcrUploader, OcrResultList（メール読取でも共用）
│   └── mail/                 #   MicrosoftLinkButton
├── pages/                    # ページ（各ルートに対応）
│   ├── LoginPage.tsx         #   /login
│   ├── AuthCallbackPage.tsx  #   /auth/callback
│   ├── CalendarPage.tsx      #   /calendar（ホーム）
│   ├── DayDetailPage.tsx     #   /day/:date
│   ├── ListPage.tsx          #   /list
│   ├── OcrPage.tsx           #   /ocr
│   ├── MailPage.tsx          #   /mail
│   ├── MicrosoftCallbackPage.tsx # /microsoft/callback
│   ├── RecurringExpensePage.tsx # /recurring
│   ├── CategoryPage.tsx      #   /categories
│   └── StatisticsPage.tsx    #   /statistics
├── hooks/                    # カスタムフック
│   ├── useAuth.ts            #   認証コンテキスト取得
│   ├── useExpenses.ts        #   支出CRUD（ページング: loadMore/hasMore）
│   ├── useIncomes.ts         #   収入CRUD（ページング: loadMore/hasMore）
│   ├── useCategories.ts      #   カテゴリCRUD（type指定でフィルタ）
│   ├── useRecurringExpenses.ts #  定期支出CRUD
│   ├── useCurrentBalance.ts  #   現在残高取得
│   └── useNotification.ts    #   トースト通知状態管理
├── contexts/                 # Reactコンテキスト
│   ├── AuthContext.tsx       #   認証型定義
│   └── AuthProvider.tsx      #   認証Provider（localStorage永続化・JWT期限チェック）
├── types/                    # 型定義
│   ├── auth.ts               #   AuthUser, AuthResponse, GoogleAuthUrlResponse
│   ├── expense.ts            #   Expense, Create/UpdateExpenseRequest
│   ├── income.ts             #   Income, Create/UpdateIncomeRequest
│   ├── category.ts           #   Category, Create/UpdateCategoryRequest
│   ├── recurringExpense.ts   #   RecurringExpense, Create/UpdateRequest
│   ├── summary.ts            #   ForecastSummary
│   └── pagination.ts         #   PaginatedResponse<T>, PaginationParams
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
**モックモード**: 各 `api/*Api.ts` は `config.isMockMode` で `realApi` と `mockApi.ts` の実装を切替。

## ルーティング
| パス | ページ | 認証 | 説明 |
|------|--------|------|------|
| `/login` | LoginPage | 不要 | Google OAuthログイン |
| `/auth/callback` | AuthCallbackPage | 不要 | OAuth認証コールバック |
| `/microsoft/callback` | MicrosoftCallbackPage | 不要 | Microsoft連携コールバック（`?status&reason`） |
| `/` | → `/calendar` | 要 | リダイレクト |
| `/calendar` | CalendarPage | 要 | 月間カレンダー（ホーム） |
| `/day/:date` | DayDetailPage | 要 | 日別詳細（収支登録・編集） |
| `/list` | ListPage | 要 | 収支リスト・検索 |
| `/ocr` | OcrPage | 要 | レシート画像読取 |
| `/mail` | MailPage | 要 | カード利用通知メールから支出取込 |
| `/recurring` | RecurringExpensePage | 要 | 定期支出管理 |
| `/categories` | CategoryPage | 要 | カテゴリ管理 |
| `/statistics` | StatisticsPage | 要 | 統計・グラフ・投資額・総資産 |
| `*` | → `/calendar` | - | 未定義パスはリダイレクト |

## 主な機能
| 機能 | 内容 |
|------|------|
| カレンダー | 月間の収支表示、日付クリックで日別詳細へ |
| 収支リスト | 支出・収入一覧（20件ずつ追加読込）、支出検索（期間・カテゴリ・キーワード） |
| レシート読取 | 画像をOCR解析し、支出候補を確認・編集して一括登録 |
| メール読取 | Microsoft連携後、三井住友カードご利用通知メールから期間指定（最大366日）で支出候補を取得。同日・同額の登録済み支出を重複候補として表示 |
| 定期支出 | 毎月の請求日指定で定期支出を管理、有効/無効切替 |
| 統計 | 月別収入・支出、収支差額、資産残高推移、投資額（元金）の推移、カテゴリ別支出推移・割合、定期支出一覧、総資産（残高＋投資元金） |

> 投資額は支出カテゴリ名が `投資`（完全一致）のものを全期間・今日までの実績で集計（`StatisticsPage.tsx` の `INVESTMENT_CATEGORY_NAME`）。評価損益は含まない。

## APIエンドポイント
### 支出 (`expenseApi.ts`)
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/expenses?limit&offset` | 一覧（ページング、既定 limit=20） |
| GET | `/expenses/planned` | 予定のみ |
| GET | `/expenses/search?from&to&categoryId&keyword` | 検索 |
| GET | `/expenses/:id` | 1件 |
| POST | `/expenses` | 作成 |
| PUT | `/expenses/:id` | 更新 |
| DELETE | `/expenses/:id` | 削除 |

### 収入 (`incomeApi.ts`)
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/incomes?limit&offset` | 一覧（ページング、既定 limit=20） |
| GET | `/incomes/planned` | 予定のみ |
| GET | `/incomes/date?from&to` | 期間取得 |
| GET | `/incomes/:id` | 1件 |
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
| GET | `/recurring-expenses/:id` | 1件 |
| POST | `/recurring-expenses` | 作成 |
| PUT | `/recurring-expenses/:id` | 更新 |
| DELETE | `/recurring-expenses/:id` | 削除 |

### サマリー / OCR / メール / 認証
| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/summary/forecast?targetDate` | 残高予測（今日指定で現在残高） |
| POST | `/ocr/analyze` | レシートOCR（multipart、timeout 30s） |
| GET | `/microsoft/auth/url` | Microsoft連携の認可URL取得（stateは10分で失効するため毎回取得） |
| GET | `/mail/smbc-usages?start&end` | カード利用通知メールから支出候補取得（OCRと同形式、timeout 90s） |
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
### Summary / Auth / Pagination / OCR
```ts
ForecastSummary { targetDate, currentBalance, plannedIncome, plannedExpense, forecastBalance }
AuthUser { userId, email, name }
AuthResponse { token, userId, email, name }
GoogleAuthUrlResponse { url, state }
PaginatedResponse<T> { items: T[], totalCount, limit, offset }
PaginationParams { limit?, offset? }
OcrItem { description, amount, expenseDate, paymentMethod }   // api/ocrApi.ts
OcrResponse { items: OcrItem[] }                              // OCR・メール読取共通
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

### カテゴリ / カレンダー / チャート / OCR / メール / 定期支出
| コンポーネント | Props |
|-------------|-------|
| `CategoryForm` | `open, category?, type?, onClose, onSubmit` |
| `CategoryList` | `categories, onEdit, onDelete` |
| `CategorySelectWithCreate` | `categories, value, onChange, onCreateCategory, type, label?, sx?, fullWidth?, size?` |
| `MonthCalendar` | `currentMonth, expenses, incomes, onMonthChange, onDayClick` |
| `ExpenseByCategoryChart` | `expenses, title?` |
| `OcrUploader` | `onAnalyzeComplete(items)` |
| `OcrResultList` | `items, categories, onCreateCategory, onSubmit, onCancel, submitting, title?, initialChecked?, renderItemExtra?` |
| `MicrosoftLinkButton` | `label?, showHint?, fullWidth?` |
| `RecurringExpenseForm` | `categories, onSubmit, onCreateCategory` |
| `RecurringExpenseList` | `recurringExpenses, onEdit, onDelete, onToggleActive` |

## React Queryキー (`lib/queryClient.ts`)
```
categories(type?)     → ['categories'] | ['categories', type]
expenses.all          → ['expenses']（一覧は [...all, offset]）
expenses.byDateRange  → ['expenses', 'dateRange', from, to]
expenses.planned      → ['expenses', 'planned']
expenses.search       → ['expenses', 'search', params]
incomes.all           → ['incomes']（一覧は [...all, offset]）
incomes.byDateRange   → ['incomes', 'dateRange', from, to]
incomes.planned       → ['incomes', 'planned']
recurringExpenses     → ['recurringExpenses']
summary.forecast      → ['summary', 'forecast', date]
summary.currentBalance→ ['summary', 'currentBalance']
calendar              → ['calendar', month]
['statistics', from, to] → 統計ページ用（StatisticsPage内で直接指定）
```
デフォルト設定: `staleTime: Infinity` / `gcTime: 30分` / フォーカス・再接続・マウント時の自動再取得なし / `retry: 1`。
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
| 投資カテゴリ名変更 | `pages/StatisticsPage.tsx`（`INVESTMENT_CATEGORY_NAME`） |
| メール読取の対象・期間変更 | `api/mailApi.ts` + `pages/MailPage.tsx` |
| モックデータ変更 | `api/mockData.ts` / `api/mockApi.ts` |
| キャッシュ戦略変更 | `lib/queryClient.ts` |
| プロキシ・ポート変更 | `vite.config.ts` |
