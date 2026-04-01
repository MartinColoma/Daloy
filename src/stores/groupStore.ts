import { create } from 'zustand'
import type { Group, GroupMember, DebtRecord } from '@/types'
import type { GroupBalance, NetGroupPosition } from '../services/groupService'

// ─── Group Store ──────────────────────────────────────────────────────────────

interface GroupState {
  // ── Data ──
  groups: Group[]
  activeGroupId: string | null
  groupMembers: Record<string, GroupMember[]>  // keyed by groupId
  groupBalances: Record<string, GroupBalance>  // keyed by groupId

  // ── Net Position (across all groups) ──
  netGroupPosition: NetGroupPosition | null

  // ── UI State ──
  isLoading: boolean
  error: string | null

  // ── Actions ──
  setGroups: (groups: Group[]) => void
  setActiveGroup: (id: string | null) => void
  setGroupMembers: (groupId: string, members: GroupMember[]) => void
  setGroupBalance: (groupId: string, balance: GroupBalance) => void
  setNetGroupPosition: (pos: NetGroupPosition) => void

  /** Optimistically mark a single debt as settled before server confirms */
  settleDebtOptimistic: (groupId: string, debtRecordId: string) => void

  /** Computed: returns the active Group object */
  getActiveGroup: () => Group | undefined
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroupId: null,
  groupMembers: {},
  groupBalances: {},
  netGroupPosition: null,
  isLoading: false,
  error: null,

  setGroups: (groups) => set({ groups }),

  setActiveGroup: (id) => set({ activeGroupId: id }),

  setGroupMembers: (groupId, members) =>
    set((state) => ({
      groupMembers: { ...state.groupMembers, [groupId]: members },
    })),

  setGroupBalance: (groupId, balance) =>
    set((state) => ({
      groupBalances: { ...state.groupBalances, [groupId]: balance },
    })),

  setNetGroupPosition: (netGroupPosition) => set({ netGroupPosition }),

  settleDebtOptimistic: (groupId, debtRecordId) =>
    set((state) => {
      const balance = state.groupBalances[groupId]
      if (!balance) return {}
      return {
        groupBalances: {
          ...state.groupBalances,
          [groupId]: {
            ...balance,
            debts: balance.debts.map((d: DebtRecord) =>
              d.id === debtRecordId
                ? { ...d, status: 'settled' as const, settledAt: new Date().toISOString() }
                : d
            ),
          },
        },
      }
    }),

  getActiveGroup: () => {
    const { groups, activeGroupId } = get()
    return groups.find((g) => g.id === activeGroupId)
  },
}))