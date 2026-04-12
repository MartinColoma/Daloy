import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { useLayout } from '../../layouts/LayoutContext'
import { useIsDesktop } from '../../hooks/useMediaQuery'

// ── Stores ────────────────────────────────────────────────────────────────────
import { useBudgetStore } from '../../stores/budgetStore'
import { useGroupStore }  from '../../stores/groupStore'

// ── Hooks ─────────────────────────────────────────────────────────────────────
import { useWallets, useNetPosition } from '../../hooks/home/useWallets'
import { useBudgets }                 from '../../hooks/home/useBudgets'
import { useGroups, useGroupBalance, useNetGroupPosition } from '../../hooks/home/useGroups'
import { useCurrency } from "../../hooks/useCurrency";

// ── Components — wallet/ ──────────────────────────────────────────────────────
import { WalletTable }      from '../../components/wallet/accounts/WalletTable'
import { NetPositionCard }  from '../../components/wallet/accounts/NetPositionCard'
import { BudgetEnvelopes }  from '../../components/wallet/budgets/BudgetEnvelopes'
import { GroupsOverview }   from '../../components/wallet/groups/GroupsOverview'

// ── Components — groups/ ──────────────────────────────────────────────────────
import { DebtSummary } from '../../components/wallet/groups/DebtSummary'

// ── Modals ────────────────────────────────────────────────────────────────────
import AddWalletModal      from '../../components/modals/QuickActions/AddWalletModal'
import EditWalletModal     from '../../components/modals/wallet/accounts/EditWalletModal'
import ArchiveWalletModal  from '../../components/modals/wallet/accounts/ArchiveWalletModal'
import TransferModal from '../../components/modals/QuickActions/TransferModal'

// ── Services ──────────────────────────────────────────────────────────────────
import walletService from '../../services/wallet/walletService'

// ── Types ─────────────────────────────────────────────────────────────────────
import type { WalletWithBalance } from '../../types'

type WalletSegment = 'accounts' | 'budgets' | 'groups'

// ─── Segmented Control ────────────────────────────────────────────────────────
interface SegmentedControlProps {
  active:   WalletSegment
  onChange: (s: WalletSegment) => void
}

