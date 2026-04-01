import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import walletService from '../services/walletService'
import { useWalletStore } from '../stores/walletStore'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const walletKeys = {
  all: ['wallets'] as const,
  list: () => [...walletKeys.all, 'list'] as const,
  detail: (id: string) => [...walletKeys.all, 'detail', id] as const,
  netPosition: () => [...walletKeys.all, 'net-position'] as const,
}

// ─── useWallets ───────────────────────────────────────────────────────────────

export function useWallets() {
  const setWallets = useWalletStore((s) => s.setWallets)

  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: async () => {
      const wallets = await walletService.getWallets()
      setWallets(wallets)
      return wallets
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── useNetPosition ───────────────────────────────────────────────────────────

export function useNetPosition() {
  const setNetPosition = useWalletStore((s) => s.setNetPosition)

  return useQuery({
    queryKey: walletKeys.netPosition(),
    queryFn: async () => {
      const pos = await walletService.getNetPosition()
      setNetPosition(pos)
      return pos
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── useCreateWallet ──────────────────────────────────────────────────────────

export function useCreateWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof walletService.createWallet>[0]) =>
      walletService.createWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.list() })
      queryClient.invalidateQueries({ queryKey: walletKeys.netPosition() })
    },
  })
}

// ─── useUpdateWallet ──────────────────────────────────────────────────────────

export function useUpdateWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof walletService.updateWallet>[1] }) =>
      walletService.updateWallet(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.list() })
    },
  })
}

// ─── useArchiveWallet ─────────────────────────────────────────────────────────

export function useArchiveWallet() {
  const queryClient = useQueryClient()
  const removeWalletOptimistic = useWalletStore((s) => s.removeWalletOptimistic)

  return useMutation({
    mutationFn: (id: string) => walletService.archiveWallet(id),
    onMutate: (id) => {
      removeWalletOptimistic(id)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.list() })
      queryClient.invalidateQueries({ queryKey: walletKeys.netPosition() })
    },
  })
}

// ─── useTransfer ──────────────────────────────────────────────────────────────

export function useTransfer() {
  const queryClient = useQueryClient()
  const clearTransferForm = useWalletStore((s) => s.clearTransferForm)

  return useMutation({
    mutationFn: (payload: Parameters<typeof walletService.transfer>[0]) =>
      walletService.transfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.list() })
      queryClient.invalidateQueries({ queryKey: walletKeys.netPosition() })
      clearTransferForm()
    },
  })
}