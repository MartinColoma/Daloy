import { useState, useEffect, useCallback } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import ModalShell from "../../ModalShell";
import { useLayout } from '../../../../layouts/LayoutContext'
import walletService from '../../../../services/wallet/walletService'
import type { WalletWithBalance } from '../../../../types'

interface Props {
  isOpen:        boolean
  sourceWallet:  WalletWithBalance | null   // pre-seeded "from" wallet
  allWallets:    WalletWithBalance[]
  onClose:       () => void
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function WalletTransferModal({ isOpen, sourceWallet, allWallets, onClose }: Props) {
  const { onModalSuccess } = useLayout()

  const [fromId,   setFromId]   = useState<string>('')
  const [toId,     setToId]     = useState<string>('')
  const [centStr,  setCentStr]  = useState('')
  const [note,     setNote]     = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const numericAmount = centStr ? parseInt(centStr, 10) / 100 : 0
  const displayAmount = centStr
    ? (parseInt(centStr, 10) / 100).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : ''

  // Pre-seed source wallet when modal opens
  useEffect(() => {
    if (!isOpen) return
    setFromId(sourceWallet?.id ?? (allWallets[0]?.id ?? ''))
    setToId('')
    setCentStr('')
    setNote('')
    setError(null)
  }, [isOpen, sourceWallet])

  const fromWallet = allWallets.find(w => w.id === fromId) ?? null
  const toWallet   = allWallets.find(w => w.id === toId)   ?? null

  // Available destinations = all wallets except source
  const toOptions = allWallets.filter(w => w.id !== fromId)

  const handleBalanceKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setCentStr(prev => prev.slice(0, -1))
    } else if (/^\d$/.test(e.key)) {
      setCentStr(prev => {
        const next = (prev + e.key).replace(/^0+/, '') || ''
        if (parseInt(next, 10) > 99_999_999_999) return prev
        return next
      })
    }
    e.preventDefault()
  }, [])

  const isDisabled =
    !fromId ||
    !toId ||
    fromId === toId ||
    !centStr ||
    numericAmount <= 0 ||
    submitting

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (isDisabled) return
    setSubmitting(true)
    setError(null)
    try {
      await walletService.transfer({
        fromWalletId: fromId,
        toWalletId:   toId,
        amount:       numericAmount,
        description:  note.trim() || undefined,
      })
      onModalSuccess?.()
      handleClose()
    } catch {
      setError('Transfer failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Funds"
      subtitle="Move money between your wallets"
      icon={<ArrowLeftRight size={18} strokeWidth={1.5} />}
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

        {/* From → To selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: '8px' }}>
          <div className="daloy-field">
            <label className="daloy-label">From</label>
            <select
              className="daloy-select"
              value={fromId}
              onChange={e => {
                setFromId(e.target.value)
                if (toId === e.target.value) setToId('')
              }}
            >
              <option value="" disabled>Select wallet</option>
              {allWallets.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
            {fromWallet && (
              <p className="daloy-hint" style={{ marginTop: '4px' }}>
                Balance: {fromWallet.currency} {fmt(fromWallet.currentBalance ?? 0)}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: fromWallet ? '22px' : '2px',
          }}>
            <ArrowLeftRight size={16} style={{ color: 'var(--ink4)' }} />
          </div>

          <div className="daloy-field">
            <label className="daloy-label">To</label>
            <select
              className="daloy-select"
              value={toId}
              onChange={e => setToId(e.target.value)}
            >
              <option value="" disabled>Select wallet</option>
              {toOptions.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
            {toWallet && (
              <p className="daloy-hint" style={{ marginTop: '4px' }}>
                Balance: {toWallet.currency} {fmt(toWallet.currentBalance ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="daloy-field">
          <label className="daloy-label">Amount</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.85rem',
              color: 'var(--ink3)',
              flexShrink: 0,
            }}>
              {fromWallet?.currency ?? 'PHP'}
            </span>
            <input
              className="daloy-input-mono"
              type="text"
              inputMode="numeric"
              placeholder="0.00"
              value={displayAmount}
              onKeyDown={handleBalanceKey}
              onChange={() => {}}
              style={{ color: 'var(--steel)', transition: 'color 0.15s' }}
            />
          </div>
          {fromWallet && numericAmount > (fromWallet.currentBalance ?? 0) && (
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.78rem',
              color: 'var(--expense)',
              marginTop: '4px',
            }}>
              Amount exceeds available balance.
            </p>
          )}
        </div>

        {/* Note (optional) */}
        <div className="daloy-field">
          <label className="daloy-label">
            Note{' '}
            <span style={{ color: 'var(--ink4)', fontWeight: 400, fontSize: '0.75rem' }}>optional</span>
          </label>
          <input
            className="daloy-input"
            type="text"
            placeholder="e.g. Topping up GCash"
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isDisabled) handleSubmit() }}
          />
        </div>

        {/* Transfer preview */}
        {fromWallet && toWallet && numericAmount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'var(--steel-bg)',
            border: '1.5px solid var(--steel-m)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'var(--ink4)', margin: '0 0 2px' }}>From</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                {fromWallet.icon} {fromWallet.name}
              </p>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.92rem', fontWeight: 500, color: 'var(--steel)', margin: 0 }}>
                {fromWallet.currency} {fmt(numericAmount)}
              </p>
              <ArrowLeftRight size={13} style={{ color: 'var(--steel-m)', marginTop: '2px' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'var(--ink4)', margin: '0 0 2px' }}>To</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                {toWallet.icon} {toWallet.name}
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
            {submitting ? 'Transferring…' : 'Confirm Transfer'}
          </button>
        </div>

      </div>
    </ModalShell>
  )
}