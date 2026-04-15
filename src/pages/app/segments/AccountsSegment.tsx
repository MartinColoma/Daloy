import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { useLayout } from '../../../layouts/LayoutContext'

// ── Hooks ─────────────────────────────────────────────────────────────────────
import { useWallets, useNetPosition } from '../../../hooks/wallet/useWallets'
import { useCurrency }                from '../../../hooks/currency/useCurrency'

// ── Components ────────────────────────────────────────────────────────────────
import { WalletTable }     from '../../../components/wallet/accounts/WalletTable'
import { NetPositionCard } from '../../../components/wallet/accounts/NetPositionCard'

// ── Modals ────────────────────────────────────────────────────────────────────
import AddWalletModal     from '../../../components/modals/QuickActions/AddWalletModal'
import EditWalletModal    from '../../../components/modals/wallet/accounts/EditWalletModal'
import ArchiveWalletModal from '../../../components/modals/wallet/accounts/ArchiveWalletModal'
import TransferModal      from '../../../components/modals/QuickActions/TransferModal'

// ── Services ──────────────────────────────────────────────────────────────────
import walletService from '../../../services/wallet/walletService'

// ── Types ─────────────────────────────────────────────────────────────────────
import type { WalletWithBalance } from '../../../types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="animate-pulse rounded-[var(--radius-sm)]"
      style={{ background: 'var(--bg3)', ...style }}
    />
  )
}

