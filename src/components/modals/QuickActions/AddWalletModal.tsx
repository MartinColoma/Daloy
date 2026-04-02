import { useState, useEffect, useCallback } from "react";
import { Wallet } from "lucide-react";
import ModalShell from "../ModalShell";
import { useLayout } from "../../../layouts/LayoutContext";
import walletService from "../../../services/wallet/walletService";
import type { WalletWithBalance } from "../../../types";

const WALLET_ICONS = [
  { value: "💳", label: "Card" },
  { value: "💵", label: "Cash" },
  { value: "📱", label: "E-Wallet" },
  { value: "🏦", label: "Bank" },
  { value: "💰", label: "Savings" },
  { value: "🪙", label: "Coin" },
  { value: "🏧", label: "ATM" },
  { value: "📊", label: "Investment" },
];

const CURRENCIES = ["PHP", "USD", "EUR", "JPY", "GBP", "SGD", "AUD"];

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export default function AddWalletModal({ isOpen, onClose }: Props) {
  const { onModalSuccess } = useLayout();

  const [name,     setName]     = useState("");
  const [icon,     setIcon]     = useState("💳");
  const [currency, setCurrency] = useState("PHP");
  const [centStr,  setCentStr]  = useState("");

  const [existingWallets, setExistingWallets] = useState<WalletWithBalance[]>([]);
  const [loadingWallets,  setLoadingWallets]  = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const numericBalance = centStr ? parseInt(centStr, 10) / 100 : 0;
  const displayBalance = centStr
    ? (parseInt(centStr, 10) / 100).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";

  useEffect(() => {
    if (!isOpen) return;
    setLoadingWallets(true);
    setError(null);
    walletService.getWallets()
      .then((wallets: WalletWithBalance[]) => setExistingWallets(wallets))
      .catch(() => setError("Failed to load wallets. Please try again."))
      .finally(() => setLoadingWallets(false));
  }, [isOpen]);

  const handleBalanceKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setCentStr(prev => prev.slice(0, -1));
    } else if (/^\d$/.test(e.key)) {
      setCentStr(prev => {
        const next = (prev + e.key).replace(/^0+/, "") || "";
        if (parseInt(next, 10) > 99_999_999_999) return prev;
        return next;
      });
    }
    e.preventDefault();
  }, []);

  const handleClose = () => {
    setName("");
    setIcon("💳");
    setCurrency("PHP");
    setCentStr("");
    setError(null);
    onClose();
  };

  // Require name AND a non-zero balance
  const isDisabled = !name.trim() || !centStr || numericBalance <= 0 || submitting || loadingWallets;

  const handleSubmit = async () => {
    if (isDisabled) return;
    setSubmitting(true);
    setError(null);
    try {
      await walletService.createWallet({
        name:           name.trim(),
        icon,
        currency,
        initialBalance: numericBalance,
      });
      onModalSuccess?.();
      handleClose();
    } catch {
      setError("Failed to create wallet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Wallet"
      subtitle="Track a new account or cash source"
      icon={<Wallet size={18} strokeWidth={1.5} />}
      accentColor="var(--forest)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {error && (
          <p style={{
            padding: "10px 12px",
            background: "var(--clay-bg)",
            border: "1.5px solid var(--clay-m)",
            borderRadius: "var(--radius-sm)",
            color: "var(--clay)",
            fontSize: "0.82rem",
            fontFamily: "Outfit, sans-serif",
            margin: 0,
          }}>
            {error}
          </p>
        )}

        <div className="daloy-field">
          <label className="daloy-eyebrow">Your Wallets</label>

          {loadingWallets ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
              {["skeleton-1", "skeleton-2"].map(key => (
                <div key={key} style={{
                  height: "52px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg2)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : existingWallets.length === 0 ? (
            <p style={{
              padding: "12px",
              background: "var(--bg2)",
              borderRadius: "var(--radius-md)",
              color: "var(--ink4)",
              fontSize: "0.82rem",
              fontFamily: "Outfit, sans-serif",
              textAlign: "center",
              margin: "6px 0 0",
            }}>
              No wallets yet — you're adding your first one!
            </p>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "6px",
              maxHeight: "180px",
              overflowY: "auto",
              paddingRight: "2px",
            }}>
              {existingWallets.map(w => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--bg2)",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--bg3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{w.icon}</span>
                    <div>
                      <p style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "var(--ink2)",
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {w.name}
                      </p>
                      <p style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "0.65rem",
                        color: "var(--ink4)",
                        margin: 0,
                        letterSpacing: "0.02em",
                      }}>
                        {w.currency}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "var(--income)",
                  }}>
                    {w.currency}{" "}
                    {typeof w.currentBalance === "number"
                      ? w.currentBalance.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "var(--ink4)",
          fontSize: "0.72rem",
          fontFamily: "IBM Plex Mono, monospace",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--bg3)" }} />
          New Wallet
          <div style={{ flex: 1, height: "1px", background: "var(--bg3)" }} />
        </div>

        <div className="daloy-field">
          <label className="daloy-label">Icon</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
            {WALLET_ICONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIcon(opt.value)}
                title={opt.label}
                style={{
                  width: "40px",
                  height: "40px",
                  fontSize: "1.2rem",
                  borderRadius: "var(--radius-sm)",
                  border: icon === opt.value
                    ? "2px solid var(--forest)"
                    : "1.5px solid var(--bg3)",
                  background: icon === opt.value ? "var(--forest-bg)" : "var(--bg2)",
                  cursor: "pointer",
                  transition: "border 0.15s, background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px" }}>
          <div className="daloy-field">
            <label className="daloy-label">Wallet Name</label>
            <input
              className="daloy-input"
              type="text"
              placeholder="e.g. BPI Savings, GCash, Cash"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !isDisabled) handleSubmit(); }}
            />
          </div>
          <div className="daloy-field">
            <label className="daloy-label">Currency</label>
            <select
              className="daloy-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ width: "90px" }}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Starting balance — now required */}
        <div className="daloy-field">
          <label className="daloy-label">
            Starting Balance{" "}
            <span style={{ color: "var(--clay)", fontWeight: 500, fontSize: "0.75rem" }}>required</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.85rem",
              color: "var(--ink3)",
              flexShrink: 0,
            }}>
              {currency}
            </span>
            <input
              className="daloy-input-mono"
              type="text"
              inputMode="numeric"
              placeholder="0.00"
              value={displayBalance}
              onKeyDown={handleBalanceKey}
              onChange={() => {}}
              style={{ color: "var(--income)", transition: "color 0.15s" }}
            />
          </div>
          <p className="daloy-hint" style={{ marginTop: "4px" }}>
            Enter your current balance — Daloy will track changes from here.
          </p>
        </div>

        {name.trim() && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            background: "var(--forest-bg)",
            border: "1.5px solid var(--forest-xl)",
            borderRadius: "var(--radius-md)",
          }}>
            <span style={{ fontSize: "1.3rem" }}>{icon}</span>
            <div>
              <p style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--forest)",
                margin: 0,
              }}>
                {name}
              </p>
              <p style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.7rem",
                color: "var(--forest-l)",
                margin: 0,
                letterSpacing: "0.05em",
              }}>
                {currency}{" "}
                {centStr
                  ? numericBalance.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"
                }
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <button className="daloy-btn-ghost" onClick={handleClose} style={{ flex: "0 0 auto" }}>
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleSubmit}
            disabled={isDisabled}
            style={{
              flex: 1,
              background: isDisabled ? "var(--bg3)" : "var(--forest)",
              color:      isDisabled ? "var(--ink4)" : "white",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {submitting ? "Saving…" : "Add Wallet"}
          </button>
        </div>

      </div>
    </ModalShell>
  );
}