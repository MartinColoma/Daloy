// ============================================================
// types/quickActions.types.ts
// ============================================================

// ── Shared dropdown options ──────────────────────────────────
export interface ExpenseCategoryOption {
  id:   string;
  name: string;
  icon: string | null;
}

export interface WalletOption {
  id:       string;
  name:     string;
  currency: string;
  balance:  number;
}

// ── GET /quick-actions/add-expense/options ───────────────────
export interface AddExpenseOptionsResponse {
  categories: ExpenseCategoryOption[];
  wallets:    WalletOption[];
}

// ── POST /quick-actions/add-expense ─────────────────────────
export interface CreateExpenseRequest {
  walletId:         string;
  categoryId:       string;
  amount:           number;          // in base currency (PHP)
  originalAmount:   number;          // same as amount if no fx
  originalCurrency: string;          // e.g. "PHP", "USD"
  exchangeRate:     number;          // 1.0 if no fx
  description:      string;
  transactedAt:     string;          // ISO string
  note?:            string;
  isRecurring?:     boolean;
}

export interface CreateExpenseResponse {
  id:           string;
  type:         "expense";
  amount:       number;
  description:  string;
  transactedAt: string;
  walletId:     string;
  categoryId:   string;
}

// ── POST /quick-actions/add-expense/bulk ────────────────────
export interface CreateExpenseBulkResponse {
  inserted: number;
  items:    CreateExpenseResponse[];
}

// ============================================================
// types/home/logIncome.types.ts
// ============================================================

// ── Options (GET /quick-actions/log-income/options) ──────────

export interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface IncomeWallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
}

export interface AddIncomeOptionsResponse {
  categories: IncomeCategory[];
  wallets: IncomeWallet[];
}

// ── Create (POST /quick-actions/log-income) ──────────────────

export interface CreateIncomeRequest {
  wallet_id: string;
  category_id: string;
  /** Amount in user's base currency (PHP) */
  amount: number;
  /** Amount in the currency the user actually entered */
  original_amount: number;
  /** ISO 4217 code — e.g. "PHP", "USD" */
  original_currency: string;
  /** Rate applied: 1 original_currency = exchange_rate base_currency */
  exchange_rate: number;
  description?: string;
  /** ISO 8601 datetime string */
  transacted_at: string;
  is_recurring?: boolean;
  recurring_id?: string | null;
}

export interface CreateIncomeResponse {
  id: string;
  type: "income";
  amount: number;
  original_amount: number;
  original_currency: string;
  exchange_rate: number;
  wallet_id: string;
  category_id: string;
  description: string | null;
  transacted_at: string;
  is_recurring: boolean;
  recurring_id: string | null;
  created_at: string;
}

// ── Bulk (POST /quick-actions/log-income/bulk) ───────────────

export interface CreateIncomeBulkResponse {
  inserted: number;
  items: CreateIncomeResponse[];
}