import { useGroupBalance, useSimplifiedDebts, useGroupExpenses } from '../../../hooks/home/useGroups'
import { GroupExpenseList } from './GroupExpenseList'

interface DebtSummaryProps {
  groupId: string | null
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function DebtSummary({ groupId }: DebtSummaryProps) {
  const { data: balance, isLoading: balanceLoading } = useGroupBalance(groupId)
  const { data: simplifiedDebts = [], isLoading: debtsLoading } = useSimplifiedDebts(groupId ?? '')
  const { data: expenses = [], isLoading: expensesLoading } = useGroupExpenses(groupId ?? '')

  if (!groupId) {
    return (
      <div
        className="rounded-xl p-5 flex items-center justify-center"
        style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)', minHeight: 200 }}
      >
        <p
          className="text-[0.82rem] text-center"
          style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
        >
          Select a group to see details.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Balance card */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
      >
        <p
          className="text-[0.65rem] uppercase tracking-[0.18em] mb-3"
          style={{ color: 'var(--ink4)', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          Your Balance
        </p>

        {balanceLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 rounded animate-pulse" style={{ background: 'var(--bg2)' }} />
            ))}
          </div>
        ) : balance ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-[0.78rem]" style={{ color: 'var(--ink3)', fontFamily: 'Outfit, sans-serif' }}>
                You owe
              </span>
              <span className="text-[0.85rem] font-medium" style={{ color: 'var(--expense)', fontFamily: 'IBM Plex Mono, monospace' }}>
                ₱{fmt(balance.youOwe)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[0.78rem]" style={{ color: 'var(--ink3)', fontFamily: 'Outfit, sans-serif' }}>
                Owed to you
              </span>
              <span className="text-[0.85rem] font-medium" style={{ color: 'var(--income)', fontFamily: 'IBM Plex Mono, monospace' }}>
                ₱{fmt(balance.owedToYou)}
              </span>
            </div>
            <div className="h-px" style={{ background: 'var(--bg3)' }} />
            <div className="flex justify-between">
              <span className="text-[0.85rem] font-semibold" style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                Net
              </span>
              <span
                className="text-[0.95rem] font-medium"
                style={{
                  color: balance.net >= 0 ? 'var(--income)' : 'var(--expense)',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                {balance.net >= 0 ? '+' : '−'}₱{fmt(Math.abs(balance.net))}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Simplified debts */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
      >
        <p
          className="text-[0.65rem] uppercase tracking-[0.18em] mb-3"
          style={{ color: 'var(--ink4)', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          Settle Up
        </p>

        {debtsLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'var(--bg2)' }} />
            ))}
          </div>
        ) : simplifiedDebts.length === 0 ? (
          <p className="text-[0.82rem]" style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}>
            All settled up ✓
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {simplifiedDebts.map((debt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--bg2)' }}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className="text-[0.78rem] font-medium truncate"
                    style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                  >
                    {debt.fromName}
                  </span>
                  <span
                    className="text-[0.65rem]"
                    style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
                  >
                    → {debt.toName}
                  </span>
                </div>
                <span
                  className="text-[0.85rem] font-medium shrink-0 ml-2"
                  style={{ color: 'var(--expense)', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  ₱{fmt(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent group expenses */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
      >
        <p
          className="text-[0.65rem] uppercase tracking-[0.18em] mb-3"
          style={{ color: 'var(--ink4)', fontFamily: 'IBM Plex Mono, monospace' }}
        >
          Recent Expenses
        </p>
        <GroupExpenseList
          expenses={expenses.slice(0, 5)}
          isLoading={expensesLoading}
        />
      </div>
    </div>
  )
}