import type { BudgetUsage } from '@/types'

interface BudgetEnvelopesProps {
  envelopes: BudgetUsage[]
  isLoading: boolean
  periodLabel: string
  onTrackCount: number
  totalEnvelopes: number
}

function getBarColor(percentUsed: number): string {
  if (percentUsed >= 100) return 'var(--expense)'
  if (percentUsed >= 75) return '#C4913A'
  return 'var(--forest-l)'
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BudgetEnvelopes({
  envelopes,
  isLoading,
  periodLabel,
  onTrackCount,
  totalEnvelopes,
}: BudgetEnvelopesProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2
          className="text-[1rem] font-semibold"
          style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
        >
          {periodLabel}
        </h2>
        {!isLoading && totalEnvelopes > 0 && (
          <span
            className="text-[0.72rem] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--forest-bg)',
              color: 'var(--forest)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {onTrackCount}/{totalEnvelopes} on track
          </span>
        )}
      </div>

      {/* Envelope list */}
      {isLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'var(--bg2)' }} />
              <div className="h-[6px] w-full rounded-full animate-pulse" style={{ background: 'var(--bg2)' }} />
            </div>
          ))}
        </div>
      ) : envelopes.length === 0 ? (
        <p
          className="text-[0.85rem] text-center py-8"
          style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
        >
          No budget envelopes yet. Set limits via Quick Actions → Budget Limits.
        </p>
      ) : (
        <div className="flex flex-col gap-5 mt-4">
          {envelopes.map((envelope) => {
            const pct = Math.min(envelope.percentUsed, 100)
            const barColor = getBarColor(envelope.percentUsed)
            const isOver = envelope.percentUsed >= 100

            return (
              <div key={envelope.id} className="flex flex-col gap-1.5">
                {/* Top row — category + amounts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {envelope.category.icon && (
                      <span className="text-[0.9rem] leading-none">{envelope.category.icon}</span>
                    )}
                    <span
                      className="text-[0.85rem] font-medium"
                      style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                    >
                      {envelope.category.name}
                    </span>
                  </div>
                  <span
                    className="text-[0.78rem]"
                    style={{
                      color: isOver ? 'var(--expense)' : 'var(--ink3)',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  >
                    {fmt(envelope.spent)} / {fmt(envelope.amountLimit)}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 6, background: 'var(--bg3)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>

                {/* Bottom row — remaining */}
                <span
                  className="text-[0.72rem]"
                  style={{
                    color: isOver ? 'var(--expense)' : 'var(--ink4)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {isOver
                    ? `Over by ₱${fmt(Math.abs(envelope.remaining))}`
                    : `₱${fmt(envelope.remaining)} remaining`}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}