import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

// ── Stores ────────────────────────────────────────────────────────────────────
import { useBudgetStore } from '../../stores/budgetStore'
import { useGroupStore } from '../../stores/groupStore'

// ── Hooks (src/hooks/ — domain hooks only, no barrel) ────────────────────────
import { useWallets, useNetPosition } from '../../hooks/useWallets'
import { useBudgets } from '../../hooks/useBudgets'
import { useGroups, useGroupBalance, useNetGroupPosition } from '../../hooks/useGroups'

// ── Components — wallet/ ──────────────────────────────────────────────────────
import { WalletCard } from '../../components/wallet/WalletCard'
import { NetPositionCard } from '../../components/wallet/NetPositionCard'
import { BudgetEnvelopes } from '../../components/wallet/BudgetEnvelopes'
import { GroupsOverview } from '../../components/wallet/GroupsOverview'

// ── Components — groups/ (right panel for Groups segment) ────────────────────
import { DebtSummary } from '../../components/groups/DebtSummary'

// ─── Types ────────────────────────────────────────────────────────────────────

type WalletSegment = 'accounts' | 'budgets' | 'groups'

// ─── Segmented Control ────────────────────────────────────────────────────────

interface SegmentedControlProps {
  active: WalletSegment
  onChange: (s: WalletSegment) => void
}

function SegmentedControl({ active, onChange }: SegmentedControlProps) {
  const tabs: { key: WalletSegment; label: string }[] = [
    { key: 'accounts', label: 'Accounts' },
    { key: 'budgets', label: 'Budgets' },
    { key: 'groups', label: 'Groups' },
  ]

  return (
    <div
      className="inline-flex rounded-full p-[3px] gap-[2px]"
      style={{ background: 'var(--bg2)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="px-4 py-1.5 rounded-full text-[0.82rem] font-medium transition-all"
            style={{
              background: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? 'var(--ink)' : 'var(--ink4)',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Accounts Segment ─────────────────────────────────────────────────────────

function AccountsSegment() {
  const { data: wallets = [], isLoading } = useWallets()
  const { data: netPosition, isLoading: netLoading } = useNetPosition()

  return (
    <div className="flex gap-5">
      {/* Left — wallet list */}
      <div className="flex-1 min-w-0">
        <div
          className="rounded-xl p-5"
          style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[1rem] font-semibold"
              style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
            >
              My Accounts
            </h2>
            <button
              className="text-[0.78rem] font-medium"
              style={{ color: 'var(--forest)', fontFamily: 'Outfit, sans-serif' }}
            >
              + Add Wallet
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl animate-pulse"
                  style={{ background: 'var(--bg2)' }}
                />
              ))}
            </div>
          ) : wallets.length === 0 ? (
            <p
              className="text-[0.85rem] py-6 text-center"
              style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
            >
              No wallets yet. Add one to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — net position */}
      <div className="w-[280px] shrink-0">
        <NetPositionCard netPosition={netPosition ?? null} isLoading={netLoading} />
      </div>
    </div>
  )
}

// ─── Budgets Segment ──────────────────────────────────────────────────────────

function BudgetsSegment() {
  const now = new Date()
  const periodStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const periodEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const periodLabel = format(now, 'MMMM yyyy')

  const setPeriod = useBudgetStore((s) => s.setPeriod)
  useEffect(() => {
    setPeriod(periodStart, periodEnd)
  }, [periodStart, periodEnd])

  const { data: envelopes = [], isLoading } = useBudgets(periodStart, periodEnd)
  const onTrackCount = useBudgetStore((s) => s.onTrackCount)
  const totalEnvelopes = useBudgetStore((s) => s.totalEnvelopes)

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

// ─── Groups Segment ───────────────────────────────────────────────────────────

function GroupsSegment() {
  const { data: groups = [], isLoading } = useGroups()
  const activeGroupId = useGroupStore((s) => s.activeGroupId)

  useGroupBalance(activeGroupId)
  useNetGroupPosition()

  return (
    <div className="flex gap-5">
      {/* Left — groups list */}
      <div className="flex-1 min-w-0">
        <GroupsOverview groups={groups} isLoading={isLoading} />
      </div>

      {/* Right — debt summary for active group */}
      <div className="w-[280px] shrink-0">
        <DebtSummary groupId={activeGroupId} />
      </div>
    </div>
  )
}

// ─── WalletPage ───────────────────────────────────────────────────────────────

export default function WalletPage() {
  const [segment, setSegment] = useState<WalletSegment>('accounts')

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--bg3)', background: 'var(--bg)' }}
      >
        <h1
          className="text-[1.5rem] font-bold"
          style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}
        >
          Wallet
        </h1>
      </div>

      {/* Segmented control */}
      <div className="px-8 pt-5">
        <SegmentedControl active={segment} onChange={setSegment} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        {segment === 'accounts' && <AccountsSegment />}
        {segment === 'budgets' && <BudgetsSegment />}
        {segment === 'groups' && <GroupsSegment />}
      </div>
    </div>
  )
}