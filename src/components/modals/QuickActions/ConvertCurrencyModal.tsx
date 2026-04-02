import { useState } from "react";
import { RefreshCcw, ArrowRight } from "lucide-react";
import ModalShell from "../ModalShell";

/* ─────────────────────────────────────────────
   ConvertCurrencyModal.tsx
   Informational tool — does NOT write to DB.
   Uses currencyService.getExchangeRate(from, to)
   cached via React Query (hourly refresh).
   Optional: "Log this as a transaction" links
   to AddExpenseModal with pre-filled values.
───────────────────────────────────────────── */

// Mock exchange rates (PHP base) — real data from currencyService / Edge Function
const MOCK_RATES: Record<string, number> = {
  PHP: 1,
  USD: 0.01730,
  EUR: 0.01598,
  JPY: 2.607,
  GBP: 0.01362,
  SGD: 0.02300,
  AUD: 0.02680,
  HKD: 0.13510,
  KRW: 23.10,
  CAD: 0.02400,
};

const CURRENCIES = Object.keys(MOCK_RATES);

function convert(amount: number, from: string, to: string): number {
  // Convert to PHP first, then to target
  const inPhp = amount / MOCK_RATES[from];
  return inPhp * MOCK_RATES[to];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertCurrencyModal({ isOpen, onClose }: Props) {
  const [fromCur,   setFromCur]   = useState("USD");
  const [toCur,     setToCur]     = useState("PHP");
  const [fromAmount, setFromAmount] = useState("1");
  const [lastUpdated] = useState("Just now");

  const numericAmount = parseFloat(fromAmount) || 0;
  const result = convert(numericAmount, fromCur, toCur);

  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
    setFromAmount(result.toFixed(4).replace(/\.?0+$/, ""));
  };

  const rate = MOCK_RATES[toCur] / MOCK_RATES[fromCur];

  // Quick presets
  const PRESETS = [1, 5, 10, 50, 100, 500];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Currency"
      subtitle="Quick exchange rate lookup"
      icon={<RefreshCcw size={18} strokeWidth={1.5} />}
      accentColor="var(--steel-m)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* From */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">From</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="daloy-select"
              value={fromCur}
              onChange={e => setFromCur(e.target.value)}
              style={{ width: "100px", flexShrink: 0 }}
            >
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              className="daloy-input-mono"
              type="number"
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Swap + Rate */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ height: "1px", flex: 1, background: "var(--bg3)" }} />
          <button
            onClick={swap}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "100px",
              border: "1.5px solid var(--bg3)",
              background: "var(--bg2)",
              cursor: "pointer",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.65rem",
              color: "var(--ink3)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <RefreshCcw size={11} strokeWidth={1.5} />
            1 {fromCur} = {rate.toFixed(4)} {toCur}
          </button>
          <div style={{ height: "1px", flex: 1, background: "var(--bg3)" }} />
        </div>

        {/* To */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">To</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="daloy-select"
              value={toCur}
              onChange={e => setToCur(e.target.value)}
              style={{ width: "100px", flexShrink: 0 }}
            >
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--bg3)",
              background: "var(--bg3)",
            }}>
              <p style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.4rem",
                fontWeight: 500,
                color: "var(--forest)",
                margin: 0,
              }}>
                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="daloy-field">
          <label className="daloy-label">Quick amounts in {fromCur}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setFromAmount(String(p))}
                style={{
                  padding: "5px 12px",
                  borderRadius: "100px",
                  border: `1.5px solid ${fromAmount === String(p) ? "var(--steel-m)" : "var(--bg3)"}`,
                  background: fromAmount === String(p) ? "var(--steel-bg)" : "var(--bg2)",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.75rem",
                  color: fromAmount === String(p) ? "var(--steel)" : "var(--ink3)",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Rate info */}
        <div style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          background: "var(--steel-bg)",
          border: "1px solid var(--steel-m)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}>
          <div>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", fontWeight: 500, color: "var(--steel)", margin: 0 }}>
              Exchange rate
            </p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem", color: "var(--steel-m)", margin: "2px 0 0" }}>
              1 {fromCur} = {rate.toFixed(6)} {toCur}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.65rem", color: "var(--ink4)", margin: 0 }}>
              Updated {lastUpdated}
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.62rem", color: "var(--ink4)", margin: "1px 0 0" }}>
              via ExchangeRate-API
            </p>
          </div>
        </div>

        {/* CTA: Log transaction hint */}
        <div style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          background: "var(--bg2)",
          border: "1.5px solid var(--bg3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", color: "var(--ink3)", margin: 0 }}>
            Made a purchase in {fromCur}?
          </p>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--forest)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Log expense <ArrowRight size={11} strokeWidth={1.5} />
          </button>
        </div>

        {/* Close */}
        <button className="daloy-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  );
}