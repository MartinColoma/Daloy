// ============================================================
// types/home.types.ts
// ============================================================

export interface HomeSummaryResponse {
  netBalance:    number;
  monthIncome:   number;
  monthExpense:  number;
  savingsRate:   number;
  netFlowChange: number;
}

export interface RecentTransactionItem {
  id:               string;
  description:      string;
  amount:           number;
  type:             "income" | "expense" | "transfer" | "split_expense" | "settlement";
  categoryName:     string | null;
  categoryIcon:     string | null;
  walletName:       string;
  toWalletName:     string | null;
  originalAmount:   number | null;
  originalCurrency: string | null;
  transactedAt:     string;
}

export interface RecentTransactionsResponse {
  transactions: RecentTransactionItem[];
}

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
  overCount: number;
}

export interface HomeWalletItem {
  id:             string;
  name:           string;
  icon:           string | null;
  currency:       string;
  currentBalance: number;
  isArchived:     boolean;
  sortOrder:      number;
}

export interface HomeWalletsResponse {
  wallets:      HomeWalletItem[];
  totalBalance: number;
}