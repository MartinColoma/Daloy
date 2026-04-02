import { useState } from 'react'
import { Archive } from 'lucide-react'
import ModalShell from "../../ModalShell";
import { useLayout } from '../../../../layouts/LayoutContext'
import walletService from '../../../../services/wallet/walletService'
import type { WalletWithBalance } from '../../../../types'

interface Props {
  isOpen:  boolean
  wallet:  WalletWithBalance | null
  onClose: () => void
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function ArchiveWalletModal({ isOpen, wallet, onClose }: Props) {
  const { onModalSuccess } = useLayout()

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleArchive = async () => {
    if (!wallet || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await walletService.archiveWallet(wallet.id)
      onModalSuccess?.()
      handleClose()
    } catch {
      setError('Failed to archive wallet. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!wallet) return null

  const hasBalance = (wallet.currentBalance ?? 0) !== 0

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Archive Wallet"
      subtitle="This wallet will be hidden from your dashboard"
      icon={<Archive size={18} strokeWidth={1.5} />}
      accentColor="var(--expense)"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {error && (
          <p style={{
            padding: '10px 12px',
            background: 'var(--clay-bg)',
            border: '1.5px solid var(--clay-m)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--clay)',
            fontSize: '0.82rem',
            fontFamily: 'Outfit, sans-serif',
            margin: 0,
          }}>
            {error}
          </p>
        )}

        {/* Wallet preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          background: 'var(--bg2)',
          border: '1.5px solid var(--bg3)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{wallet.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: 0,
            }}>
              {wallet.name}
            </p>
            <p style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.72rem',
              color: 'var(--ink4)',
              margin: 0,
            }}>
              {wallet.currency}
            </p>
          </div>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: (wallet.currentBalance ?? 0) >= 0 ? 'var(--income)' : 'var(--expense)',
          }}>
            {fmt(wallet.currentBalance ?? 0)}
          </span>
        </div>

        {/* Warning if balance is non-zero */}
        {hasBalance && (
          <div style={{
            padding: '10px 14px',
            background: '#FFF8F0',
            border: '1.5px solid var(--clay-m)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            gap: '8px',
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.82rem',
              color: 'var(--clay)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              This wallet still has a balance of{' '}
              <strong>{wallet.currency} {fmt(wallet.currentBalance ?? 0)}</strong>.
              Consider transferring funds before archiving.
            </p>
          </div>
        )}

        {/* Explanation */}
        <p style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.83rem',
          color: 'var(--ink3)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          Archiving hides this wallet from your accounts view and net position. Your transaction history will be preserved. You can restore it later from Settings.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button className="daloy-btn-ghost" onClick={handleClose} style={{ flex: '0 0 auto' }}>
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleArchive}
            disabled={submitting}
            style={{
              flex: 1,
              background: submitting ? 'var(--bg3)' : 'var(--expense)',
              color:      submitting ? 'var(--ink4)' : 'white',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {submitting ? 'Archiving…' : 'Archive Wallet'}
          </button>
        </div>

      </div>
    </ModalShell>
  )
}