import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { patchBaseCurrency } from "../../services/onboarding/onboardingService";

/* ─────────────────────────────────────────────
   StepCurrency.tsx — Onboarding Step 1
   Pick base currency. Default: PHP.
   Curated list of ~50 real-world currencies,
   grouped: Pinned (top) → Southeast Asia → Major World → Gulf & Middle East → Others
───────────────────────────────────────────── */

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// ── Pinned — shown at the very top, always visible ────────────
const PINNED: Currency[] = [
  { code: "PHP", name: "Philippine Peso",   symbol: "₱",  flag: "🇵🇭" },
  { code: "USD", name: "US Dollar",         symbol: "$",  flag: "🇺🇸" },
  { code: "EUR", name: "Euro",              symbol: "€",  flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",     symbol: "£",  flag: "🇬🇧" },
];

// ── Southeast Asia ─────────────────────────────────────────────
const SOUTHEAST_ASIA: Currency[] = [
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$", flag: "🇸🇬" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  { code: "THB", name: "Thai Baht",         symbol: "฿",  flag: "🇹🇭" },
  { code: "VND", name: "Vietnamese Dong",   symbol: "₫",  flag: "🇻🇳" },
  { code: "BND", name: "Brunei Dollar",     symbol: "B$", flag: "🇧🇳" },
  { code: "KHR", name: "Cambodian Riel",    symbol: "៛",  flag: "🇰🇭" },
  { code: "LAK", name: "Lao Kip",           symbol: "₭",  flag: "🇱🇦" },
  { code: "MMK", name: "Myanmar Kyat",      symbol: "K",  flag: "🇲🇲" },
  { code: "TWD", name: "Taiwan Dollar",     symbol: "NT$",flag: "🇹🇼" },
];

// ── Major World ────────────────────────────────────────────────
const MAJOR_WORLD: Currency[] = [
  { code: "JPY", name: "Japanese Yen",         symbol: "¥",   flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan",          symbol: "¥",   flag: "🇨🇳" },
  { code: "KRW", name: "South Korean Won",      symbol: "₩",   flag: "🇰🇷" },
  { code: "HKD", name: "Hong Kong Dollar",      symbol: "HK$", flag: "🇭🇰" },
  { code: "AUD", name: "Australian Dollar",     symbol: "A$",  flag: "🇦🇺" },
  { code: "NZD", name: "New Zealand Dollar",    symbol: "NZ$", flag: "🇳🇿" },
  { code: "CAD", name: "Canadian Dollar",       symbol: "C$",  flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc",           symbol: "Fr",  flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona",         symbol: "kr",  flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone",       symbol: "kr",  flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone",          symbol: "kr",  flag: "🇩🇰" },
  { code: "INR", name: "Indian Rupee",          symbol: "₹",   flag: "🇮🇳" },
  { code: "PKR", name: "Pakistani Rupee",       symbol: "₨",   flag: "🇵🇰" },
  { code: "BDT", name: "Bangladeshi Taka",      symbol: "৳",   flag: "🇧🇩" },
  { code: "LKR", name: "Sri Lankan Rupee",      symbol: "₨",   flag: "🇱🇰" },
  { code: "NPR", name: "Nepalese Rupee",        symbol: "₨",   flag: "🇳🇵" },
  { code: "MXN", name: "Mexican Peso",          symbol: "$",   flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real",        symbol: "R$",  flag: "🇧🇷" },
  { code: "ARS", name: "Argentine Peso",        symbol: "$",   flag: "🇦🇷" },
  { code: "CLP", name: "Chilean Peso",          symbol: "$",   flag: "🇨🇱" },
  { code: "COP", name: "Colombian Peso",        symbol: "$",   flag: "🇨🇴" },
  { code: "ZAR", name: "South African Rand",    symbol: "R",   flag: "🇿🇦" },
  { code: "NGN", name: "Nigerian Naira",        symbol: "₦",   flag: "🇳🇬" },
  { code: "GHS", name: "Ghanaian Cedi",         symbol: "₵",   flag: "🇬🇭" },
  { code: "KES", name: "Kenyan Shilling",       symbol: "KSh", flag: "🇰🇪" },
  { code: "TRY", name: "Turkish Lira",          symbol: "₺",   flag: "🇹🇷" },
  { code: "PLN", name: "Polish Złoty",          symbol: "zł",  flag: "🇵🇱" },
  { code: "CZK", name: "Czech Koruna",          symbol: "Kč",  flag: "🇨🇿" },
  { code: "HUF", name: "Hungarian Forint",      symbol: "Ft",  flag: "🇭🇺" },
  { code: "RUB", name: "Russian Ruble",         symbol: "₽",   flag: "🇷🇺" },
];

// ── Gulf & Middle East — large OFW destination ─────────────────
const GULF: Currency[] = [
  { code: "AED", name: "UAE Dirham",       symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal",      symbol: "﷼",   flag: "🇸🇦" },
  { code: "QAR", name: "Qatari Riyal",     symbol: "﷼",   flag: "🇶🇦" },
  { code: "KWD", name: "Kuwaiti Dinar",    symbol: "د.ك", flag: "🇰🇼" },
  { code: "BHD", name: "Bahraini Dinar",   symbol: ".د.ب",flag: "🇧🇭" },
  { code: "OMR", name: "Omani Rial",       symbol: "﷼",   flag: "🇴🇲" },
  { code: "JOD", name: "Jordanian Dinar",  symbol: "د.ا", flag: "🇯🇴" },
  { code: "EGP", name: "Egyptian Pound",   symbol: "£",   flag: "🇪🇬" },
  { code: "ILS", name: "Israeli Shekel",   symbol: "₪",   flag: "🇮🇱" },
];

// ── Sections for grouped rendering ────────────────────────────
const SECTIONS = [
  { label: "Southeast Asia",      currencies: SOUTHEAST_ASIA },
  { label: "Major World",         currencies: MAJOR_WORLD    },
  { label: "Gulf & Middle East",  currencies: GULF           },
] as const;

const ALL_CURRENCIES: Currency[] = [
  ...PINNED,
  ...SOUTHEAST_ASIA,
  ...MAJOR_WORLD,
  ...GULF,
];

/* ─────────────────────────────────────────────────────────────── */

export default function StepCurrency() {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);
  const setUser  = useAuthStore(s => s.setUser);

  const [selected, setSelected] = useState(user?.baseCurrency ?? "PHP");
  const [query,    setQuery]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // When searching, flatten to a single list. Otherwise show grouped.
  const isSearching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    return ALL_CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [query, isSearching]);

  async function handleContinue() {
    setSaving(true);
    setError(null);
    try {
      await patchBaseCurrency(selected);
      if (user) setUser({ ...user, baseCurrency: selected });
      navigate("/onboarding/wallets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save currency. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Shared row renderer ──────────────────────────────────────
  function CurrencyRow({ c, isLast }: { c: Currency; isLast: boolean }) {
    const isActive = selected === c.code;
    return (
      <button
        key={c.code}
        onClick={() => setSelected(c.code)}
        className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
        style={{
          background:   isActive ? "var(--forest-bg)" : "transparent",
          borderBottom: isLast ? "none" : "1px solid var(--bg3)",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = isActive ? "var(--forest-bg)" : "transparent"; }}
      >
        <span className="text-[1.2rem] shrink-0">{c.flag}</span>
        <div className="flex-1 min-w-0">
          <p
            className="font-outfit font-medium text-[0.875rem]"
            style={{ color: isActive ? "var(--forest-m)" : "var(--ink)" }}
          >
            {c.code}
            <span
              className="ml-1.5 font-mono font-normal text-[0.75rem]"
              style={{ color: isActive ? "var(--forest)" : "var(--ink4)" }}
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
  }

  // ── Selected currency preview pill ───────────────────────────
  const selectedCurrency = ALL_CURRENCIES.find(c => c.code === selected);

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
        className="font-outfit font-light text-[0.9rem] mb-5"
        style={{ color: "var(--ink3)" }}
      >
        All amounts will be stored and shown in this currency.
        You can still log transactions in other currencies.
      </p>

      {/* Selected preview */}
      {selectedCurrency && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] mb-5 w-fit"
          style={{ background: "var(--forest-bg)", border: "1px solid var(--forest-xl)" }}
        >
          <span className="text-[1rem]">{selectedCurrency.flag}</span>
          <span className="font-outfit font-semibold text-[0.82rem]" style={{ color: "var(--forest-m)" }}>
            {selectedCurrency.code}
          </span>
          <span className="font-mono text-[0.75rem]" style={{ color: "var(--forest)" }}>
            {selectedCurrency.symbol}
          </span>
          <span className="font-outfit text-[0.75rem]" style={{ color: "var(--forest)" }}>
            {selectedCurrency.name}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--ink4)" }}
        />
        <input
          type="text"
          placeholder="Search by name or code..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full font-outfit text-[0.875rem] rounded-[var(--radius-sm)] pl-10 pr-4 py-[0.65rem] outline-none transition-colors"
          style={{
            background: "var(--bg2)",
            border:     "1.5px solid var(--bg3)",
            color:      "var(--ink)",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; }}
          onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
        />
      </div>

      {/* Currency list */}
      <div
        className="rounded-[var(--radius-md)] overflow-hidden mb-6"
        style={{ border: "1px solid var(--bg3)", background: "var(--bg2)" }}
      >
        <div className="max-h-[340px] overflow-y-auto">

          {/* ── Search results (flat list) ── */}
          {isSearching ? (
            searchResults.length === 0 ? (
              <p
                className="font-outfit text-[0.85rem] text-center py-8"
                style={{ color: "var(--ink4)" }}
              >
                No currencies found for "{query}".
              </p>
            ) : (
              searchResults.map((c, i) => (
                <CurrencyRow key={c.code} c={c} isLast={i === searchResults.length - 1} />
              ))
            )

          ) : (
            /* ── Grouped list (default) ── */
            <>
              {/* Pinned section — no label, always on top */}
              {PINNED.map((c) => (
                <CurrencyRow key={c.code} c={c} isLast={false} />
              ))}

              {/* Remaining sections with labels */}
              {SECTIONS.map(section => (
                <div key={section.label}>
                  <div
                    className="px-4 py-1.5 font-mono text-[0.57rem] tracking-[0.18em] uppercase sticky top-0"
                    style={{ background: "var(--bg3)", color: "var(--ink4)" }}
                  >
                    {section.label}
                  </div>
                  {section.currencies.map((c, i) => (
                    <CurrencyRow
                      key={c.code}
                      c={c}
                      isLast={i === section.currencies.length - 1}
                    />
                  ))}
                </div>
              ))}
            </>
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