import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import ModalShell from "./ModalShell";
import { fetchAddExpenseOptions, createExpense } from "../../services/quickActionsService";
import type {
  ExpenseCategoryOption,
  WalletOption,
} from "../../types/quickActions.types";

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ isOpen, onClose }: Props) {
  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [walletId,    setWalletId]    = useState("");
  const [categoryId,  setCategoryId]  = useState("");
  const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [currency,    setCurrency]    = useState("PHP");
  const [note,        setNote]        = useState("");

  const [categories,  setCategories]  = useState<ExpenseCategoryOption[]>([]);
  const [wallets,     setWallets]     = useState<WalletOption[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Load options when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    fetchAddExpenseOptions()
      .then(({ categories, wallets }) => {
        setCategories(categories);
        setWallets(wallets);
        if (categories.length > 0) setCategoryId(categories[0].id);
        if (wallets.length > 0)    setWalletId(wallets[0].id);
      })
      .catch(() => setError("Failed to load options. Please try again."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleClose = () => {
    // Reset form
    setAmount("");
    setDescription("");
    setNote("");
    setIsRecurring(false);
    setCurrency("PHP");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || !description || !walletId || !categoryId) return;
    setSubmitting(true);
    setError(null);
    try {
      const parsedAmount = parseFloat(amount);
      const exchangeRate = currency === "PHP" ? 1 : 57.8; // TODO: replace with live rate
      const baseAmount   = currency === "PHP" ? parsedAmount : parsedAmount * exchangeRate;

      await createExpense({
        walletId,
        categoryId,
        amount:           baseAmount,
        originalAmount:   parsedAmount,
        originalCurrency: currency,
        exchangeRate,
        description,
        transactedAt:     new Date(date).toISOString(),
        note:             note || undefined,
        isRecurring,
      });
      handleClose();
    } catch {
      setError("Failed to save expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = !amount || !description || submitting || loading;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Expense"
      subtitle="Record money going out"
      icon={<ShoppingCart size={18} strokeWidth={1.5} />}
      accentColor="var(--expense)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Error banner */}
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

        {/* Amount */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">Amount</label>
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
              <option>JPY</option>
            </select>
            <input
              className="daloy-input-mono"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ color: "var(--expense)" }}
            />
          </div>
          {currency !== "PHP" && amount && (
            <p className="daloy-hint">
              ≈ ₱{(parseFloat(amount) * 57.8).toLocaleString("en-PH", { maximumFractionDigits: 2 })} PHP at today's rate
            </p>
          )}
        </div>

        {/* Description */}
        <div className="daloy-field">
          <label className="daloy-label">Description</label>
          <input
            className="daloy-input"
            type="text"
            placeholder="e.g. SM Supermarket"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Category + Wallet */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="daloy-field">
            <label className="daloy-label">Category</label>
            <select
              className="daloy-select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              disabled={loading}
            >
              {loading
                ? <option>Loading…</option>
                : categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))
              }
            </select>
          </div>
          <div className="daloy-field">
            <label className="daloy-label">Wallet</label>
            <select
              className="daloy-select"
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              disabled={loading}
            >
              {loading
                ? <option>Loading…</option>
                : wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.currency})</option>
                  ))
              }
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

        {/* Note */}
        <div className="daloy-field">
          <label className="daloy-label">
            Note <span style={{ color: "var(--ink4)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            className="daloy-input"
            type="text"
            placeholder="Any extra details…"
            value={note}
            onChange={e => setNote(e.target.value)}
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
              Recurring expense
            </p>
            <p className="daloy-hint" style={{ marginTop: 2 }}>Repeats on the same day each month</p>
          </div>
          <button
            onClick={() => setIsRecurring(!isRecurring)}
            style={{
              width: "42px", height: "24px",
              borderRadius: "100px",
              background: isRecurring ? "var(--forest)" : "var(--bg3)",
              border: "none", cursor: "pointer",
              position: "relative", transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: "3px",
              left: isRecurring ? "21px" : "3px",
              width: "18px", height: "18px",
              borderRadius: "100px", background: "white",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            }} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <button className="daloy-btn-ghost" onClick={handleClose} style={{ flex: "0 0 auto" }}>
            Cancel
          </button>
          <button
            className="daloy-btn-primary"
            onClick={handleSubmit}
            disabled={isDisabled}
            style={{
              background: isDisabled ? "var(--bg3)" : "var(--expense)",
              color:      isDisabled ? "var(--ink4)" : "white",
            }}
          >
            {submitting ? "Saving…" : "Save Expense"}
          </button>
        </div>

      </div>
    </ModalShell>
  );
}