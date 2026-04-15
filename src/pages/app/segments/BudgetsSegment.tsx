import { useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

// ── Stores ────────────────────────────────────────────────────────────────────
import { useBudgetStore } from '../../../stores/budgetStore'

// ── Hooks ─────────────────────────────────────────────────────────────────────
import { useBudgets } from '../../../hooks/wallet/useBudgets'

// ── Components ────────────────────────────────────────────────────────────────
import { BudgetEnvelopes } from '../../../components/wallet/budgets/BudgetEnvelopes'

// ═══════════════════════════════════════════════════════════════
// BUDGETS SEGMENT
// ═══════════════════════════════════════════════════════════════

export function BudgetsSegment() {
  const now         = new Date()
  const periodStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const periodEnd   = format(endOfMonth(now), 'yyyy-MM-dd')
  const periodLabel = format(now, 'MMMM yyyy')

  const setPeriod      = useBudgetStore(s => s.setPeriod)
  const onTrackCount   = useBudgetStore(s => s.onTrackCount)
  const totalEnvelopes = useBudgetStore(s => s.totalEnvelopes)

  useEffect(() => {
    setPeriod(periodStart, periodEnd)
  }, [periodStart, periodEnd])

  const { data: envelopes = [], isLoading } = useBudgets(periodStart, periodEnd)

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