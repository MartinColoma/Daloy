import type { NetPosition } from '../../../services/wallet/walletService'
import { useCurrency } from "../../../hooks/useCurrency";

interface NetPositionCardProps {
  netPosition: NetPosition | null
  isLoading: boolean
}

export function NetPositionCard({ netPosition, isLoading }: NetPositionCardProps) {
  const { format } = useCurrency(); // ← add
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
    >
      <p
        className="text-[0.65rem] uppercase tracking-[0.18em] mb-4"
        style={{ color: 'var(--ink4)', fontFamily: 'IBM Plex Mono, monospace' }}
      >
        Net Position
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-5 rounded animate-pulse"
              style={{ background: 'var(--bg2)' }}
            />
          ))}
        </div>
      ) : netPosition ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className="text-[0.82rem]"
              style={{ color: 'var(--ink3)', fontFamily: 'Outfit, sans-serif' }}
            >
              Total Assets
            </span>
            <span
              className="text-[0.88rem] font-medium"
              style={{ color: 'var(--income)', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {format(netPosition.totalAssets)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-[0.82rem]"
              style={{ color: 'var(--ink3)', fontFamily: 'Outfit, sans-serif' }}
            >
              Total Owed
            </span>
            <span
              className="text-[0.88rem] font-medium"
              style={{ color: 'var(--expense)', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              −{format(netPosition.totalOwed)}
            </span>
          </div>

          <div className="h-px" style={{ background: 'var(--bg3)' }} />

          <div className="flex items-center justify-between">
            <span
              className="text-[0.9rem] font-semibold"
              style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
            >
              Net Worth
            </span>
            <span
              className="text-[1rem] font-medium"
              style={{
                color: netPosition.net >= 0 ? 'var(--income)' : 'var(--expense)',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {format(netPosition.net)}
            </span>
          </div>
        </div>
      ) : (
        <p
          className="text-[0.82rem] text-center py-4"
          style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
        >
          Add a wallet to see your net position.
        </p>
      )}
    </div>
  )
}