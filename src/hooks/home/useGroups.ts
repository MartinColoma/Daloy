import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import groupService from '../../services/wallet/groupService'
import { useGroupStore } from '../../stores/groupStore'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const groupKeys = {
  all: ['groups'] as const,
  list: () => [...groupKeys.all, 'list'] as const,
  members: (groupId: string) => [...groupKeys.all, groupId, 'members'] as const,
  expenses: (groupId: string) => [...groupKeys.all, groupId, 'expenses'] as const,
  balance: (groupId: string) => [...groupKeys.all, groupId, 'balance'] as const,
  netPosition: () => [...groupKeys.all, 'net-position'] as const,
  simplifiedDebts: (groupId: string) => [...groupKeys.all, groupId, 'simplified-debts'] as const,
}

// ─── useGroups ────────────────────────────────────────────────────────────────

export function useGroups() {
  const setGroups = useGroupStore((s) => s.setGroups)

  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: async () => {
      const groups = await groupService.getGroups()
      setGroups(groups)
      return groups
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── useGroupMembers ──────────────────────────────────────────────────────────

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => groupService.getGroupMembers(groupId),
    enabled: !!groupId,
  })
}

// ─── useGroupExpenses ─────────────────────────────────────────────────────────

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: groupKeys.expenses(groupId),
    queryFn: () => groupService.getGroupExpenses(groupId),
    enabled: !!groupId,
  })
}

// ─── useGroupBalance ──────────────────────────────────────────────────────────

export function useGroupBalance(groupId: string | null) {
  const setGroupBalance = useGroupStore((s) => s.setGroupBalance)

  return useQuery({
    queryKey: groupKeys.balance(groupId ?? ''),
    queryFn: async () => {
      const balance = await groupService.getGroupBalance(groupId!)
      setGroupBalance(groupId!, balance)
      return balance
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2,
  })
}

// ─── useNetGroupPosition ──────────────────────────────────────────────────────

export function useNetGroupPosition() {
  const setNetGroupPosition = useGroupStore((s) => s.setNetGroupPosition)

  return useQuery({
    queryKey: groupKeys.netPosition(),
    queryFn: async () => {
      const pos = await groupService.getNetGroupPosition()
      setNetGroupPosition(pos)
      return pos
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ─── useSimplifiedDebts ───────────────────────────────────────────────────────

export function useSimplifiedDebts(groupId: string) {
  return useQuery({
    queryKey: groupKeys.simplifiedDebts(groupId),
    queryFn: () => groupService.simplifyDebts(groupId),
    enabled: !!groupId,
  })
}

// ─── useCreateGroup ───────────────────────────────────────────────────────────

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof groupService.createGroup>[0]) =>
      groupService.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() })
    },
  })
}

// ─── useCreateGroupExpense ────────────────────────────────────────────────────

export function useCreateGroupExpense(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof groupService.createGroupExpense>[1]) =>
      groupService.createGroupExpense(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.expenses(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.balance(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.netPosition() })
    },
  })
}

// ─── useSettleDebt ────────────────────────────────────────────────────────────

export function useSettleDebt(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ debtRecordId, walletId }: { debtRecordId: string; walletId: string }) =>
      groupService.settleDebt(debtRecordId, walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.balance(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.netPosition() })
      queryClient.invalidateQueries({ queryKey: groupKeys.simplifiedDebts(groupId) })
    },
  })
}