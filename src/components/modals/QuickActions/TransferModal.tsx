import { useState, useEffect, useCallback } from 'react'
import { ArrowLeftRight, ArrowDown } from 'lucide-react'
import ModalShell from '../ModalShell'
import { useLayout } from '../../../layouts/LayoutContext'
import walletService from '../../../services/wallet/walletService'
import type { WalletWithBalance } from '../../../types'

/* ─────────────────────────────────────────────
   TransferModal.tsx
   Canonical transfer modal used everywhere:
   — Quick Actions sheet (no pre-seeded wallet)
   — WalletPage mobile transfer (pre-seeded source)
   DB writes to: transactions (type='transfer')
   Fields: wallet_id (from), to_wallet_id,
           amount, description, transacted_at
   Rule: net zero across both wallets
───────────────────────────────────────────── */

interface Props {
  isOpen:       boolean
  onClose:      () => void
  allWallets:   WalletWithBalance[]
  sourceWallet?: WalletWithBalance | null   // pre-seeds "From" when provided
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export default function TransferModal({ isOpen, onClose, allWallets, sourceWallet }: Props) {
  const { onModalSuccess } = useLayout()

  const [fromId,     setFromId]     = useState<string>('')
  const [toId,       setToId]       = useState<string>('')
  const [centStr,    setCentStr]    = useState('')
  const [note,       setNote]       = useState('')
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Reset state on open, pre-seed source wallet if provided
  useEffect(() => {
    if (!isOpen) return
    setFromId(sourceWallet?.id ?? allWallets[0]?.id ?? '')
    setToId('')
    setCentStr('')
    setNote('')
    setDate(new Date().toISOString().split('T')[0])
    setError(null)
  }, [isOpen, sourceWallet])

  const numericAmount = centStr ? parseInt(centStr, 10) / 100 : 0
  const displayAmount = centStr
    ? (parseInt(centStr, 10) / 100).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : ''

  const fromWallet   = allWallets.find(w => w.id === fromId) ?? null
  const toWallet     = allWallets.find(w => w.id === toId)   ?? null
  const toOptions    = allWallets.filter(w => w.id !== fromId)
  const overBalance  = fromWallet !== null && numericAmount > (fromWallet.currentBalance ?? 0) && numericAmount > 0

  const handleAmountKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const swap = () => {
    if (!toId) return
    setFromId(toId)
    setToId(fromId)
  }

  const isDisabled =
    !fromId ||
    !toId ||
    fromId === toId ||
    !centStr ||
    numericAmount <= 0 ||
    overBalance ||
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
      title="Transfer"
      subtitle="Move money between wallets"
      icon={<ArrowLeftRight size={18} strokeWidth={1.5} />}
      accentColor="var(--steel-m)"
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

        {/* Amount — first, like quick action modal */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">Amount</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.82rem',
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
              onKeyDown={handleAmountKey}
              onChange={() => {}}
              style={{ color: overBalance ? 'var(--expense)' : 'var(--ink)' }}
            />
          </div>
          {overBalance && (
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--expense)', margin: '4px 0 0' }}>
              Exceeds {fromWallet!.icon} {fromWallet!.name} balance of {fromWallet!.currency} {fmt(fromWallet!.currentBalance ?? 0)}
            </p>
          )}
        </div>

        {/* From / Swap / To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

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
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name} — {w.currency} {fmt(w.currentBalance ?? 0)}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button — disabled if no destination selected yet */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={swap}
              disabled={!toId}
              title="Swap wallets"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '100px',
                background: 'var(--bg2)',
                border: '1.5px solid var(--bg3)',
                cursor: toId ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: toId ? 'var(--ink3)' : 'var(--ink4)',
                opacity: toId ? 1 : 0.5,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (toId) e.currentTarget.style.background = 'var(--bg3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)' }}
            >
              <ArrowDown size={13} strokeWidth={1.5} />
            </button>
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
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name} — {w.currency} {fmt(w.currentBalance ?? 0)}
                </option>
              ))}
            </select>
          </div>

          {fromId && toId && fromId === toId && (
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--expense)', margin: 0 }}>
              Source and destination wallets must be different.
            </p>
          )}
        </div>

        {/* Transfer preview */}
        {fromWallet && toWallet && numericAmount > 0 && !overBalance && (
          <div className="daloy-amount-preview" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: 'var(--steel-bg)',
            border: '1.5px solid var(--steel-m)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--ink4)', margin: '0 0 2px' }}>From</p>
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
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--ink4)', margin: '0 0 2px' }}>To</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                {toWallet.icon} {toWallet.name}
              </p>
            </div>
          </div>
        )}

        {/* Date */}
        <div className="daloy-field">
          <label className="daloy-label">Date</label>
          <input
            className="daloy-input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="daloy-field">
          <label className="daloy-label">
            Note{' '}
            <span style={{ color: 'var(--ink4)', fontWeight: 400, fontSize: '0.75rem' }}>optional</span>
          </label>
          <input
            className="daloy-input"
            type="text"
            placeholder="e.g. Loading GCash"
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isDisabled) handleSubmit() }}
          />
        </div>

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