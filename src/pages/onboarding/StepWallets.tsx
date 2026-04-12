import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowRight, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useOnboardingStore } from "../../stores/onboardingStore";

/* ─────────────────────────────────────────────
   StepWallets.tsx — Onboarding Step 2
   Add wallets with cent-first amount input.
   Wallet presets are dynamic based on the
   user's selected base currency.

   No API calls here — wallets are staged in
   onboardingStore and flushed to the DB in
   StepBudgets on final submit.
───────────────────────────────────────────── */

interface WalletPreset {
  name: string;
  icon: string;
}

// ── Wallet presets by currency code ───────────────────────────
const PRESETS_BY_CURRENCY: Record<string, WalletPreset[]> = {
  PHP: [
    { name: "Cash",      icon: "💵" },
    { name: "GCash",     icon: "💙" },
    { name: "Maya",      icon: "💚" },
    { name: "BPI",       icon: "🏦" },
    { name: "BDO",       icon: "🏦" },
    { name: "UnionBank", icon: "🏦" },
    { name: "Metrobank", icon: "🏦" },
    { name: "RCBC",      icon: "🏦" },
    { name: "Landbank",  icon: "🏦" },
  ],
  USD: [
    { name: "Cash",            icon: "💵" },
    { name: "Chase",           icon: "🏦" },
    { name: "Bank of America", icon: "🏦" },
    { name: "Wells Fargo",     icon: "🏦" },
    { name: "Citibank",        icon: "🏦" },
    { name: "PayPal",          icon: "💙" },
    { name: "Venmo",           icon: "💜" },
    { name: "Cash App",        icon: "💚" },
  ],
  EUR: [
    { name: "Cash",          icon: "💵" },
    { name: "Revolut",       icon: "💙" },
    { name: "N26",           icon: "🏦" },
    { name: "Wise",          icon: "💚" },
    { name: "Deutsche Bank", icon: "🏦" },
    { name: "BNP Paribas",   icon: "🏦" },
    { name: "ING",           icon: "🏦" },
  ],
  GBP: [
    { name: "Cash",     icon: "💵" },
    { name: "Monzo",    icon: "🔴" },
    { name: "Starling", icon: "💙" },
    { name: "Revolut",  icon: "💜" },
    { name: "Barclays", icon: "🏦" },
    { name: "HSBC",     icon: "🏦" },
    { name: "Lloyds",   icon: "🏦" },
    { name: "NatWest",  icon: "🏦" },
  ],
  SGD: [
    { name: "Cash",    icon: "💵" },
    { name: "PayNow",  icon: "💙" },
    { name: "DBS",     icon: "🏦" },
    { name: "OCBC",    icon: "🏦" },
    { name: "UOB",     icon: "🏦" },
    { name: "GrabPay", icon: "💚" },
  ],
  MYR: [
    { name: "Cash",        icon: "💵" },
    { name: "Touch 'n Go", icon: "💙" },
    { name: "Maybank",     icon: "🏦" },
    { name: "CIMB",        icon: "🏦" },
    { name: "Public Bank", icon: "🏦" },
    { name: "GrabPay",     icon: "💚" },
    { name: "Boost",       icon: "🟠" },
  ],
  IDR: [
    { name: "Cash",    icon: "💵" },
    { name: "GoPay",   icon: "💚" },
    { name: "OVO",     icon: "💜" },
    { name: "Dana",    icon: "💙" },
    { name: "BCA",     icon: "🏦" },
    { name: "Mandiri", icon: "🏦" },
    { name: "BRI",     icon: "🏦" },
    { name: "BNI",     icon: "🏦" },
  ],
  THB: [
    { name: "Cash",         icon: "💵" },
    { name: "PromptPay",    icon: "💙" },
    { name: "TrueMoney",    icon: "🟠" },
    { name: "Bangkok Bank", icon: "🏦" },
    { name: "Kasikorn",     icon: "🏦" },
    { name: "SCB",          icon: "🏦" },
  ],
  VND: [
    { name: "Cash",        icon: "💵" },
    { name: "MoMo",        icon: "🩷" },
    { name: "ZaloPay",     icon: "💙" },
    { name: "VietcomBank", icon: "🏦" },
    { name: "Techcombank", icon: "🏦" },
    { name: "VPBank",      icon: "🏦" },
  ],
  JPY: [
    { name: "Cash",            icon: "💵" },
    { name: "PayPay",          icon: "🟠" },
    { name: "LINE Pay",        icon: "💚" },
    { name: "Rakuten Pay",     icon: "🔴" },
    { name: "Japan Post Bank", icon: "🏦" },
    { name: "MUFG",            icon: "🏦" },
    { name: "SMBC",            icon: "🏦" },
  ],
  KRW: [
    { name: "Cash",         icon: "💵" },
    { name: "KakaoPay",     icon: "🟡" },
    { name: "Toss",         icon: "💙" },
    { name: "Kookmin Bank", icon: "🏦" },
    { name: "Shinhan",      icon: "🏦" },
    { name: "KEB Hana",     icon: "🏦" },
  ],
  AUD: [
    { name: "Cash",              icon: "💵" },
    { name: "Commonwealth Bank", icon: "🏦" },
    { name: "ANZ",               icon: "🏦" },
    { name: "Westpac",           icon: "🏦" },
    { name: "NAB",               icon: "🏦" },
    { name: "Up Bank",           icon: "💜" },
  ],
  AED: [
    { name: "Cash",         icon: "💵" },
    { name: "Emirates NBD", icon: "🏦" },
    { name: "FAB",          icon: "🏦" },
    { name: "ADCB",         icon: "🏦" },
    { name: "Mashreq",      icon: "🏦" },
    { name: "ADIB",         icon: "🏦" },
  ],
  SAR: [
    { name: "Cash",      icon: "💵" },
    { name: "STC Pay",   icon: "💙" },
    { name: "Al Rajhi",  icon: "🏦" },
    { name: "NCB",       icon: "🏦" },
    { name: "Riyad Bank", icon: "🏦" },
  ],
  QAR: [
    { name: "Cash",             icon: "💵" },
    { name: "QNB",              icon: "🏦" },
    { name: "Commercial Bank",  icon: "🏦" },
    { name: "Doha Bank",        icon: "🏦" },
  ],
  KWD: [
    { name: "Cash",       icon: "💵" },
    { name: "NBK",        icon: "🏦" },
    { name: "Gulf Bank",  icon: "🏦" },
    { name: "Boubyan",    icon: "🏦" },
  ],
  HKD: [
    { name: "Cash",               icon: "💵" },
    { name: "AlipayHK",           icon: "💙" },
    { name: "PayMe",              icon: "🔴" },
    { name: "HSBC",               icon: "🏦" },
    { name: "Hang Seng",          icon: "🏦" },
    { name: "Bank of China HK",   icon: "🏦" },
  ],
  INR: [
    { name: "Cash",       icon: "💵" },
    { name: "PhonePe",    icon: "💜" },
    { name: "Google Pay", icon: "💙" },
    { name: "Paytm",      icon: "💙" },
    { name: "SBI",        icon: "🏦" },
    { name: "HDFC",       icon: "🏦" },
    { name: "ICICI",      icon: "🏦" },
  ],
};

