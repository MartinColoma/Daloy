import apiClient from '../apiClient'
import type { Budget, BudgetUsage, Category, BudgetPeriod } from '@/types'

// ─── Local payload type ───────────────────────────────────────────────────────

export interface SetBudgetPayload {
  categoryId: string
  amountLimit: number
  period: BudgetPeriod
  periodStart: string        // ISO date e.g. '2026-03-01'
  periodEnd: string | null   // null for open-ended (e.g. weekly rolling)
  rollover: boolean
}

// ─── Budget Service ───────────────────────────────────────────────────────────
// All budget envelope calls. spent/remaining/percentUsed are ALWAYS queried
// at runtime from budget_usage view — never stored as columns.

const budgetService = {
  /**
   * Fetch all budget envelopes for a given period.
   * Returns BudgetUsage[] — each item has spent, remaining, percentUsed from the view.
   * @param periodStart ISO date string, e.g. '2026-03-01'
   * @param periodEnd   ISO date string, e.g. '2026-03-31'
   */
  async getBudgets(periodStart: string, periodEnd: string): Promise<BudgetUsage[]> {
    const { data } = await apiClient.get<BudgetUsage[]>('/budgets', {
      params: { periodStart, periodEnd },
    })
    return data
  },

  /** Fetch all categories — system defaults + user-defined */
  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories')
    return data
  },

  /** Create or upsert a budget envelope for a category */
  async setBudget(payload: SetBudgetPayload): Promise<Budget> {
    const { data } = await apiClient.post<Budget>('/budgets', payload)
    return data
  },

  /** Update an existing budget (limit, rollover, dates) */
  async updateBudget(
    id: string,
    payload: Partial<Pick<Budget, 'amountLimit' | 'rollover' | 'periodStart' | 'periodEnd'>>
  ): Promise<Budget> {
    const { data } = await apiClient.patch<Budget>(`/budgets/${id}`, payload)
    return data
  },

  /** Delete a budget envelope */
  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`)
  },
}

export default budgetService