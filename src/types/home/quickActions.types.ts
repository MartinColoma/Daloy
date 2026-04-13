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