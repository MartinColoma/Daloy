import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import ModalShell from '../../ModalShell'
import { useLayout } from '../../../../layouts/LayoutContext'
import walletService from '../../../../services/wallet/walletService'
import type { WalletWithBalance } from '../../../../types'

const WALLET_ICONS = [
  { value: '💳', label: 'Card' },
  { value: '💵', label: 'Cash' },
  { value: '📱', label: 'E-Wallet' },
  { value: '🏦', label: 'Bank' },
  { value: '💰', label: 'Savings' },
  { value: '🪙', label: 'Coin' },
  { value: '🏧', label: 'ATM' },
  { value: '📊', label: 'Investment' },
]

const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'GBP', 'SGD', 'AUD']

interface Props {
  isOpen:  boolean
  wallet:  WalletWithBalance | null
  onClose: () => void
}

export default function EditWalletModal({ isOpen, wallet, onClose }: Props) {
  const { onModalSuccess } = useLayout()

  const [name,     setName]     = useState('')
  const [icon,     setIcon]     = useState('💳')
  const [currency, setCurrency] = useState('PHP')

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Sync fields when wallet changes
  useEffect(() => {
    if (!wallet) return
    setName(wallet.name)
    setIcon(wallet.icon ?? '💳')
    setCurrency(wallet.currency ?? 'PHP')
    setError(null)
  }, [wallet, isOpen])

  const hasChanged =
    wallet &&
    (name.trim() !== wallet.name ||
      icon !== (wallet.icon ?? '💳') ||
      currency !== (wallet.currency ?? 'PHP'))

  const isDisabled = !name.trim() || !hasChanged || submitting

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (isDisabled || !wallet) return
    setSubmitting(true)
    setError(null)
    try {
      await walletService.updateWallet(wallet.id, {
        name:     name.trim(),
        icon,
        currency,
      })
      onModalSuccess?.()
      handleClose()
    } catch {
      setError('Failed to update wallet. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Wallet"
      subtitle="Update name, icon, or currency"
      icon={<Pencil size={18} strokeWidth={1.5} />}
      accentColor="var(--steel)"
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

        {/* Icon picker */}
        <div className="daloy-field">
          <label className="daloy-label">Icon</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {WALLET_ICONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIcon(opt.value)}
                title={opt.label}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '1.2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: icon === opt.value
                    ? '2px solid var(--steel)'
                    : '1.5px solid var(--bg3)',
                  background: icon === opt.value ? 'var(--steel-bg)' : 'var(--bg2)',
                  cursor: 'pointer',
                  transition: 'border 0.15s, background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>

        {/* Name + currency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
          <div className="daloy-field">
            <label className="daloy-label">Wallet Name</label>
            <input
              className="daloy-input"
              type="text"
              placeholder="e.g. BPI Savings, GCash, Cash"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !isDisabled) handleSubmit() }}
            />
          </div>
          <div className="daloy-field">
            <label className="daloy-label">Currency</label>
            <select
              className="daloy-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ width: '90px' }}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        {name.trim() && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'var(--steel-bg)',
            border: '1.5px solid var(--steel-m)',
            borderRadius: 'var(--radius-md)',
            opacity: 0.85,
          }}>
            <span style={{ fontSize: '1.3rem' }}>{icon}</span>
            <div>
              <p style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--steel)',
                margin: 0,
              }}>
                {name}
              </p>
              <p style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '0.7rem',
                color: 'var(--steel-m)',
                margin: 0,
                letterSpacing: '0.05em',
              }}>
                {currency}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button className="daloy-btn-ghost" onClick={handleClose} style={{ flex: '0 0 auto' }}>
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleSubmit}
            disabled={isDisabled}
            style={{
              flex: 1,
              background: isDisabled ? 'var(--bg3)' : 'var(--steel)',
              color:      isDisabled ? 'var(--ink4)' : 'white',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </ModalShell>
  )
}