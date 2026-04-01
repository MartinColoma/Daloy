import { useState } from "react";
import { Briefcase } from "lucide-react";
import ModalShell from "./ModalShell";

/* ─────────────────────────────────────────────
   LogIncomeModal.tsx
   DB writes to: transactions (type='income')
   Fields: wallet_id, category_id, amount,
           original_amount, original_currency,
           exchange_rate, description, transacted_at,
           is_recurring
───────────────────────────────────────────── */

const MOCK_WALLETS = [
  { id: "1", name: "BPI Jumpstart", icon: "🏦" },
  { id: "2", name: "GCash",         icon: "💙" },
  { id: "3", name: "Maya",          icon: "💚" },
  { id: "4", name: "Cash",          icon: "💵" },
];

const INCOME_CATEGORIES = [
  { id: "10", icon: "💼", name: "Freelance" },
  { id: "11", icon: "🏢", name: "Salary" },
  { id: "12", icon: "💰", name: "Business" },
  { id: "13", icon: "📈", name: "Investment" },
  { id: "14", icon: "🎁", name: "Gift" },
  { id: "15", icon: "📦", name: "Other" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogIncomeModal({ isOpen, onClose }: Props) {
  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [walletId,    setWalletId]    = useState("1");
  const [categoryId,  setCategoryId]  = useState("10");
  const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [currency,    setCurrency]    = useState("PHP");

  const handleSubmit = () => {
    // TODO: call transactionService.createTransaction({
    //   type: "income",
    //   wallet_id: walletId,
    //   category_id: categoryId,
    //   amount: parseFloat(amount),
    //   original_amount: parseFloat(amount),
    //   original_currency: currency,
    //   exchange_rate: 1,
    //   description,
    //   transacted_at: new Date(date).toISOString(),
    //   is_recurring: isRecurring,
    // });
    onClose();
  };

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

        {/* Amount */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">Amount Received</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              className="daloy-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ width: "90px", flexShrink: 0 }}
            >
              <option>PHP</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
            <input
              className="daloy-input-mono"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ color: "var(--income)" }}
            />
          </div>
          {currency !== "PHP" && amount && (
            <p className="daloy-hint">
              ≈ ₱{(parseFloat(amount) * 57.8).toLocaleString("en-PH", { maximumFractionDigits: 2 })} PHP at today's rate
            </p>
          )}
        </div>

        {/* Source / description */}
        <div className="daloy-field">
          <label className="daloy-label">Source / Description</label>
          <input
            className="daloy-input"
            type="text"
            placeholder="e.g. Freelance — Acme Corp"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Category + Wallet */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="daloy-field">
            <label className="daloy-label">Category</label>
            <select className="daloy-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {INCOME_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="daloy-field">
            <label className="daloy-label">To Wallet</label>
            <select className="daloy-select" value={walletId} onChange={e => setWalletId(e.target.value)}>
              {MOCK_WALLETS.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>
        </div>

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
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.85rem", fontWeight: 500, color: "var(--ink2)", margin: 0 }}>
              Recurring income
            </p>
            <p className="daloy-hint" style={{ marginTop: 2 }}>Repeats on the same day each month</p>
          </div>
          <button
            onClick={() => setIsRecurring(!isRecurring)}
            style={{
              width: "42px",
              height: "24px",
              borderRadius: "100px",
              background: isRecurring ? "var(--income)" : "var(--bg3)",
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
              left: isRecurring ? "21px" : "3px",
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
          <button className="daloy-btn-ghost" onClick={onClose} style={{ flex: "0 0 auto" }}>
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleSubmit}
            disabled={!amount || !description}
            style={{
              background: !amount || !description ? "var(--bg3)" : "var(--income)",
              color: !amount || !description ? "var(--ink4)" : "white",
            }}
          >
            Log Income
          </button>
        </div>
      </div>
    </ModalShell>
  );
}