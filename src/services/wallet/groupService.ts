import apiClient from '../apiClient'
import type { Group, GroupMember, GroupExpense, DebtRecord } from '../../types'

// ─── Local types (not in index.ts) ───────────────────────────────────────────

export interface GroupBalance {
  groupId: string
  youOwe: number        // amount current user owes others in this group
  owedToYou: number     // amount others owe current user in this group
  net: number           // negative = you owe, positive = owed to you
  debts: DebtRecord[]   // individual pending debt records
}

export interface SimplifiedDebt {
  fromUserId: string
  toUserId: string
  amount: number
  fromName: string
  toName: string
}

export interface NetGroupPosition {
  youOwe: number
  owedToYou: number
  net: number
}

// ─── Group Service ────────────────────────────────────────────────────────────
// All group expense splitting and debt settlement calls.

const groupService = {
  /** Fetch all active (non-archived) groups for the current user */
  async getGroups(): Promise<Group[]> {
    const { data } = await apiClient.get<Group[]>('/groups')
    return data
  },

  /** Fetch a single group by ID */
  async getGroup(id: string): Promise<Group> {
    const { data } = await apiClient.get<Group>(`/groups/${id}`)
    return data
  },

  /** Create a new group */
  async createGroup(payload: Pick<Group, 'name' | 'icon'>): Promise<Group> {
    const { data } = await apiClient.post<Group>('/groups', payload)
    return data
  },

  /** Archive a group (soft-delete, full history preserved) */
  async archiveGroup(id: string): Promise<void> {
    await apiClient.patch(`/groups/${id}`, { isArchived: true })
  },

  /** Fetch members of a group */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data } = await apiClient.get<GroupMember[]>(`/groups/${groupId}/members`)
    return data
  },

  /** Add a member by userId */
  async addMember(groupId: string, userId: string): Promise<GroupMember> {
    const { data } = await apiClient.post<GroupMember>(`/groups/${groupId}/members`, { userId })
    return data
  },

  /** Remove a member from a group */
  async removeMember(groupId: string, userId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`)
  },

  /** Fetch all expenses for a group */
  async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
    const { data } = await apiClient.get<GroupExpense[]>(`/groups/${groupId}/expenses`)
    return data
  },

  /** Create a new group expense — server also creates debt_records */
  async createGroupExpense(
    groupId: string,
    payload: Omit<GroupExpense, 'id' | 'groupId' | 'createdAt'>
  ): Promise<GroupExpense> {
    const { data } = await apiClient.post<GroupExpense>(`/groups/${groupId}/expenses`, payload)
    return data
  },

  /**
   * Get the current user's balance for a specific group.
   * Returns youOwe, owedToYou, net, and full debt records breakdown.
   */
  async getGroupBalance(groupId: string): Promise<GroupBalance> {
    const { data } = await apiClient.get<GroupBalance>(`/groups/${groupId}/balance`)
    return data
  },

  /**
   * Simplify debts — calls edge function GET /simplify-debts.
   * Returns minimum-payment debt plan for the group.
   */
  async simplifyDebts(groupId: string): Promise<SimplifiedDebt[]> {
    const { data } = await apiClient.get<SimplifiedDebt[]>(`/groups/${groupId}/simplify-debts`)
    return data
  },

  /**
   * Settle a debt record — calls edge function POST /settle.
   * Marks debt as settled + creates a settlement transaction.
   */
  async settleDebt(debtRecordId: string, walletId: string): Promise<void> {
    await apiClient.post('/settle', { debtRecordId, walletId })
  },

  /** Aggregate net position across ALL groups for the current user */
  async getNetGroupPosition(): Promise<NetGroupPosition> {
    const { data } = await apiClient.get<NetGroupPosition>('/groups/net-position')
    return data
  },
}

export default groupService