import { useState } from 'react'
import { Pencil, ArrowLeftRight, Archive, MoreHorizontal } from 'lucide-react'
import type { WalletWithBalance } from '../../types'

interface WalletTableProps {
  wallets:     WalletWithBalance[]
  onEdit:      (wallet: WalletWithBalance) => void
  onArchive:   (wallet: WalletWithBalance) => void
  onTransfer?: (wallet: WalletWithBalance) => void
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/* ==============================
   ROW COMPONENT (isolated state)
   ============================== */
function WalletRow({
  wallet,
  isFirst,
  isLast,
  onEdit,
  onArchive,
  onTransfer,
}: {
  wallet: WalletWithBalance
  isFirst: boolean
  isLast: boolean
  onEdit: (wallet: WalletWithBalance) => void
  onArchive: (wallet: WalletWithBalance) => void
  onTransfer?: (wallet: WalletWithBalance) => void
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  type MenuItem = {
    icon:   React.ReactNode
    label:  string
    color:  string
    action: () => void
  }

  const menuItems: MenuItem[] = [
    {
      icon:   <Pencil size={13} />,
      label:  'Edit Wallet',
      color:  'var(--ink)',
      action: () => { onEdit(wallet); closeMenu() },
    },
    ...(onTransfer
      ? [{
          icon:   <ArrowLeftRight size={13} />,
          label:  'Transfer Funds',
          color:  'var(--steel)',
          action: () => { onTransfer(wallet); closeMenu() },
        }]
      : []
    ),
    {
      icon:   <Archive size={13} />,
      label:  'Archive Wallet',
      color:  'var(--expense)',
      action: () => { onArchive(wallet); closeMenu() },
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1.4fr auto',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '12px',
        background: '#FFFFFF',
        borderBottom: isLast ? 'none' : '1px solid var(--bg3)',
        borderRadius: isFirst && isLast
          ? 'var(--radius-md)'
          : isFirst
          ? 'var(--radius-md) var(--radius-md) 0 0'
          : isLast
          ? '0 0 var(--radius-md) var(--radius-md)'
          : 0,
        position: 'relative',
        zIndex: isMenuOpen ? 30 : 1,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
      onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
    >
      {/* Wallet name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <span
          style={{
            fontSize: '1.15rem',
            lineHeight: 1,
            flexShrink: 0,
            width: '28px',
            textAlign: 'center',
          }}
        >
          {wallet.icon}
        </span>
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.88rem',
            fontWeight: 500,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {wallet.name}
        </span>
      </div>

      {/* Currency */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: 'var(--ink3)',
          background: 'var(--bg2)',
          borderRadius: '4px',
          padding: '2px 7px',
          width: 'fit-content',
        }}
      >
        {wallet.currency}
      </span>

      {/* Balance */}
      <span
        style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '0.9rem',
          fontWeight: 500,
          color: (wallet.currentBalance ?? 0) >= 0 ? 'var(--income)' : 'var(--expense)',
          textAlign: 'right',
          letterSpacing: '0.02em',
        }}
      >
        {fmt(wallet.currentBalance ?? 0)}
      </span>

      {/* Actions */}
      <div style={{ position: 'relative', width: '32px' }}>
        <button
          onClick={() => setIsMenuOpen(prev => !prev)}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: isMenuOpen ? 'var(--bg3)' : 'transparent',
            color: 'var(--ink3)',
            cursor: 'pointer',
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        {isMenuOpen && (
          <>
            {/* Backdrop (scoped per row but still works fine) */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 20 }}
              onClick={closeMenu}
            />

            {/* Dropdown */}
            <div
              style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                zIndex: 40,
                background: '#FFFFFF',
                border: '1.5px solid var(--bg3)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                minWidth: '164px',
                overflow: 'hidden',
              }}
            >
              {menuItems.map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 14px',
                    border: 'none',
                    background: 'transparent',
                    color: item.color,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.83rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ opacity: 0.75 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ==============================
   TABLE COMPONENT
   ============================== */
export function WalletTable({ wallets, onEdit, onArchive, onTransfer }: WalletTableProps) {
  const totalBalance = wallets.reduce((sum, w) => sum + (w.currentBalance ?? 0), 0)

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1.4fr auto',
          alignItems: 'center',
          padding: '6px 16px',
          gap: '12px',
        }}
      >
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink4)' }}>
          Wallet
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink4)' }}>
          Currency
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink4)', textAlign: 'right' }}>
          Balance
        </span>
        <span style={{ width: '32px' }} />
      </div>

      {/* Rows */}
      <div
        style={{
          border: '1.5px solid var(--bg3)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {wallets.map((wallet, i) => (
          <WalletRow
            key={wallet.id}
            wallet={wallet}
            isFirst={i === 0}
            isLast={i === wallets.length - 1}
            onEdit={onEdit}
            onArchive={onArchive}
            onTransfer={onTransfer}
          />
        ))}

        {/* Total */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.4fr auto',
            alignItems: 'center',
            padding: '11px 16px',
            gap: '12px',
            background: 'var(--forest-bg)',
            borderTop: '2px solid var(--forest-xl)',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          }}
        >
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--forest)',
            }}
          >
            Total
          </span>
          <span />
          <span
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--forest)',
              textAlign: 'right',
            }}
          >
            {fmt(totalBalance)}
          </span>
          <span style={{ width: '32px' }} />
        </div>
      </div>
    </div>
  )
}