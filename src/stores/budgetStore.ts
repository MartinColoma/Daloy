import { create } from 'zustand'
import type { BudgetUsage, Category } from '../types'

// ─── Budget Store ─────────────────────────────────────────────────────────────
// Manages budget envelopes for the active period, category list, and the
// inline Set Budget Limit right-panel form state.

interface BudgetState {
  // ── Data ──
  envelopes: BudgetUsage[]
  categories: Category[]
  activePeriodStart: string   // ISO date
  activePeriodEnd: string     // ISO date

  // ── Computed (derived from envelopes on setEnvelopes) ──
  onTrackCount: number
  totalEnvelopes: number

  // ── Right Panel form state ──
  selectedCategoryId: string | null
  budgetFormLimit: string       // controlled input — string to handle decimals cleanly
  budgetFormRollover: boolean
  isBudgetFormDirty: boolean

  // ── UI State ──
  isLoading: boolean
  error: string | null

  // ── Actions ──
  setEnvelopes: (envelopes: BudgetUsage[]) => void
  setCategories: (categories: Category[]) => void
  setPeriod: (start: string, end: string) => void

  selectCategory: (id: string | null) => void
  setBudgetFormLimit: (value: string) => void
  setBudgetFormRollover: (value: boolean) => void
  resetBudgetForm: () => void

  /** Optimistic update: patch one envelope in local state before server confirms */
  updateEnvelopeOptimistic: (id: string, patch: Partial<BudgetUsage>) => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  envelopes: [],
  categories: [],
  activePeriodStart: '',
  activePeriodEnd: '',
  onTrackCount: 0,
  totalEnvelopes: 0,
  selectedCategoryId: null,
  budgetFormLimit: '',
  budgetFormRollover: false,
  isBudgetFormDirty: false,
  isLoading: false,
  error: null,

  setEnvelopes: (envelopes) =>
    set({
      envelopes,
      // on-track = not over budget (percentUsed < 100)
      onTrackCount: envelopes.filter((e) => e.percentUsed < 100).length,
      totalEnvelopes: envelopes.length,
    }),

  setCategories: (categories) => set({ categories }),

  setPeriod: (activePeriodStart, activePeriodEnd) =>
    set({ activePeriodStart, activePeriodEnd }),

  selectCategory: (id) => {
    if (!id) {
      set({
        selectedCategoryId: null,
        budgetFormLimit: '',
        budgetFormRollover: false,
        isBudgetFormDirty: false,
      })
      return
    }
    // Pre-fill form if this category already has a budget envelope
    const existing = get().envelopes.find((e) => e.categoryId === id)
    set({
      selectedCategoryId: id,
      budgetFormLimit: existing ? String(existing.amountLimit) : '',
      budgetFormRollover: existing ? existing.rollover : false,
      isBudgetFormDirty: false,
    })
  },

  setBudgetFormLimit: (value) =>
    set({ budgetFormLimit: value, isBudgetFormDirty: true }),

  setBudgetFormRollover: (value) =>
    set({ budgetFormRollover: value, isBudgetFormDirty: true }),

  resetBudgetForm: () =>
    set({
      selectedCategoryId: null,
      budgetFormLimit: '',
      budgetFormRollover: false,
      isBudgetFormDirty: false,
    }),

  updateEnvelopeOptimistic: (id, patch) =>
    set((state) => ({
      envelopes: state.envelopes.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
}))