// ============================================================
// services/onboardingService.ts
// API calls for the 3-step onboarding flow — fully typed.
// ============================================================

import apiClient from "./apiClient";
import type {
  OnboardingStatusResponse,
  WalletResponse,
  BudgetResponse,
  CompleteOnboardingResponse,
  CreateWalletEntry,
  CreateBudgetEntry,
  SystemCategory,
} from "../types/onboarding.types";

export type { SystemCategory };

// ── GET /onboarding/status ───────────────────────────────────
export async function fetchOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: OnboardingStatusResponse }>(
    "api/onboarding/status",
  );
  return data.data;
}

// ── GET /onboarding/categories ───────────────────────────────
export async function fetchSystemCategories(): Promise<SystemCategory[]> {
  const { data } = await apiClient.get<{ success: boolean; data: SystemCategory[] }>(
    "api/onboarding/categories",
  );
  return data.data;
}

// ── Step 1: PATCH /onboarding/currency ──────────────────────
export async function patchBaseCurrency(baseCurrency: string): Promise<{ baseCurrency: string }> {
  const { data } = await apiClient.patch<{ success: boolean; data: { baseCurrency: string } }>(
    "api/onboarding/currency",
    { baseCurrency },
  );
  return data.data;
}

// ── Step 2: POST /onboarding/wallets ────────────────────────
export async function postWallets(wallets: CreateWalletEntry[]): Promise<{
  count: number;
  wallets: WalletResponse[];
}> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { count: number; wallets: WalletResponse[] };
  }>("api/onboarding/wallets", { wallets });
  return data.data;
}

// ── Step 3: POST /onboarding/budgets ────────────────────────
export async function postBudgets(budgets: CreateBudgetEntry[]): Promise<{
  count: number;
  budgets: BudgetResponse[];
}> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { count: number; budgets: BudgetResponse[] };
  }>("api/onboarding/budgets", { budgets });
  return data.data;
}

// ── POST /onboarding/complete ────────────────────────────────
export async function postOnboardingComplete(): Promise<CompleteOnboardingResponse> {
  const { data } = await apiClient.post<{ success: boolean; data: CompleteOnboardingResponse }>(
    "api/onboarding/complete",
  );
  return data.data;
}