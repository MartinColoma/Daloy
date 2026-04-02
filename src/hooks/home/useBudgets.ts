import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import budgetService from '../../services/wallet/budgetService'
import { useBudgetStore } from '../../stores/budgetStore'
import type { BudgetUsage } from '@/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const budgetKeys = {
  all: ['budgets'] as const,
  list: (start: string, end: string) => [...budgetKeys.all, 'list', start, end] as const,
}

// ─── useBudgets ───────────────────────────────────────────────────────────────
// Returns budget envelopes with computed spent/remaining/percentUsed for the period.

export function useBudgets(periodStart: string, periodEnd: string) {
  const setEnvelopes = useBudgetStore((s) => s.setEnvelopes)

  return useQuery({
    queryKey: budgetKeys.list(periodStart, periodEnd),
    queryFn: async () => {
      const envelopes = await budgetService.getBudgets(periodStart, periodEnd)
      setEnvelopes(envelopes)
      return envelopes
    },
    enabled: !!periodStart && !!periodEnd,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── useCreateBudget ──────────────────────────────────────────────────────────

export function useSetBudget() {
  const queryClient = useQueryClient()
  const activePeriodStart = useBudgetStore((s) => s.activePeriodStart)
  const activePeriodEnd = useBudgetStore((s) => s.activePeriodEnd)
  const resetBudgetForm = useBudgetStore((s) => s.resetBudgetForm)

  return useMutation({
    mutationFn: (payload: Parameters<typeof budgetService.setBudget>[0]) =>
      budgetService.setBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(activePeriodStart, activePeriodEnd) })
      resetBudgetForm()
    },
  })
}

// ─── useUpdateBudget ──────────────────────────────────────────────────────────

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  const activePeriodStart = useBudgetStore((s) => s.activePeriodStart)
  const activePeriodEnd = useBudgetStore((s) => s.activePeriodEnd)
  const updateEnvelopeOptimistic = useBudgetStore((s) => s.updateEnvelopeOptimistic)

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof budgetService.updateBudget>[1]
    }) => budgetService.updateBudget(id, payload),
    onMutate: ({ id, payload }) => {
      updateEnvelopeOptimistic(id, payload as Partial<BudgetUsage>)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(activePeriodStart, activePeriodEnd) })
    },
  })
}

// ─── useDeleteBudget ──────────────────────────────────────────────────────────

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const activePeriodStart = useBudgetStore((s) => s.activePeriodStart)
  const activePeriodEnd = useBudgetStore((s) => s.activePeriodEnd)

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(activePeriodStart, activePeriodEnd) })
    },
  })
}