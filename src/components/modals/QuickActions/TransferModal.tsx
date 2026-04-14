import { useState, useEffect, useCallback } from 'react'
import { ArrowLeftRight, ArrowDown, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import ModalShell from '../ModalShell'
import { useLayout } from '../../../layouts/LayoutContext'
import { useWallets } from '../../../hooks/wallet/useWallets'
import { useExchangeRates } from '../../../hooks/currency/useExchangeRates'
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

   Cross-currency: when from/to wallets have
   different currencies, fetches live rates via
   useExchangeRates(fromCurrency) and shows the
   converted amount the recipient wallet will receive.

   After each successful transfer, directly invalidates
   the ['wallets'] query so balances refresh everywhere
   regardless of which page opened this modal.
───────────────────────────────────────────── */

interface Props {
  isOpen:        boolean
  onClose:       () => void
  sourceWallet?: WalletWithBalance | null
}

function fmt(n: number, decimals = 2): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export default function TransferModal({ isOpen, onClose, sourceWallet }: Props) {
  const { onModalSuccess }          = useLayout()
  const queryClient                 = useQueryClient()
  const { data: allWallets = [], isLoading: walletsLoading } = useWallets()

  const [fromId,     setFromId]     = useState<string>('')
  const [toId,       setToId]       = useState<string>('')
  const [centStr,    setCentStr]    = useState('')
  const [note,       setNote]       = useState('')
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Reset on open
  useEffect(() => {
    if (!isOpen) return
    setFromId(sourceWallet?.id ?? allWallets[0]?.id ?? '')
    setToId('')
    setCentStr('')
    setNote('')
    setDate(new Date().toISOString().split('T')[0])
    setError(null)
  }, [isOpen, sourceWallet])

  // Seed fromId once wallets arrive async
  useEffect(() => {
    if (!isOpen) return
    if (!fromId && allWallets[0]) {
      setFromId(sourceWallet?.id ?? allWallets[0].id)
    }
  }, [allWallets, isOpen])

  const fromWallet = allWallets.find(w => w.id === fromId) ?? null
  const toWallet   = allWallets.find(w => w.id === toId)   ?? null
  const toOptions  = allWallets.filter(w => w.id !== fromId)

  // ── Cross-currency detection ──────────────────────────────────
  const fromCurrency    = fromWallet?.currency ?? 'PHP'
  const toCurrency      = toWallet?.currency   ?? 'PHP'
  const isCrossCurrency = !!(fromWallet && toWallet && fromCurrency !== toCurrency)

  // Only fires when isCrossCurrency — `enabled: !!base` in the hook
  // guards against firing with undefined. Cache is keyed per currency
  // pair and held for 1 hour, so repeat opens are instant.
  const {
    data:          ratesData,
    isLoading:     ratesLoading,
    isError:       ratesError,
    dataUpdatedAt,
  } = useExchangeRates(isCrossCurrency ? fromCurrency : undefined)

  // ratesData IS the Record<string, number> — no .rates wrapper
  const exchangeRate: number | null =
    isCrossCurrency && ratesData
      ? (ratesData[toCurrency] ?? null)
      : null

  const numericAmount = centStr ? parseInt(centStr, 10) / 100 : 0
  const displayAmount = centStr
    ? (parseInt(centStr, 10) / 100).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : ''

  // Amount the destination wallet will actually receive
  const convertedAmount: number | null =
    isCrossCurrency && exchangeRate !== null && numericAmount > 0
      ? numericAmount * exchangeRate
      : null

  const overBalance =
    fromWallet !== null &&
    numericAmount > (fromWallet.currentBalance ?? 0) &&
    numericAmount > 0

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
    (isCrossCurrency && ratesLoading) ||
    (isCrossCurrency && exchangeRate === null && !ratesLoading) ||
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
        ...(isCrossCurrency && exchangeRate ? { exchangeRate } : {}),
        description:  note.trim() || undefined,
      })

      // Directly invalidate wallets so balances refresh everywhere —
      // works whether opened from Quick Actions or WalletPage.
      await queryClient.invalidateQueries({ queryKey: ['wallets'] })

      onModalSuccess?.()  // still notifies WalletPage to refetch net position
      handleClose()
    } catch {
      setError('Transfer failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const rateTimestamp = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
    : null

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

        {/* Wallets loading */}
        {walletsLoading && allWallets.length === 0 && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--ink4)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.85rem',
          }}>
            Loading wallets…
          </div>
        )}

        {(!walletsLoading || allWallets.length > 0) && (
          <>
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

            {/* Amount */}
            <div className="daloy-field">
              <label className="daloy-eyebrow">Amount</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.82rem',
                  color: 'var(--ink3)',
                  flexShrink: 0,
                }}>
                  {fromCurrency}
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
                  Exceeds {fromWallet!.icon} {fromWallet!.name} balance of {fromCurrency} {fmt(fromWallet!.currentBalance ?? 0)}
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

            {/* ── Exchange rate strip — cross-currency only ── */}
            {isCrossCurrency && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                background: ratesError ? 'var(--clay-bg)' : 'var(--forest-bg)',
                border: `1.5px solid ${ratesError ? 'var(--clay-m)' : 'var(--forest-xl)'}`,
                borderRadius: 'var(--radius-sm)',
              }}>
                <RefreshCw
                  size={12}
                  strokeWidth={1.8}
                  style={{
                    color: ratesError ? 'var(--clay)' : 'var(--forest)',
                    flexShrink: 0,
                    animation: ratesLoading ? 'spin 1s linear infinite' : 'none',
                  }}
                />
                {ratesLoading && (
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'var(--ink3)' }}>
                    Fetching exchange rate…
                  </span>
                )}
                {!ratesLoading && ratesError && (
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'var(--clay)' }}>
                    Could not fetch rate for {fromCurrency} → {toCurrency}. Try again later.
                  </span>
                )}
                {!ratesLoading && !ratesError && exchangeRate !== null && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.8rem',
                      color: 'var(--forest)',
                      fontWeight: 500,
                    }}>
                      1 {fromCurrency} = {fmt(exchangeRate, 4)} {toCurrency}
                    </span>
                    {rateTimestamp && (
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.7rem', color: 'var(--ink4)' }}>
                        · updated {rateTimestamp}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Transfer preview */}
            {fromWallet && toWallet && numericAmount > 0 && !overBalance && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'var(--steel-bg)',
                border: '1.5px solid var(--steel-m)',
                borderRadius: 'var(--radius-md)',
              }}>
                {/* From side */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--ink4)', margin: '0 0 2px' }}>From</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 3px' }}>
                    {fromWallet.icon} {fromWallet.name}
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.82rem', color: 'var(--steel)', margin: 0 }}>
                    {fromCurrency} {fmt(numericAmount)}
                  </p>
                </div>

                {/* Center arrow + rate multiplier */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <ArrowLeftRight size={14} style={{ color: 'var(--steel-m)' }} />
                  {isCrossCurrency && exchangeRate !== null && (
                    <p style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.65rem',
                      color: 'var(--forest)',
                      margin: '3px 0 0',
                      whiteSpace: 'nowrap',
                    }}>
                      × {fmt(exchangeRate, 4)}
                    </p>
                  )}
                </div>

                {/* To side */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--ink4)', margin: '0 0 2px' }}>To</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 3px' }}>
                    {toWallet.icon} {toWallet.name}
                  </p>
                  {!isCrossCurrency && (
                    <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.82rem', color: 'var(--steel)', margin: 0 }}>
                      {toCurrency} {fmt(numericAmount)}
                    </p>
                  )}
                  {isCrossCurrency && convertedAmount !== null && (
                    <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.82rem', fontWeight: 500, color: 'var(--forest)', margin: 0 }}>
                      ≈ {toCurrency} {fmt(convertedAmount)}
                    </p>
                  )}
                  {isCrossCurrency && ratesLoading && (
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--ink4)', margin: 0 }}>
                      calculating…
                    </p>
                  )}
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
                  cursor:     isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting
                  ? 'Transferring…'
                  : isCrossCurrency && convertedAmount !== null
                  ? `Confirm — receive ${toCurrency} ${fmt(convertedAmount)}`
                  : 'Confirm Transfer'
                }
              </button>
            </div>
          </>
        )}

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </ModalShell>
  )
}