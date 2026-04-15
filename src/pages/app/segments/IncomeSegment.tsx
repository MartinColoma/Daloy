import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'

// ── Modals ────────────────────────────────────────────────────────────────────
import LogIncomeModal from '../../../components/modals/QuickActions/LogIncomeModal'

// ─── Summary Chip ─────────────────────────────────────────────────────────────
function SummaryChip({ label, amount, color, bgColor }: {
  label:   string
  amount:  number
  color:   string
  bgColor: string
}) {
  const display = amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div
      className="flex flex-col gap-[2px] px-4 py-3 rounded-[var(--radius-md)]"
      style={{ background: bgColor }}
    >
      <span style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.72rem',
        fontWeight: 500,
        color: 'var(--ink3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '1.1rem',
        fontWeight: 500,
        color,
      }}>
        ₱{display}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// INCOME SEGMENT
// ═══════════════════════════════════════════════════════════════

interface IncomeSegmentProps {
  isDesktop: boolean
}

export function IncomeSegment({ isDesktop }: IncomeSegmentProps) {
  const now         = new Date()
  const periodLabel = format(now, 'MMMM yyyy')

  const [addOpen, setAddOpen] = useState(false)

  const addButton = (
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
      {isDesktop ? 'Log Income' : 'Log'}
    </button>
  )

  const emptyState = (
    <div style={{
      padding: '48px 20px',
      textAlign: 'center',
      color: 'var(--ink4)',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.85rem',
    }}>
      No income recorded for {periodLabel}.
    </div>
  )

  const summaryRow = (
    <SummaryChip
      label="Total Income"
      amount={0}
      color="var(--income)"
      bgColor="var(--forest-bg)"
    />
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
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[1rem] font-semibold"
                  style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                >
                  Income — {periodLabel}
                </h2>
                {addButton}
              </div>
              {emptyState}
            </div>
          </div>

          <div className="w-[280px] shrink-0 flex flex-col gap-4">
            <div
              className="rounded-xl p-5"
              style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
            >
              <p
                className="text-[0.78rem] font-medium mb-3"
                style={{
                  color: 'var(--ink3)',
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                This Month
              </p>
              {summaryRow}
            </div>
          </div>
        </div>

        <LogIncomeModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      </>
    )
  }

  // ── Mobile ─────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-4">
        {summaryRow}

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
              Income
            </p>
            {addButton}
          </div>

          <div style={{ padding: '12px' }}>
            {emptyState}
          </div>
        </div>
      </div>

      <LogIncomeModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}