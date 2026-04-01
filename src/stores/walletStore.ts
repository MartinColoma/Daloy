import { create } from 'zustand'
import type { WalletWithBalance } from '@/types'
import type { NetPosition } from '../services/walletService'

// ─── Wallet Store ─────────────────────────────────────────────────────────────

interface WalletState {
  // ── Data ──
  wallets: WalletWithBalance[]
  netPosition: NetPosition | null

  // ── UI State ──
  selectedWalletId: string | null  // active filter for History/Home
  isLoading: boolean
  error: string | null

  // ── Transfer panel state (Accounts tab right sidebar) ──
  transferFrom: string | null
  transferTo: string | null
  transferAmount: string           // string for controlled input

  // ── Actions ──
  setWallets: (wallets: WalletWithBalance[]) => void
  setNetPosition: (pos: NetPosition) => void
  setSelectedWallet: (id: string | null) => void
  setTransferFrom: (id: string | null) => void
  setTransferTo: (id: string | null) => void
  setTransferAmount: (amount: string) => void
  clearTransferForm: () => void
  removeWalletOptimistic: (id: string) => void
  invalidateWallets: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  wallets: [],
  netPosition: null,
  selectedWalletId: null,
  isLoading: false,
  error: null,
  transferFrom: null,
  transferTo: null,
  transferAmount: '',

  setWallets: (wallets) => set({ wallets }),

  setNetPosition: (netPosition) => set({ netPosition }),

  setSelectedWallet: (id) => set({ selectedWalletId: id }),

  setTransferFrom: (id) => set({ transferFrom: id }),

  setTransferTo: (id) => set({ transferTo: id }),

  setTransferAmount: (amount) => set({ transferAmount: amount }),

  clearTransferForm: () =>
    set({ transferFrom: null, transferTo: null, transferAmount: '' }),

  /** Optimistically removes a wallet before server confirms archive */
  removeWalletOptimistic: (id) =>
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
    })),

  /** Signal for React Query to invalidate — call queryClient.invalidateQueries alongside */
  invalidateWallets: () => set({ isLoading: true }),
}))