import apiClient from '../apiClient'
import type { ApiResponse, Wallet, WalletWithBalance } from '@/types'

// ─── Local payload types ──────────────────────────────────────────────────────

export interface CreateWalletPayload {
  name: string
  icon?: string
  currency?: string
  initialBalance?: number
}

export interface UpdateWalletPayload {
  name?: string
  icon?: string
  currency?: string
  sortOrder?: number
}

export interface NetPosition {
  totalAssets: number
  totalOwed: number   // money user owes others (across group debt records)
  net: number         // totalAssets - totalOwed
}

export interface TransferPayload {
  fromWalletId: string
  toWalletId: string
  amount: number
  description?: string
}

// ─── Wallet Service ───────────────────────────────────────────────────────────
// All wallet-related API calls. Components NEVER call fetch/axios directly.
// currentBalance is always derived server-side — never stored.
// baseURL = http://localhost:3000/ so every route needs the /api prefix.

const walletService = {
  /** GET /api/wallets — all non-archived wallets with derived currentBalance */
  async getWallets(): Promise<WalletWithBalance[]> {
    const { data } = await apiClient.get<ApiResponse<WalletWithBalance[]>>('/api/wallets')
    return data.data!
  },

  /** GET /api/wallets/:id — single wallet with derived currentBalance */
  async getWallet(id: string): Promise<WalletWithBalance> {
    const { data } = await apiClient.get<ApiResponse<WalletWithBalance>>(`/api/wallets/${id}`)
    return data.data!
  },

  /** POST /api/wallets */
  async createWallet(payload: CreateWalletPayload): Promise<Wallet> {
    const { data } = await apiClient.post<ApiResponse<Wallet>>('/api/wallets', payload)
    return data.data!
  },

  /** PATCH /api/wallets/:id — name, icon, currency, sortOrder only */
  async updateWallet(id: string, payload: UpdateWalletPayload): Promise<Wallet> {
    const { data } = await apiClient.patch<ApiResponse<Wallet>>(`/api/wallets/${id}`, payload)
    return data.data!
  },

  /** DELETE /api/wallets/:id — soft-delete, sets isArchived = true server-side */
  async archiveWallet(id: string): Promise<void> {
    await apiClient.delete(`/api/wallets/${id}`)
  },

  /** GET /api/net-worth — sums all wallet balances in base currency */
  async getNetPosition(): Promise<NetPosition> {
  const { data } = await apiClient.get<ApiResponse<NetPosition>>('/api/wallets/net-worth')
    return data.data!
  },

  /** POST /api/wallets/transfer — creates debit + credit transactions server-side */
  async transfer(payload: TransferPayload): Promise<void> {
    await apiClient.post('/api/wallets/transfer', payload)
  },
}

export default walletService