function SegmentedControl({ active, onChange }: SegmentedControlProps) {
  const tabs: { key: WalletSegment; label: string }[] = [
    { key: 'accounts', label: 'Accounts' },
    { key: 'budgets',  label: 'Budgets'  },
    { key: 'groups',   label: 'Groups'   },
  ]

  return (
    <div
      className="inline-flex rounded-full p-[3px] gap-[2px]"
      style={{ background: 'var(--bg2)' }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="px-4 py-1.5 rounded-full text-[0.82rem] font-medium transition-all"
            style={{
              background: isActive ? '#FFFFFF' : 'transparent',
              color:      isActive ? 'var(--ink)' : 'var(--ink4)',
              fontFamily: 'Outfit, sans-serif',
              boxShadow:  isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="animate-pulse rounded-[var(--radius-sm)]"
      style={{ background: 'var(--bg3)', ...style }}
    />
  )
}


function InlineTransferPanel({ wallets }: { wallets: WalletWithBalance[] }) {
  const { onModalSuccess } = useLayout()

  const [fromId,     setFromId]     = useState(wallets[0]?.id ?? '')
  const [toId,       setToId]       = useState(wallets[1]?.id ?? '')
  const [centStr,    setCentStr]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [success,    setSuccess]    = useState(false)
  const { format } = useCurrency(); 
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

  const fromWallet = wallets.find(w => w.id === fromId) ?? null
  const toOptions  = wallets.filter(w => w.id !== fromId)

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
    !centStr || numericAmount <= 0 || submitting

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
          marginBottom: '12px',
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
            style={{ color: 'var(--steel)' }}
          />
        </div>
        {fromWallet && numericAmount > (fromWallet.currentBalance ?? 0) && numericAmount > 0 && (
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
          background: success ? 'var(--income)' : isDisabled ? 'var(--bg3)' : 'var(--forest)',
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

function AccountsSegment({ isDesktop }: { isDesktop: boolean }) {
  const { data: wallets = [], isLoading } = useWallets()
  const { data: netPosition, isLoading: netLoading } = useNetPosition()

  const { setModalSuccessHandler } = useLayout()   // ← add this

  const { refetch: refetchWallets }     = useWallets()
  const { refetch: refetchNetPosition } = useNetPosition()

  const refetchAll = useCallback(() => {
    refetchWallets()
    refetchNetPosition()
  }, [refetchWallets, refetchNetPosition])

  useEffect(() => {
    setModalSuccessHandler(refetchAll)
    return () => setModalSuccessHandler(null)
  }, [refetchAll])

  // Modal state — transfer modal used on mobile only
  const [addOpen,        setAddOpen]        = useState(false)
  const [editTarget,     setEditTarget]     = useState<WalletWithBalance | null>(null)
  const [archiveTarget,  setArchiveTarget]  = useState<WalletWithBalance | null>(null)
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
        <>
          <WalletTable
            wallets={wallets}
            onEdit={wallet => setEditTarget(wallet)}
            onArchive={wallet => setArchiveTarget(wallet)}
            onTransfer={isDesktop ? undefined : wallet => setTransferSource(wallet)}
          />
        </>
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
      {/* Transfer modal — mobile only */}
      {!isDesktop && (
        <TransferModal isOpen={transferSource !== null} onClose={() => setTransferSource(null)} allWallets={wallets} sourceWallet={transferSource} />
      )}
    </>
  )

  if (isDesktop) {
    return (
      <>
        <div className="flex gap-5">
          {/* Left — wallet table */}
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

          {/* Right — net position + inline transfer */}
          <div className="w-[280px] shrink-0 flex flex-col gap-4">
            <NetPositionCard netPosition={netPosition ?? null} isLoading={netLoading} />
            {wallets.length >= 2 && <InlineTransferPanel wallets={wallets} />}
          </div>
        </div>
        {modals}
      </>
    )
  }

  // ── Mobile ──
  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Net position */}
        <NetPositionCard netPosition={netPosition ?? null} isLoading={netLoading} />

        {/* Wallet table card */}
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

// ═══════════════════════════════════════════════════════════════
// BUDGETS SEGMENT
// ═══════════════════════════════════════════════════════════════

function BudgetsSegment() {
  const now         = new Date()
  const periodStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const periodEnd   = format(endOfMonth(now), 'yyyy-MM-dd')
  const periodLabel = format(now, 'MMMM yyyy')

  const setPeriod = useBudgetStore(s => s.setPeriod)
  useEffect(() => {
    setPeriod(periodStart, periodEnd)
  }, [periodStart, periodEnd])

  const { data: envelopes = [], isLoading } = useBudgets(periodStart, periodEnd)
  const onTrackCount   = useBudgetStore(s => s.onTrackCount)
  const totalEnvelopes = useBudgetStore(s => s.totalEnvelopes)

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">
        <BudgetEnvelopes
          envelopes={envelopes}
          isLoading={isLoading}
          periodLabel={periodLabel}
          onTrackCount={onTrackCount}
          totalEnvelopes={totalEnvelopes}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// GROUPS SEGMENT
// ═══════════════════════════════════════════════════════════════

function GroupsSegment({ isDesktop }: { isDesktop: boolean }) {
  const { data: groups = [], isLoading } = useGroups()
  const activeGroupId = useGroupStore(s => s.activeGroupId)

  useGroupBalance(activeGroupId)
  useNetGroupPosition()

  if (isDesktop) {
    return (
      <div className="flex gap-5">
        <div className="flex-1 min-w-0">
          <GroupsOverview groups={groups} isLoading={isLoading} />
        </div>
        <div className="w-[280px] shrink-0">
          <DebtSummary groupId={activeGroupId} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <GroupsOverview groups={groups} isLoading={isLoading} />
      <DebtSummary groupId={activeGroupId} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// WALLET PAGE
// ═══════════════════════════════════════════════════════════════

export default function WalletPage() {
  const [segment, setSegment] = useState<WalletSegment>('accounts')
  const { setPageTitle }      = useLayout()
  const isDesktop             = useIsDesktop()

  useEffect(() => {
    setPageTitle('Wallet')
  }, [setPageTitle])

  if (isDesktop) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
        <div
          className="flex items-center justify-between px-8 py-5 border-b shrink-0"
          style={{ borderColor: 'var(--bg3)', background: 'var(--bg)' }}
        >
          <h1
            className="font-lora font-bold text-[1.5rem]"
            style={{ color: 'var(--ink)' }}
          >
            Wallet
          </h1>
          <SegmentedControl active={segment} onChange={setSegment} />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-5">
          {segment === 'accounts' && <AccountsSegment isDesktop />}
          {segment === 'budgets'  && <BudgetsSegment />}
          {segment === 'groups'   && <GroupsSegment isDesktop />}
        </div>
      </div>
    )
  }

  // ── Mobile ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center justify-between">
        <h1
          className="font-lora font-bold text-[1.4rem] leading-tight"
          style={{ color: 'var(--ink)' }}
        >
          Wallet
        </h1>
      </div>

      <SegmentedControl active={segment} onChange={setSegment} />

      {segment === 'accounts' && <AccountsSegment isDesktop={false} />}
      {segment === 'budgets'  && <BudgetsSegment />}
      {segment === 'groups'   && <GroupsSegment isDesktop={false} />}
    </div>
  )
}