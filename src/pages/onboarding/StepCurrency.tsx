import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { patchBaseCurrency } from "../../services/onboardingService";

/* ─────────────────────────────────────────────
   StepCurrency.tsx — Onboarding Step 1
   Pick base currency. Default: PHP.
   Searchable list of common currencies.
   Saves to public.users.base_currency via PATCH /onboarding/currency.
───────────────────────────────────────────── */

const CURRENCIES = [
  { code: "PHP", name: "Philippine Peso",    symbol: "₱",   flag: "🇵🇭" },
  { code: "USD", name: "US Dollar",          symbol: "$",   flag: "🇺🇸" },
  { code: "EUR", name: "Euro",               symbol: "€",   flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",      symbol: "£",   flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen",       symbol: "¥",   flag: "🇯🇵" },
  { code: "SGD", name: "Singapore Dollar",   symbol: "S$",  flag: "🇸🇬" },
  { code: "AUD", name: "Australian Dollar",  symbol: "A$",  flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar",    symbol: "C$",  flag: "🇨🇦" },
  { code: "HKD", name: "Hong Kong Dollar",   symbol: "HK$", flag: "🇭🇰" },
  { code: "KRW", name: "South Korean Won",   symbol: "₩",   flag: "🇰🇷" },
  { code: "CNY", name: "Chinese Yuan",       symbol: "¥",   flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee",       symbol: "₹",   flag: "🇮🇳" },
  { code: "MYR", name: "Malaysian Ringgit",  symbol: "RM",  flag: "🇲🇾" },
  { code: "THB", name: "Thai Baht",          symbol: "฿",   flag: "🇹🇭" },
  { code: "IDR", name: "Indonesian Rupiah",  symbol: "Rp",  flag: "🇮🇩" },
  { code: "VND", name: "Vietnamese Dong",    symbol: "₫",   flag: "🇻🇳" },
  { code: "AED", name: "UAE Dirham",         symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal",        symbol: "﷼",   flag: "🇸🇦" },
];

export default function StepCurrency() {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);
  const setUser  = useAuthStore(s => s.setUser);

  const [selected, setSelected] = useState(user?.baseCurrency ?? "PHP");
  const [query,    setQuery]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleContinue() {
    setSaving(true);
    setError(null);
    try {
      await patchBaseCurrency(selected);
      // Sync store so subsequent steps have the correct currency symbol
      if (user) setUser({ ...user, baseCurrency: selected });
      navigate("/onboarding/wallets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save currency. Please try again.");
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
        What's your base currency?
      </h2>
      <p
        className="font-outfit font-light text-[0.9rem] mb-7"
        style={{ color: "var(--ink3)" }}
      >
        All amounts will be stored and shown in this currency.
        You can still log transactions in other currencies.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--ink4)" }}
        />
        <input
          type="text"
          placeholder="Search currencies..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full font-outfit text-[0.875rem] rounded-[var(--radius-sm)] pl-10 pr-4 py-[0.65rem] outline-none transition-colors"
          style={{
            background:   "var(--bg2)",
            border:       "1.5px solid var(--bg3)",
            color:        "var(--ink)",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; }}
          onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
        />
      </div>

      {/* Currency list */}
      <div
        className="rounded-[var(--radius-md)] overflow-hidden mb-6"
        style={{ border: "1px solid var(--bg3)" }}
      >
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p
              className="font-outfit text-[0.85rem] text-center py-8"
              style={{ color: "var(--ink4)" }}
            >
              No currencies found.
            </p>
          ) : (
            filtered.map((c, i) => {
              const isActive = selected === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelected(c.code)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  style={{
                    background:   isActive ? "var(--forest-bg)" : i % 2 === 0 ? "var(--bg2)" : "var(--bg)",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--bg3)" : "none",
                  }}
                >
                  <span className="text-[1.2rem] shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-outfit font-medium text-[0.875rem]"
                      style={{ color: isActive ? "var(--forest-m)" : "var(--ink)" }}
                    >
                      {c.code}
                      <span
                        className="ml-1.5 font-normal text-[0.78rem]"
                        style={{ color: isActive ? "var(--forest)" : "var(--ink3)" }}
                      >
                        {c.symbol}
                      </span>
                    </p>
                    <p
                      className="font-outfit text-[0.75rem]"
                      style={{ color: isActive ? "var(--forest)" : "var(--ink4)" }}
                    >
                      {c.name}
                    </p>
                  </div>
                  {isActive && (
                    <CheckCircle2 size={18} strokeWidth={2} style={{ color: "var(--forest)" }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <p
          className="font-outfit text-[0.8rem] mb-4 px-1"
          style={{ color: "var(--expense)" }}
        >
          {error}
        </p>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 font-outfit font-medium text-[0.875rem] text-white py-[0.72rem] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50"
        style={{ background: "var(--forest)" }}
        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "var(--forest-m)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
      >
        {saving
          ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          : <>Continue <ArrowRight size={14} /></>
        }
      </button>
    </div>
  );
}