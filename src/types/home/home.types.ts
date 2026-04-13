// ============================================================
// types/home.types.ts
// Request/Response shapes for the /home dashboard endpoints.
// ============================================================

// ── GET /home/summary ────────────────────────────────────────
export interface HomeSummaryResponse {
  netBalance:    number;   // sum of all non-archived wallet balances
  monthIncome:   number;   // current month income transactions
  monthExpense:  number;   // current month expense transactions
  savingsRate:   number;   // (income - expense) / income * 100
  netFlowChange: number;   // netBalance delta vs last month (positive = up)
}

// ── GET /home/recent-transactions ───────────────────────────
export interface RecentTransactionItem {
  id:               string;
  description:      string;
  amount:           number;
  type:             "income" | "expense" | "transfer" | "split_expense" | "settlement";
  categoryName:     string | null;
  categoryIcon:     string | null;
  walletName:       string;
  toWalletName:     string | null;   // transfers only
  originalAmount:   number | null;
  originalCurrency: string | null;
  transactedAt:     string;          // ISO string — may be midnight if entered via date picker
  createdAt:        string;          // ISO string — actual DB insert time, used as sort tiebreaker
  walletCurrency: string;
}

export interface RecentTransactionsResponse {
  transactions: RecentTransactionItem[];
}

// ── GET /home/budget-snapshot ────────────────────────────────
export interface BudgetSnapshotItem {
  budgetId:     string;
  categoryId:   string;
  categoryName: string;
  categoryIcon: string | null;
  amountLimit:  number;
  spent:        number;
  remaining:    number;
  percentUsed:  number;
  period:       "monthly" | "weekly" | "custom";
  periodStart:  string;
}

export interface BudgetSnapshotResponse {
  budgets:   BudgetSnapshotItem[];
  overCount: number;   // convenience count for badge
}

// ── GET /home/wallets ────────────────────────────────────────
export interface HomeWalletItem {
  id:             string;
  name:           string;
  icon:           string | null;
  currency:       string;
  currentBalance: number;   // derived from wallet_balances view
  isArchived:     boolean;
  sortOrder:      number;
}

export interface HomeWalletsResponse {
  wallets:      HomeWalletItem[];
  totalBalance: number;   // sum of non-archived wallets
}