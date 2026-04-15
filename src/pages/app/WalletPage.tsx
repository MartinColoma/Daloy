import { useState, useEffect } from 'react'
import { useLayout }    from '../../layouts/LayoutContext'
import { useIsDesktop } from '../../hooks/media/useMediaQuery'

import { AccountsSegment } from './segments/AccountsSegment'
import { BudgetsSegment }  from './segments/BudgetsSegment'
import { ExpensesSegment } from './segments/ExpensesSegment'
import { IncomeSegment }   from './segments/IncomeSegment'

type WalletSegment = 'accounts' | 'budgets' | 'expenses' | 'income'

interface SegmentedControlProps {
  active:    WalletSegment
  onChange:  (s: WalletSegment) => void
  fullWidth?: boolean
}

function SegmentedControl({ active, onChange, fullWidth = false }: SegmentedControlProps) {
  const tabs: { key: WalletSegment; label: string }[] = [
    { key: 'accounts', label: 'Accounts' },
    { key: 'budgets',  label: 'Budgets'  },
    { key: 'expenses', label: 'Expenses' },
    { key: 'income',   label: 'Income'   },
  ]

  return (
    <div
      className="flex rounded-full p-[3px] gap-[2px]"
      style={{
        background: 'var(--bg2)',
        // On mobile: stretch to full width. On desktop: shrink to content.
        width: fullWidth ? '100%' : 'fit-content',
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="py-1.5 rounded-full text-[0.82rem] font-medium transition-all"
            style={{
              // flex-1 on mobile so all tabs share space equally
              flex: fullWidth ? 1 : undefined,
              padding: fullWidth ? '6px 0' : '6px 16px',
              background: isActive ? '#FFFFFF' : 'transparent',
              color:      isActive ? 'var(--ink)' : 'var(--ink4)',
              fontFamily: 'Outfit, sans-serif',
              boxShadow:  isActive ? 'var(--shadow-sm)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default function WalletPage() {
  const [segment, setSegment] = useState<WalletSegment>('accounts')
  const { setPageTitle }      = useLayout()
  const isDesktop             = useIsDesktop()

  useEffect(() => {
    setPageTitle('Wallet')
  }, [setPageTitle])

  const activeSegment = (
    <>
      {segment === 'accounts' && <AccountsSegment isDesktop={isDesktop} />}
      {segment === 'budgets'  && <BudgetsSegment />}
      {segment === 'expenses' && <ExpensesSegment isDesktop={isDesktop} />}
      {segment === 'income'   && <IncomeSegment   isDesktop={isDesktop} />}
    </>
  )

  // ── Desktop ────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
        <div
          className="flex items-center justify-between px-8 py-5 border-b shrink-0"
          style={{ borderColor: 'var(--bg3)', background: 'var(--bg)' }}
        >
          <h1 className="font-lora font-bold text-[1.5rem]" style={{ color: 'var(--ink)' }}>
            Wallet
          </h1>
          {/* Desktop: pill sizes to content naturally */}
          <SegmentedControl active={segment} onChange={setSegment} />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-5">
          {activeSegment}
        </div>
      </div>
    )
  }

  // ── Mobile ─────────────────────────────────────────────────────
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

      {/* Mobile: fullWidth so all 4 tabs share space equally */}
      <SegmentedControl active={segment} onChange={setSegment} fullWidth />

      {activeSegment}
    </div>
  )
}