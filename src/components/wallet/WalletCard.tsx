import type { WalletWithBalance } from '../../types'

interface WalletCardProps {
  wallet: WalletWithBalance
}

// Brand colors per wallet type/name — matches design spec
const BRAND_COLORS: Record<string, string> = {
  bpi: 'var(--ink)',
  gcash: '#005CFF',
  maya: '#00A862',
  cash: '#5C4033',
}

function getCardColor(name: string): string {
  const key = name.toLowerCase()
  for (const brand in BRAND_COLORS) {
    if (key.includes(brand)) return BRAND_COLORS[brand]
  }
  return 'var(--ink2)'
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function WalletCard({ wallet }: WalletCardProps) {
  const cardColor = getCardColor(wallet.name)

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: cardColor }}
    >
      {/* Left — icon + name */}
      <div className="flex items-center gap-3">
        {wallet.icon && (
          <span className="text-[1.1rem] leading-none">{wallet.icon}</span>
        )}
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[0.85rem] font-medium leading-tight"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Outfit, sans-serif' }}
          >
            {wallet.name}
          </span>
          <span
            className="text-[0.65rem] uppercase tracking-[0.1em]"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {wallet.currency}
          </span>
        </div>
      </div>

      {/* Right — balance */}
      <span
        className="text-[1rem] font-medium"
        style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {formatAmount(wallet.currentBalance)}
      </span>
    </div>
  )
}