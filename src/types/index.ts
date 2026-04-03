// ============================================================
// Daloy — Shared TypeScript Types
// Aligned with: public.users schema + BE AuthUser + DB schema
// ============================================================

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string | null;    // public.users.display_name
  avatarUrl: string | null;      // public.users.avatar_url
  baseCurrency: string;          // public.users.base_currency (ISO 4217, default 'PHP')
  onboardingDone: boolean;       // public.users.onboarding_done
  provider: "email" | "google";
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ── API Envelope ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Enums (mirror DB enums) ───────────────────────────────────────────────────

export type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "split_expense"
  | "settlement";

export type CategoryType = "income" | "expense";

export type BudgetPeriod = "monthly" | "weekly" | "custom";

export type SplitMethod = "equal" | "percent" | "exact" | "shares";

export type GroupRole = "admin" | "member";

export type DebtStatus = "pending" | "settled";

export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  currency: string;
  initialBalance: number;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletWithBalance extends Wallet {
  currentBalance: number; // from wallet_balances view — never stored
}

// ── Category ──────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string | null; // null = system default
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  isSystem: boolean;
  createdAt: string;
}

// ── Transaction ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;               // always in base currency
  originalAmount: number | null;
  originalCurrency: string | null;
  exchangeRate: number | null;
  walletId: string;
  toWalletId: string | null;    // transfers only
  categoryId: string | null;
  groupExpenseId: string | null;
  recurringId: string | null;
  description: string | null;
  transactedAt: string;
  isVoided: boolean;
  createdAt: string;
}

export interface TransactionWithRelations extends Transaction {
  category: Category | null;
  wallet: Wallet;
  toWallet: Wallet | null;
}

// ── Budget ────────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amountLimit: number;
  period: BudgetPeriod;
  periodStart: string;
  periodEnd: string | null;
  rollover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetUsage extends Budget {
  // from budget_usage view — queried at runtime
  spent: number;
  remaining: number;
  percentUsed: number;
  category: Category;
}

// ── Groups ────────────────────────────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  icon: string | null;
  createdBy: string;
  inviteCode: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
  user?: Pick<User, "id" | "displayName" | "avatarUrl" | "email">;
}

export interface GroupExpense {
  id: string;
  groupId: string;
  paidBy: string;
  totalAmount: number;
  splitMethod: SplitMethod;
  description: string | null;
  categoryId: string | null;
  transactedAt: string;
  createdAt: string;
}

export interface GroupExpenseSplit {
  id: string;
  groupExpenseId: string;
  userId: string;
  shareAmount: number;
  sharePercent: number | null;
  shareUnits: number | null;
  createdAt: string;
}

export interface DebtRecord {
  id: string;
  groupExpenseId: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  status: DebtStatus;
  settledAt: string | null;
  settlementTxId: string | null;
  createdAt: string;
}

// ── Exchange Rates ────────────────────────────────────────────────────────────

export interface ExchangeRateSnapshot {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  fetchedAt: string;
}

// ── Filters ───────────────────────────────────────────────────────────────────

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
// ── History ───────────────────────────────────────────────────────────────────
// Query params for GET /history — all optional, combinable

export interface HistoryQueryParams {
  dateFrom?: string;      // YYYY-MM-DD, inclusive lower bound
  dateTo?: string;        // YYYY-MM-DD, inclusive upper bound
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  search?: string;        // matches description, category name, wallet name
  page?: number;          // 1-based, default 1
  limit?: number;         // default 50, max 500
}

// Flattened transaction row returned by GET /history.
// Derived from TransactionWithRelations but flattened so the FE
// doesn't need to traverse nested objects.

export interface HistoryTransactionItem {
  id: string;
  type: TransactionType;

  // core transaction fields
  amount: number;               // always in base currency (PHP)
  originalAmount: number | null;
  originalCurrency: string | null;
  exchangeRate: number | null;
  transactedAt: string;         // ISO 8601
  description: string | null;
  groupExpenseId: string | null;

  // category (flattened from Category)
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;

  // source wallet (flattened from Wallet)
  walletId: string;
  walletName: string;

  // destination wallet — transfers only (flattened from Wallet)
  toWalletId: string | null;
  toWalletName: string | null;
}

// Period aggregate returned alongside the transaction list

export interface HistoryPeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;              // totalIncome - totalExpenses
  transactionCount: number;
}

// Full response envelope from GET /history

export interface HistoryListResponse {
  transactions: HistoryTransactionItem[];
  summary: HistoryPeriodSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}