const GENERIC_PRESETS: WalletPreset[] = [
  { name: "Cash",     icon: "💵" },
  { name: "Savings",  icon: "🏦" },
  { name: "Checking", icon: "🏦" },
  { name: "Wallet",   icon: "💳" },
];

const ICONS = ["💵","💳","🏦","💙","💚","💜","🔴","🟠","🟡","⭐","🏠","✈️","💼","🎯","🩷"];

interface WalletEntry {
  id:        string;
  name:      string;
  icon:      string;
  centStr:   string;
  isDefault: boolean;
}

function centStrToDisplay(centStr: string): string {
  if (!centStr) return "";
  return (parseInt(centStr, 10) / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function centStrToNumber(centStr: string): number {
  if (!centStr) return 0;
  return parseInt(centStr, 10) / 100;
}

export default function StepWallets() {
  const navigate      = useNavigate();
  const user          = useAuthStore(s => s.user);
  const setWallets    = useOnboardingStore(s => s.setWallets);

  // Read currency from auth store — was set in Step 1
  const currency = user?.baseCurrency ?? "PHP";

  const symbol = (() => {
    try {
      return new Intl.NumberFormat("en-PH", { style: "currency", currency })
        .formatToParts(0)
        .find(p => p.type === "currency")?.value ?? currency;
    } catch {
      return currency;
    }
  })();

  const presets = PRESETS_BY_CURRENCY[currency] ?? GENERIC_PRESETS;

  const [wallets, setLocalWallets] = useState<WalletEntry[]>([
    { id: crypto.randomUUID(), name: "Cash", icon: "💵", centStr: "", isDefault: true },
    { id: crypto.randomUUID(), name: presets[1]?.name ?? "Wallet", icon: presets[1]?.icon ?? "💳", centStr: "", isDefault: false },
  ]);

  function addWallet() {
    setLocalWallets(w => [...w, { id: crypto.randomUUID(), name: "", icon: "💳", centStr: "", isDefault: false }]);
  }

  function removeWallet(id: string) {
    setLocalWallets(w => w.filter(x => x.id !== id));
  }

  function updateWallet(id: string, field: keyof Omit<WalletEntry, "id" | "centStr">, value: string) {
    setLocalWallets(w => w.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  const handleAmountKey = useCallback(
    (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        setLocalWallets(w => w.map(x => x.id === id ? { ...x, centStr: x.centStr.slice(0, -1) } : x));
      } else if (/^\d$/.test(e.key)) {
        setLocalWallets(w => w.map(x => {
          if (x.id !== id) return x;
          const next = (x.centStr + e.key).replace(/^0+/, "") || "";
          if (parseInt(next || "0", 10) > 99_999_999_999) return x;
          return { ...x, centStr: next };
        }));
      }
      e.preventDefault();
    },
    []
  );

  function addPreset(preset: WalletPreset) {
    const exists = wallets.some(w => w.name === preset.name);
    if (!exists) {
      setLocalWallets(w => [...w, { id: crypto.randomUUID(), name: preset.name, icon: preset.icon, centStr: "", isDefault: false }]);
    }
  }

  // ── Stage wallets in store, no API call ───────────────────
  function submit(skip: boolean) {
    if (skip) {
      setWallets([]); // clear any previously staged wallets
    } else {
      const staged = wallets
        .filter(w => w.name.trim())
        .map(w => ({
          name:           w.name.trim(),
          icon:           w.icon,
          initialBalance: centStrToNumber(w.centStr),
          // currency intentionally omitted — backend resolves from user.base_currency
        }));
      setWallets(staged);
    }
    navigate("/onboarding/budgets");
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
        {presets.map(p => {
          const added = p.name === "Cash" || wallets.some(w => w.name === p.name);
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

            {/* Balance — cent-first input */}
            <div
              className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-[var(--radius-sm)]"
              style={{ background: "var(--bg3)" }}
            >
              <span className="font-mono text-[0.72rem]" style={{ color: "var(--ink4)" }}>
                {symbol}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0.00"
                value={centStrToDisplay(wallet.centStr)}
                onKeyDown={e => handleAmountKey(wallet.id, e)}
                onChange={() => {/* controlled via onKeyDown */}}
                className="w-[80px] font-mono text-[0.875rem] text-right bg-transparent outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>

            {/* Remove — hidden for default Cash wallet */}
            {wallet.isDefault ? (
              <span
                className="shrink-0 font-mono text-[0.55rem] tracking-wide uppercase"
                style={{ color: "var(--ink4)" }}
                title="Cash wallet cannot be removed"
              >
                default
              </span>
            ) : (
              <button
                onClick={() => removeWallet(wallet.id)}
                className="transition-opacity hover:opacity-60 shrink-0"
                style={{ color: "var(--ink4)" }}
                aria-label="Remove wallet"
              >
                <Trash2 size={15} />
              </button>
            )}
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

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => submit(true)}
          className="flex items-center gap-1 font-outfit font-medium text-[0.85rem] px-5 py-[0.65rem] rounded-[var(--radius-sm)] transition-colors"
          style={{ border: "1.5px solid var(--bg3)", color: "var(--ink3)" }}
        >
          Skip <ChevronRight size={14} />
        </button>
        <button
          onClick={() => submit(false)}
          className="flex-1 flex items-center justify-center gap-2 font-outfit font-medium text-[0.875rem] text-white py-[0.65rem] rounded-[var(--radius-sm)] transition-colors"
          style={{ background: "var(--forest)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--forest-m)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
        >
          Save & Continue <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}