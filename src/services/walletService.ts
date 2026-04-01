import apiClient from './apiClient'
import type { Wallet, WalletWithBalance } from '@/types'

// ─── Local payload types (not in index.ts, kept here) ────────────────────────

export interface NetPosition {
  totalAssets: number
  totalOwed: number    // money user owes others (across group debt records)
  net: number          // totalAssets - totalOwed
}

export interface TransferPayload {
  fromWalletId: string
  toWalletId: string
  amount: number
  description?: string
}

// ─── Wallet Service ───────────────────────────────────────────────────────────
// All wallet-related API calls. Components NEVER call fetch/axios directly.
// currentBalance is always derived server-side from the wallet_balances view.

const walletService = {
  /**
   * Fetch all wallets for the current user (non-archived).
   * currentBalance is derived by the wallet_balances view — never stored.
   */
  async getWallets(): Promise<WalletWithBalance[]> {
    const { data } = await apiClient.get<WalletWithBalance[]>('/wallets')
    return data
  },

  /** Fetch a single wallet by ID with derived currentBalance */
  async getWallet(id: string): Promise<WalletWithBalance> {
    const { data } = await apiClient.get<WalletWithBalance>(`/wallets/${id}`)
    return data
  },

  /** Create a new wallet */
  async createWallet(
    payload: Pick<Wallet, 'name' | 'icon' | 'currency'>
  ): Promise<Wallet> {
    const { data } = await apiClient.post<Wallet>('/wallets', payload)
    return data
  },

  /** Update wallet name or icon — NOT balance (always derived) */
  async updateWallet(
    id: string,
    payload: Partial<Pick<Wallet, 'name' | 'icon'>>
  ): Promise<Wallet> {
    const { data } = await apiClient.patch<Wallet>(`/wallets/${id}`, payload)
    return data
  },

  /** Soft-delete: sets isArchived = true. Keeps full transaction history intact. */
  async archiveWallet(id: string): Promise<void> {
    await apiClient.patch(`/wallets/${id}`, { isArchived: true })
  },

  /**
   * Derive total net position for the user.
   * Calls edge function GET /net-worth which sums all wallet_balances in base currency.
   */
  async getNetPosition(): Promise<NetPosition> {
    const { data } = await apiClient.get<NetPosition>('/net-worth')
    return data
  },

  /**
   * Transfer between two wallets.
   * Creates two transactions server-side (debit + credit) — double-entry preserved.
   */
  async transfer(payload: TransferPayload): Promise<void> {
    await apiClient.post('/wallets/transfer', payload)
  },
}

export default walletService