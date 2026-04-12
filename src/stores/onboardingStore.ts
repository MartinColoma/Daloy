// stores/onboardingStore.ts
import { create } from "zustand";
import type { CreateWalletEntry, CreateBudgetEntry } from "../types/onboarding/onboarding.types";

interface StagedWallet extends CreateWalletEntry {
  // currency is intentionally omitted during onboarding —
  // all wallets inherit baseCurrency, resolved by the backend.
  // In-app wallet creation is where per-wallet currency is set.
  currency?: never;
}

interface OnboardingStore {
  baseCurrency: string;                // ISO 4217 — set in Step 1
  wallets:      StagedWallet[];        // staged in Step 2, flushed in Step 3
  budgets:      CreateBudgetEntry[];   // staged in Step 3, flushed on finish

  setBaseCurrency: (c: string) => void;
  setWallets:      (w: StagedWallet[]) => void;
  setBudgets:      (b: CreateBudgetEntry[]) => void;
  reset:           () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  baseCurrency: "PHP",
  wallets:      [],
  budgets:      [],

  setBaseCurrency: (baseCurrency) => set({ baseCurrency }),
  setWallets:      (wallets)      => set({ wallets }),
  setBudgets:      (budgets)      => set({ budgets }),
  reset:           ()             => set({ baseCurrency: "PHP", wallets: [], budgets: [] }),
}));