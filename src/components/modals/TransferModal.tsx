import { useState } from "react";
import { ArrowLeftRight, ArrowDown } from "lucide-react";
import ModalShell from "./ModalShell";

/* ─────────────────────────────────────────────
   TransferModal.tsx
   DB writes to: transactions (type='transfer')
   Fields: wallet_id (from), to_wallet_id,
           amount, original_amount,
           original_currency, exchange_rate,
           description, transacted_at
   Rule: net zero across both wallets
───────────────────────────────────────────── */

const MOCK_WALLETS = [
  { id: "1", name: "BPI Jumpstart", icon: "🏦", balance: 28400, currency: "PHP" },
  { id: "2", name: "GCash",         icon: "💙", balance: 8650,  currency: "PHP" },
  { id: "3", name: "Maya",          icon: "💚", balance: 5800,  currency: "PHP" },
  { id: "4", name: "Cash",          icon: "💵", balance: 0,     currency: "PHP" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferModal({ isOpen, onClose }: Props) {
  const [fromId,  setFromId]  = useState("1");
  const [toId,    setToId]    = useState("2");
  const [amount,  setAmount]  = useState("");
  const [note,    setNote]    = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);

  const fromWallet = MOCK_WALLETS.find(w => w.id === fromId)!;
  const toWallet   = MOCK_WALLETS.find(w => w.id === toId)!;
  const isSame     = fromId === toId;
  const overBalance = parseFloat(amount) > fromWallet.balance;
  const canSubmit   = amount && !isSame && !overBalance;

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const handleSubmit = () => {
    // TODO: call transactionService.createTransaction({
    //   type: "transfer",
    //   wallet_id: fromId,
    //   to_wallet_id: toId,
    //   amount: parseFloat(amount),
    //   original_amount: parseFloat(amount),
    //   original_currency: "PHP",
    //   exchange_rate: 1,
    //   description: note || `${fromWallet.name} → ${toWallet.name}`,
    //   transacted_at: new Date(date).toISOString(),
    // });
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer"
      subtitle="Move money between wallets"
      icon={<ArrowLeftRight size={18} strokeWidth={1.5} />}
      accentColor="var(--steel-m)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Amount */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">Amount</label>
          <input
            className="daloy-input-mono"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ color: overBalance ? "var(--expense)" : "var(--ink)" }}
          />
          {overBalance && (
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", color: "var(--expense)", margin: 0 }}>
              Exceeds {fromWallet.icon} {fromWallet.name} balance of ₱{fromWallet.balance.toLocaleString()}
            </p>
          )}
        </div>

        {/* From / To with swap */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="daloy-field">
            <label className="daloy-label">From</label>
            <select className="daloy-select" value={fromId} onChange={e => setFromId(e.target.value)}>
              {MOCK_WALLETS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name} — ₱{w.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={swap}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "100px",
                background: "var(--bg2)",
                border: "1.5px solid var(--bg3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink3)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
              title="Swap wallets"
            >
              <ArrowDown size={13} strokeWidth={1.5} />
            </button>
          </div>

          <div className="daloy-field">
            <label className="daloy-label">To</label>
            <select className="daloy-select" value={toId} onChange={e => setToId(e.target.value)}>
              {MOCK_WALLETS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name} — ₱{w.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {isSame && (
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", color: "var(--expense)", margin: 0 }}>
              Source and destination wallets must be different.
            </p>
          )}
        </div>

        {/* Transfer preview */}
        {amount && !isSame && !overBalance && (
          <div className="daloy-amount-preview" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{fromWallet.icon} {fromWallet.name}</span>
            <span style={{ color: "var(--ink4)" }}>→</span>
            <span>{toWallet.icon} {toWallet.name}</span>
            <span style={{ marginLeft: "auto", fontWeight: 500, color: "var(--ink)" }}>₱{parseFloat(amount).toLocaleString()}</span>
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
          <label className="daloy-label">Note <span style={{ color: "var(--ink4)", fontWeight: 400 }}>(optional)</span></label>
          <input
            className="daloy-input"
            type="text"
            placeholder="e.g. Loading GCash"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <button className="daloy-btn-ghost" onClick={onClose} style={{ flex: "0 0 auto" }}>
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: !canSubmit ? "var(--bg3)" : "var(--steel)",
              color: !canSubmit ? "var(--ink4)" : "white",
            }}
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </ModalShell>
  );
}