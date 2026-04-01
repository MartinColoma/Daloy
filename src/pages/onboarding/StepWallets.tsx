import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowRight, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { postWallets } from "../../services/onboardingService";

/* ─────────────────────────────────────────────
   StepWallets.tsx — Onboarding Step 2
   Add wallets (BPI, GCash, Maya, Cash, etc.)
   with name, icon, and starting balance.
   Skippable — POSTs [] to /onboarding/wallets
   before navigating to next step.
───────────────────────────────────────────── */

const WALLET_PRESETS = [
  { name: "Cash",      icon: "💵" },
  { name: "GCash",     icon: "💙" },
  { name: "Maya",      icon: "💚" },
  { name: "BPI",       icon: "🏦" },
  { name: "BDO",       icon: "🏦" },
  { name: "UnionBank", icon: "🏦" },
  { name: "Metrobank", icon: "🏦" },
];

const ICONS = ["💵","💳","🏦","💙","💚","💜","🔴","⭐","🏠","✈️","💼","🎯"];

interface WalletEntry {
  id:      string;
  name:    string;
  icon:    string;
  balance: string;
}

export default function StepWallets() {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);
  const symbol   = user?.baseCurrency === "PHP" ? "₱" : (user?.baseCurrency ?? "₱");

  const [wallets, setWallets] = useState<WalletEntry[]>([
    { id: crypto.randomUUID(), name: "Cash",  icon: "💵", balance: "0" },
    { id: crypto.randomUUID(), name: "GCash", icon: "💙", balance: "0" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  function addWallet() {
    setWallets(w => [...w, { id: crypto.randomUUID(), name: "", icon: "💳", balance: "0" }]);
  }

  function removeWallet(id: string) {
    setWallets(w => w.filter(x => x.id !== id));
  }

  function updateWallet(id: string, field: keyof WalletEntry, value: string) {
    setWallets(w => w.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  function addPreset(preset: typeof WALLET_PRESETS[0]) {
    const exists = wallets.some(w => w.name === preset.name);
    if (!exists) {
      setWallets(w => [...w, { id: crypto.randomUUID(), name: preset.name, icon: preset.icon, balance: "0" }]);
    }
  }

  async function submit(skip: boolean) {
    setSaving(true);
    setError(null);
    try {
      const payload = skip
        ? []
        : wallets
            .filter(w => w.name.trim())
            .map(w => ({
              name:           w.name.trim(),
              icon:           w.icon,
              initialBalance: Math.max(0, Number(w.balance) || 0),
            }));

      await postWallets(payload);
      navigate("/onboarding/budgets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save wallets. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Heading */}
      <h2
        className="font-lora font-bold text-[1.75rem] tracking-tight mb-1"
        style={{ color: "var(--ink)" }}
      >
        Add your wallets.
      </h2>
      <p
        className="font-outfit font-light text-[0.9rem] mb-6"
        style={{ color: "var(--ink3)" }}
      >
        Add the accounts you use — cash, bank, e-wallet.
        Enter starting balances to get your net worth right.
      </p>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {WALLET_PRESETS.map(p => {
          const added = wallets.some(w => w.name === p.name);
          return (
            <button
              key={p.name}
              onClick={() => addPreset(p)}
              disabled={added}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-outfit text-[0.75rem] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: added ? "var(--forest-bg)" : "var(--bg2)",
                border:     `1.5px solid ${added ? "var(--forest-xl)" : "var(--bg3)"}`,
                color:      added ? "var(--forest-m)" : "var(--ink2)",
              }}
            >
              {p.icon} {p.name}
            </button>
          );
        })}
      </div>

      {/* Wallet entries */}
      <div className="flex flex-col gap-3 mb-4">
        {wallets.map(wallet => (
          <div
            key={wallet.id}
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3"
            style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
          >
            {/* Icon picker */}
            <select
              value={wallet.icon}
              onChange={e => updateWallet(wallet.id, "icon", e.target.value)}
              className="text-[1.2rem] bg-transparent border-none outline-none cursor-pointer"
              aria-label="Wallet icon"
            >
              {ICONS.map(ico => (
                <option key={ico} value={ico}>{ico}</option>
              ))}
            </select>

            {/* Name */}
            <input
              type="text"
              placeholder="Wallet name"
              value={wallet.name}
              onChange={e => updateWallet(wallet.id, "name", e.target.value)}
              maxLength={30}
              className="flex-1 min-w-0 font-outfit text-[0.875rem] bg-transparent outline-none"
              style={{ color: "var(--ink)" }}
            />

            {/* Balance */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-mono text-[0.75rem]" style={{ color: "var(--ink4)" }}>
                {symbol}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={wallet.balance}
                onChange={e => updateWallet(wallet.id, "balance", e.target.value)}
                className="w-[80px] font-mono text-[0.875rem] text-right bg-transparent outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>

            {/* Remove */}
            <button
              onClick={() => removeWallet(wallet.id)}
              className="transition-opacity hover:opacity-60 shrink-0"
              style={{ color: "var(--ink4)" }}
              aria-label="Remove wallet"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Add wallet */}
      <button
        onClick={addWallet}
        className="w-full flex items-center justify-center gap-2 font-outfit text-[0.85rem] py-[0.6rem] rounded-[var(--radius-sm)] mb-4 transition-colors"
        style={{ border: "1.5px dashed var(--bg3)", color: "var(--ink3)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--forest-xl)"; e.currentTarget.style.color = "var(--forest)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bg3)"; e.currentTarget.style.color = "var(--ink3)"; }}
      >
        <Plus size={15} />
        Add another wallet
      </button>

      {/* Inline error */}
      {error && (
        <p
          className="font-outfit text-[0.8rem] mb-4 px-1"
          style={{ color: "var(--expense)" }}
        >
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => submit(true)}
          disabled={saving}
          className="flex items-center gap-1 font-outfit font-medium text-[0.85rem] px-5 py-[0.65rem] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50"
          style={{ border: "1.5px solid var(--bg3)", color: "var(--ink3)" }}
        >
          Skip <ChevronRight size={14} />
        </button>
        <button
          onClick={() => submit(false)}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 font-outfit font-medium text-[0.875rem] text-white py-[0.65rem] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50"
          style={{ background: "var(--forest)" }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "var(--forest-m)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
        >
          {saving
            ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <>Save & Continue <ArrowRight size={14} /></>
          }
        </button>
      </div>
    </div>
  );
}