// ─── Inline Transfer Panel (desktop sidebar) ──────────────────────────────────
function InlineTransferPanel({ wallets }: { wallets: WalletWithBalance[] }) {
  const { onModalSuccess } = useLayout()
  const { format }         = useCurrency()

  const [fromId,     setFromId]     = useState(wallets[0]?.id ?? '')
  const [toId,       setToId]       = useState(wallets[1]?.id ?? '')
  const [centStr,    setCentStr]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [success,    setSuccess]    = useState(false)

  // Keep defaults in sync if wallets load after mount
  useEffect(() => {
    if (!fromId && wallets[0]) setFromId(wallets[0].id)
    if (!toId   && wallets[1]) setToId(wallets[1].id)
  }, [wallets])

  const numericAmount = centStr ? parseInt(centStr, 10) / 100 : 0
  const displayAmount = centStr
    ? (parseInt(centStr, 10) / 100).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : ''

  const fromWallet  = wallets.find(w => w.id === fromId) ?? null
  const toOptions   = wallets.filter(w => w.id !== fromId)
  const overBalance =
    fromWallet !== null &&
    numericAmount > (fromWallet.currentBalance ?? 0) &&
    numericAmount > 0

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setCentStr(prev => prev.slice(0, -1))
    } else if (/^\d$/.test(e.key)) {
      setCentStr(prev => {
        const next = (prev + e.key).replace(/^0+/, '') || ''
        if (parseInt(next, 10) > 99_999_999_999) return prev
        return next
      })
    }
    e.preventDefault()
  }, [])

  const isDisabled =
    !fromId || !toId || fromId === toId ||
    !centStr || numericAmount <= 0 || overBalance || submitting

  const handleSubmit = async () => {
    if (isDisabled) return
    setSubmitting(true)
    setError(null)
    try {
      await walletService.transfer({
        fromWalletId: fromId,
        toWalletId:   toId,
        amount:       numericAmount,
      })
      setCentStr('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      onModalSuccess?.()
    } catch {
      setError('Transfer failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
    >
      <h2
        className="text-[0.9rem] font-semibold mb-4"
        style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
      >
        Transfer Between Wallets
      </h2>

      {error && (
        <p style={{
          padding: '8px 10px',
          background: 'var(--clay-bg)',
          border: '1.5px solid var(--clay-m)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--clay)',
          fontSize: '0.78rem',
          fontFamily: 'Outfit, sans-serif',
          margin: '0 0 12px',
        }}>
          {error}
        </p>
      )}

      {/* From */}
      <div className="daloy-field" style={{ marginBottom: '10px' }}>
        <label className="daloy-label">From</label>
        <select
          className="daloy-select"
          value={fromId}
          onChange={e => {
            setFromId(e.target.value)
            if (toId === e.target.value) setToId('')
          }}
          style={{ width: '100%' }}
        >
          {wallets.map(w => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
        {fromWallet && (
          <p className="daloy-hint" style={{ marginTop: '3px' }}>
            Balance: {format(fromWallet.currentBalance ?? 0)}
          </p>
        )}
      </div>

      {/* To */}
      <div className="daloy-field" style={{ marginBottom: '10px' }}>
        <label className="daloy-label">To</label>
        <select
          className="daloy-select"
          value={toId}
          onChange={e => setToId(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="" disabled>Select wallet</option>
          {toOptions.map(w => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="daloy-field" style={{ marginBottom: '14px' }}>
        <label className="daloy-label">Amount</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.82rem',
            color: 'var(--ink3)',
            flexShrink: 0,
          }}>
            {fromWallet?.currency ?? 'PHP'}
          </span>
          <input
            className="daloy-input-mono"
            type="text"
            inputMode="numeric"
            placeholder="0.00"
            value={displayAmount}
            onKeyDown={handleKey}
            onChange={() => {}}
            style={{ color: overBalance ? 'var(--expense)' : 'var(--steel)' }}
          />
        </div>
        {overBalance && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--expense)',
            marginTop: '3px',
            fontFamily: 'Outfit, sans-serif',
          }}>
            Exceeds available balance.
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          background: success
            ? 'var(--income)'
            : isDisabled
            ? 'var(--bg3)'
            : 'var(--forest)',
          color: isDisabled ? 'var(--ink4)' : 'white',
          transition: 'background 0.2s, color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {success
          ? '✓ Transferred'
          : submitting
          ? 'Transferring…'
          : <><ArrowLeftRight size={14} /> Confirm Transfer</>
        }
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNTS SEGMENT
// ═══════════════════════════════════════════════════════════════

interface AccountsSegmentProps {
  isDesktop: boolean
}

export function AccountsSegment({ isDesktop }: AccountsSegmentProps) {
  const { setModalSuccessHandler } = useLayout()

  const { data: wallets = [],  isLoading }             = useWallets()
  const { data: netPosition,   isLoading: netLoading } = useNetPosition()
  const { refetch: refetchWallets }                    = useWallets()
  const { refetch: refetchNetPosition }                = useNetPosition()

  const refetchAll = useCallback(() => {
    refetchWallets()
    refetchNetPosition()
  }, [refetchWallets, refetchNetPosition])

  useEffect(() => {
    setModalSuccessHandler(refetchAll)
    return () => setModalSuccessHandler(null)
  }, [refetchAll])

  const [addOpen,       setAddOpen]       = useState(false)
  const [editTarget,    setEditTarget]    = useState<WalletWithBalance | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<WalletWithBalance | null>(null)
  const [transferSource, setTransferSource] = useState<WalletWithBalance | null>(null)

  const walletTableEl = (
    <>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(i => <Skeleton key={i} style={{ height: '52px' }} />)}
        </div>
      ) : wallets.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--ink4)',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.85rem',
        }}>
          No wallets yet — add one to get started.
        </div>
      ) : (
        <WalletTable
          wallets={wallets}
          onEdit={wallet => setEditTarget(wallet)}
          onArchive={wallet => setArchiveTarget(wallet)}
          onTransfer={isDesktop ? undefined : wallet => setTransferSource(wallet)}
        />
      )}
    </>
  )

  const modals = (
    <>
      <AddWalletModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <EditWalletModal
        isOpen={editTarget !== null}
        wallet={editTarget}
        onClose={() => setEditTarget(null)}
      />
      <ArchiveWalletModal
        isOpen={archiveTarget !== null}
        wallet={archiveTarget}
        onClose={() => setArchiveTarget(null)}
      />
      {!isDesktop && (
        <TransferModal
          isOpen={transferSource !== null}
          onClose={() => setTransferSource(null)}
          sourceWallet={transferSource}
        />
      )}
    </>
  )

  // ── Desktop ────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <>
        <div className="flex gap-5">
          <div className="flex-1 min-w-0">
            <div
              className="rounded-xl p-5"
              style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-[1rem] font-semibold"
                  style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                >
                  My Accounts
                </h2>
                <button
                  onClick={() => setAddOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--forest)',
                    background: 'var(--forest-bg)',
                    border: '1.5px solid var(--forest-xl)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <Plus size={13} />
                  Add Wallet
                </button>
              </div>
              {walletTableEl}
            </div>
          </div>

          <div className="w-[280px] shrink-0 flex flex-col gap-4">
            <NetPositionCard netPosition={netPosition ?? null} isLoading={netLoading} />
            {wallets.length >= 2 && <InlineTransferPanel wallets={wallets} />}
          </div>
        </div>
        {modals}
      </>
    )
  }

  // ── Mobile ─────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-4">
        <NetPositionCard netPosition={netPosition ?? null} isLoading={netLoading} />

        <div
          className="rounded-[var(--radius-md)] overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--bg3)' }}
          >
            <p
              className="font-outfit font-semibold text-[0.9rem]"
              style={{ color: 'var(--ink)' }}
            >
              My Accounts
            </p>
            <button
              onClick={() => setAddOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--forest)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              Add
            </button>
          </div>

          <div style={{ padding: '12px' }}>
            {walletTableEl}
          </div>
        </div>
      </div>
      {modals}
    </>
  )
}