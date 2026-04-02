// ============================================================
// types/onboarding.types.ts
// Request/Response shapes for the 3-step onboarding flow
// ============================================================

export interface PatchCurrencyBody {
  baseCurrency: string; // ISO 4217, e.g. "PHP"
}

export interface CreateWalletEntry {
  name: string;
  icon: string;             // emoji or icon key
  initialBalance: number;   // NUMERIC(18,4)
  currency?: string;        // defaults to user's base_currency
}

export interface CreateWalletsBody {
  wallets: CreateWalletEntry[];
}

export interface CreateBudgetEntry {
  categoryId: string;                         // UUID
  amountLimit: number;                        // NUMERIC(18,4)
  period?: "monthly" | "weekly" | "custom";  // default: "monthly"
  periodStart: string;                        // ISO date: YYYY-MM-DD
  periodEnd?: string | null;                  // ISO date — null for open-ended
  rollover?: boolean;                         // default: false
}

export interface CreateBudgetsBody {
  budgets: CreateBudgetEntry[];
}

// Response shapes
export interface OnboardingStatusResponse {
  onboardingDone: boolean;
  baseCurrency: string;
  hasWallets: boolean;
  hasBudgets: boolean;
}

export interface WalletResponse {
  id: string;
  name: string;
  icon: string;
  currency: string;
  initialBalance: number;
  currentBalance: number; // from wallet_balances view
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BudgetResponse {
  id: string;
  categoryId: string;
  amountLimit: number;
  period: "monthly" | "weekly" | "custom";
  periodStart: string;
  periodEnd?: string | null;
  rollover: boolean;
  spent?: number;      // optional: from budget_usage view
  remaining?: number;  // optional: from budget_usage view
  createdAt: string;
}

export interface CompleteOnboardingResponse {
  onboardingDone: boolean;
}

export interface SystemCategory {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
  isSystem: boolean;
}