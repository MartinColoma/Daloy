// ============================================================
// modals/LogIncomeModal.tsx
// DB writes to: transactions (type='income')
// ============================================================

import { Briefcase } from "lucide-react";
import ModalShell from "../ModalShell";
import { useLogIncome } from "../../../hooks/quickActions/useLogIncome";
import { formatCurrency } from "../../../lib/currencyUtils";

// Common currencies for the currency selector
const CURRENCY_OPTIONS = ["PHP", "USD", "EUR", "JPY", "GBP", "SGD", "AUD", "HKD"];

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export default function LogIncomeModal({ isOpen, onClose }: Props) {
  const {
    form,
    setField,
    categories,
    wallets,
    optionsLoading,
    baseCurrency,
    exchangeRate,
    convertedAmount,
    needsConversion,
    ratesLoading,
    submit,
    isValid,
    isSubmitting,
    isError,
    error,
  } = useLogIncome(onClose);

  function handleSubmit() {
    if (!isValid || isSubmitting) return;
    submit();
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Log Income"
      subtitle="Record money coming in"
      icon={<Briefcase size={18} strokeWidth={1.5} />}
      accentColor="var(--income)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Error banner */}
        {isError && (
          <div style={{
            padding: "10px 12px",
            background: "#fef2f2",
            border: "1.5px solid #fca5a5",
            borderRadius: "var(--radius-sm)",
            fontFamily: "Outfit, sans-serif",
            fontSize: "0.82rem",
            color: "var(--expense)",
          }}>
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
          </div>
        )}

        {/* Amount + Currency */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">Amount Received</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              className="daloy-select"
              value={form.currency}
              onChange={e => setField("currency", e.target.value)}
              style={{ width: "90px", flexShrink: 0 }}
            >
              {CURRENCY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              className="daloy-input-mono"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setField("amount", e.target.value)}
              style={{ color: "var(--income)" }}
            />
          </div>

          {/* Conversion preview — only when currency differs from base */}
          {needsConversion && form.amount && (
            <p className="daloy-hint" style={{ marginTop: "6px" }}>
              {ratesLoading
                ? "Fetching today's rate…"
                : `≈ ${formatCurrency(convertedAmount, baseCurrency)} at ${exchangeRate.toFixed(4)} ${baseCurrency}/${form.currency}`
              }
            </p>
          )}
        </div>

        {/* Description */}
        <div className="daloy-field">
          <label className="daloy-label">Source / Description</label>
          <input
            className="daloy-input"
            type="text"
            placeholder="e.g. Freelance — Acme Corp"
            value={form.description}
            onChange={e => setField("description", e.target.value)}
          />
        </div>

        {/* Category + Wallet */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="daloy-field">
            <label className="daloy-label">Category</label>
            {optionsLoading ? (
              <div className="daloy-select" style={{ color: "var(--ink4)" }}>Loading…</div>
            ) : (
              <select
                className="daloy-select"
                value={form.categoryId}
                onChange={e => setField("categoryId", e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="daloy-field">
            <label className="daloy-label">To Wallet</label>
            {optionsLoading ? (
              <div className="daloy-select" style={{ color: "var(--ink4)" }}>Loading…</div>
            ) : (
              <select
                className="daloy-select"
                value={form.walletId}
                onChange={e => setField("walletId", e.target.value)}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="daloy-field">
          <label className="daloy-label">Date</label>
          <input
            className="daloy-input"
            type="date"
            value={form.date}
            onChange={e => setField("date", e.target.value)}
          />
        </div>

        {/* Recurring toggle */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "var(--bg2)",
          borderRadius: "var(--radius-sm)",
          border: "1.5px solid var(--bg3)",
        }}>
          <div>
            <p style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--ink2)",
              margin: 0,
            }}>
              Recurring income
            </p>
            <p className="daloy-hint" style={{ marginTop: 2 }}>
              Repeats on the same day each month
            </p>
          </div>
          <button
            onClick={() => setField("isRecurring", !form.isRecurring)}
            style={{
              width: "42px",
              height: "24px",
              borderRadius: "100px",
              background: form.isRecurring ? "var(--income)" : "var(--bg3)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute",
              top: "3px",
              left: form.isRecurring ? "21px" : "3px",
              width: "18px",
              height: "18px",
              borderRadius: "100px",
              background: "white",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            }} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <button
            className="daloy-btn-ghost"
            onClick={onClose}
            style={{ flex: "0 0 auto" }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            style={{
              flex: 1,
              background: !isValid || isSubmitting ? "var(--bg3)" : "var(--income)",
              color:      !isValid || isSubmitting ? "var(--ink4)" : "white",
              cursor:     !isValid || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Logging…" : "Log Income"}
          </button>
        </div>

      </div>
    </ModalShell>
  );
}