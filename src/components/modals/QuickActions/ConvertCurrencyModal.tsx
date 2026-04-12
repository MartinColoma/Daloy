import { useState, useMemo, useCallback } from "react";
import { RefreshCcw, ArrowLeft, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import ModalShell from "../ModalShell";
import { useCurrency } from "../../../hooks/useCurrency";
import { useExchangeRates } from "../../../hooks/useExchangeRates";

// ─── Supported currencies ─────────────────────────────────────────────────────
const SUPPORTED_CURRENCIES = [
  // Pinned
  { code: "PHP", name: "Philippine Peso",       flag: "🇵🇭" },
  { code: "USD", name: "US Dollar",             flag: "🇺🇸" },
  { code: "EUR", name: "Euro",                  flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",         flag: "🇬🇧" },
  // Southeast Asia
  { code: "SGD", name: "Singapore Dollar",      flag: "🇸🇬" },
  { code: "MYR", name: "Malaysian Ringgit",     flag: "🇲🇾" },
  { code: "IDR", name: "Indonesian Rupiah",     flag: "🇮🇩" },
  { code: "THB", name: "Thai Baht",             flag: "🇹🇭" },
  { code: "VND", name: "Vietnamese Dong",       flag: "🇻🇳" },
  { code: "BND", name: "Brunei Dollar",         flag: "🇧🇳" },
  { code: "KHR", name: "Cambodian Riel",        flag: "🇰🇭" },
  { code: "LAK", name: "Lao Kip",               flag: "🇱🇦" },
  { code: "MMK", name: "Myanmar Kyat",          flag: "🇲🇲" },
  { code: "TWD", name: "Taiwan Dollar",         flag: "🇹🇼" },
  // Major World
  { code: "JPY", name: "Japanese Yen",          flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan",          flag: "🇨🇳" },
  { code: "KRW", name: "South Korean Won",      flag: "🇰🇷" },
  { code: "HKD", name: "Hong Kong Dollar",      flag: "🇭🇰" },
  { code: "AUD", name: "Australian Dollar",     flag: "🇦🇺" },
  { code: "NZD", name: "New Zealand Dollar",    flag: "🇳🇿" },
  { code: "CAD", name: "Canadian Dollar",       flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc",           flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona",         flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone",       flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone",          flag: "🇩🇰" },
  { code: "INR", name: "Indian Rupee",          flag: "🇮🇳" },
  { code: "PKR", name: "Pakistani Rupee",       flag: "🇵🇰" },
  { code: "BDT", name: "Bangladeshi Taka",      flag: "🇧🇩" },
  { code: "LKR", name: "Sri Lankan Rupee",      flag: "🇱🇰" },
  { code: "NPR", name: "Nepalese Rupee",        flag: "🇳🇵" },
  { code: "MXN", name: "Mexican Peso",          flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real",        flag: "🇧🇷" },
  { code: "ARS", name: "Argentine Peso",        flag: "🇦🇷" },
  { code: "CLP", name: "Chilean Peso",          flag: "🇨🇱" },
  { code: "COP", name: "Colombian Peso",        flag: "🇨🇴" },
  { code: "ZAR", name: "South African Rand",    flag: "🇿🇦" },
  { code: "NGN", name: "Nigerian Naira",        flag: "🇳🇬" },
  { code: "GHS", name: "Ghanaian Cedi",         flag: "🇬🇭" },
  { code: "KES", name: "Kenyan Shilling",       flag: "🇰🇪" },
  { code: "TRY", name: "Turkish Lira",          flag: "🇹🇷" },
  { code: "PLN", name: "Polish Zloty",          flag: "🇵🇱" },
  { code: "CZK", name: "Czech Koruna",          flag: "🇨🇿" },
  { code: "HUF", name: "Hungarian Forint",      flag: "🇭🇺" },
  { code: "RUB", name: "Russian Ruble",         flag: "🇷🇺" },
  // Gulf & Middle East
  { code: "AED", name: "UAE Dirham",            flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal",           flag: "🇸🇦" },
  { code: "QAR", name: "Qatari Riyal",          flag: "🇶🇦" },
  { code: "KWD", name: "Kuwaiti Dinar",         flag: "🇰🇼" },
  { code: "BHD", name: "Bahraini Dinar",        flag: "🇧🇭" },
  { code: "OMR", name: "Omani Rial",            flag: "🇴🇲" },
  { code: "JOD", name: "Jordanian Dinar",       flag: "🇯🇴" },
  { code: "EGP", name: "Egyptian Pound",        flag: "🇪🇬" },
  { code: "ILS", name: "Israeli Shekel",        flag: "🇮🇱" },
];

const PINNED_CODES = ["PHP", "USD", "EUR", "GBP"];
const PRESETS = [1, 5, 10, 50, 100, 500, 1000];

// ─── Conversion — API rates are USD-based ────────────────────────────────────
function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  return (amount / (rates[from] ?? 1)) * (rates[to] ?? 1);
}

// ─── Cent-first helpers ───────────────────────────────────────────────────────
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

function numberToCentStr(n: number): string {
  return String(Math.round(n * 100));
}

// ─── Picker sub-view ─────────────────────────────────────────────────────────
type PickerTarget = "from" | "to";

interface CurrencyPickerProps {
  target: PickerTarget;
  selected: string;
  onSelect: (code: string) => void;
  onBack: () => void;
}

function CurrencyPicker({ target, selected, onSelect, onBack }: CurrencyPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return SUPPORTED_CURRENCIES;
    return SUPPORTED_CURRENCIES.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [search]);

  const pinned = filtered.filter(c => PINNED_CODES.includes(c.code));
  const rest   = filtered.filter(c => !PINNED_CODES.includes(c.code));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <button
          onClick={onBack}
          style={{
            marginTop: "2px", background: "none", border: "none",
            cursor: "pointer", color: "var(--ink3)", padding: "2px",
            display: "flex", alignItems: "center",
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <div>
          <p style={{ fontFamily: "Lora, serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
            {target === "from" ? "Convert from" : "Convert to"}
          </p>
          <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", color: "var(--ink3)", margin: "2px 0 0" }}>
            {target === "from" ? "Pick the currency you have" : "Pick the currency you want"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "0 12px", borderRadius: "var(--radius-sm)",
        border: "1.5px solid var(--bg3)", background: "var(--bg2)", height: "40px",
      }}>
        <Search size={14} color="var(--ink4)" strokeWidth={1.5} />
        <input
          autoFocus
          placeholder="Search currency or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontFamily: "Outfit, sans-serif", fontSize: "0.85rem", color: "var(--ink2)",
          }}
        />
      </div>

      {/* List */}
      <div style={{
        maxHeight: "320px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: "2px",
        marginRight: "-4px", paddingRight: "4px",
      }}>
        {!search && (
          <>
            <p style={{
              fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem",
              color: "var(--ink4)", letterSpacing: "0.15em", textTransform: "uppercase",
              margin: "0 0 4px 4px",
            }}>
              Common
            </p>
            {pinned.map(c => (
              <CurrencyRow key={c.code} currency={c} selected={selected} onSelect={onSelect} />
            ))}
            <div style={{ height: "1px", background: "var(--bg3)", margin: "8px 0" }} />
            <p style={{
              fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem",
              color: "var(--ink4)", letterSpacing: "0.15em", textTransform: "uppercase",
              margin: "0 0 4px 4px",
            }}>
              All currencies
            </p>
          </>
        )}

        {(search ? filtered : rest).map(c => (
          <CurrencyRow key={c.code} currency={c} selected={selected} onSelect={onSelect} />
        ))}

        {filtered.length === 0 && (
          <p style={{
            fontFamily: "Outfit, sans-serif", fontSize: "0.82rem",
            color: "var(--ink4)", textAlign: "center", padding: "24px 0", margin: 0,
          }}>
            No currencies found for "{search}"
          </p>
        )}
      </div>
    </div>
  );
}

function CurrencyRow({
  currency, selected, onSelect,
}: {
  currency: typeof SUPPORTED_CURRENCIES[0];
  selected: string;
  onSelect: (code: string) => void;
}) {
  const isSelected = currency.code === selected;
  return (
    <button
      onClick={() => onSelect(currency.code)}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "10px 12px", borderRadius: "var(--radius-sm)",
        border: `1.5px solid ${isSelected ? "var(--forest-xl)" : "transparent"}`,
        background: isSelected ? "var(--forest-bg)" : "transparent",
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg2)"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{currency.flag}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: "Outfit, sans-serif", fontSize: "0.88rem",
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? "var(--forest)" : "var(--ink2)", margin: 0,
        }}>
          {currency.code}
        </p>
        <p style={{
          fontFamily: "Outfit, sans-serif", fontSize: "0.72rem",
          color: "var(--ink4)", margin: "1px 0 0",
        }}>
          {currency.name}
        </p>
      </div>
      {isSelected && <CheckCircle2 size={16} color="var(--forest)" strokeWidth={1.5} />}
    </button>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertCurrencyModal({ isOpen, onClose }: Props) {
  const { currency: baseCurrency } = useCurrency();
  const { data: liveRates, isLoading, isError, dataUpdatedAt } = useExchangeRates();

  // null = converter view; "from"/"to" = picker sub-view
  const [picker,  setPicker]  = useState<PickerTarget | null>(null);
  const [fromCur, setFromCur] = useState("USD");
  const [toCur,   setToCur]   = useState(baseCurrency);
  const [centStr, setCentStr] = useState("100"); // starts at 1.00

  const rates    = liveRates ?? {} as Record<string, number>;
  const hasRates = Object.keys(rates).length > 0;

  const numericAmount = centStrToNumber(centStr);
  const result = hasRates ? convertAmount(numericAmount, fromCur, toCur, rates) : 0;
  const rate   = hasRates ? convertAmount(1, fromCur, toCur, rates) : 0;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const fromMeta = SUPPORTED_CURRENCIES.find(c => c.code === fromCur);
  const toMeta   = SUPPORTED_CURRENCIES.find(c => c.code === toCur);

  const handleAmountKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setCentStr(s => s.slice(0, -1));
    } else if (/^\d$/.test(e.key)) {
      setCentStr(s => {
        const next = (s + e.key).replace(/^0+/, "") || "";
        if (parseInt(next || "0", 10) > 99_999_999_999) return s;
        return next;
      });
    }
    e.preventDefault();
  }, []);

  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
    setCentStr(numberToCentStr(result));
  };

  const handleClose = () => {
    setPicker(null);
    setCentStr("100");
    onClose();
  };

  // ── Picker sub-view — replaces converter content when active ────────────────
  if (picker !== null) {
    return (
      <ModalShell
        isOpen={isOpen}
        onClose={handleClose}
        title="" subtitle="" icon={null}
        accentColor={picker === "from" ? "var(--forest)" : "var(--steel-m)"}
      >
        <CurrencyPicker
          target={picker}
          selected={picker === "from" ? fromCur : toCur}
          onSelect={code => {
            if (picker === "from") setFromCur(code);
            else setToCur(code);
            setPicker(null); // return to converter
          }}
          onBack={() => setPicker(null)}
        />
      </ModalShell>
    );
  }

  // ── Converter view (default / initial) ─────────────────────────────────────
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Convert Currency"
      subtitle="Quick exchange rate lookup"
      icon={<RefreshCcw size={18} strokeWidth={1.5} />}
      accentColor="var(--steel-m)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Error notice */}
        {isError && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 12px", borderRadius: "var(--radius-sm)",
            background: "var(--gold-bg)", border: "1px solid var(--gold-l)",
          }}>
            <AlertCircle size={14} color="var(--gold)" strokeWidth={1.5} />
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.75rem", color: "var(--gold)", margin: 0 }}>
              Couldn't fetch live rates. Rates may be outdated.
            </p>
          </div>
        )}

        {/* From */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">From</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Currency pill → opens from-picker on click */}
            <button
              onClick={() => setPicker("from")}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "0 12px", height: "44px", borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--bg3)", background: "var(--bg2)",
                cursor: "pointer", flexShrink: 0, transition: "background 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
            >
              <span style={{ fontSize: "1rem" }}>{fromMeta?.flag}</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem", color: "var(--ink2)" }}>
                {fromCur}
              </span>
            </button>
            {/* Cent-first amount input */}
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: "4px",
              padding: "0 12px", borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--bg3)", background: "var(--bg2)", height: "44px",
            }}>
              <span style={{
                fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem",
                color: "var(--ink4)", flexShrink: 0,
              }}>
                {fromMeta?.code}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0.00"
                value={centStrToDisplay(centStr)}
                onKeyDown={handleAmountKey}
                onChange={() => {/* controlled via onKeyDown */}}
                autoFocus
                style={{
                  flex: 1, border: "none", background: "transparent", outline: "none",
                  fontFamily: "IBM Plex Mono, monospace", fontSize: "1.1rem",
                  color: "var(--ink)", textAlign: "right",
                }}
              />
            </div>
          </div>
        </div>

        {/* Swap + Rate */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ height: "1px", flex: 1, background: "var(--bg3)" }} />
          <button
            onClick={swap}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "100px",
              border: "1.5px solid var(--bg3)", background: "var(--bg2)",
              cursor: "pointer", fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.65rem", color: "var(--ink3)", transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <RefreshCcw size={11} strokeWidth={1.5} />
            {isLoading ? "loading…" : `1 ${fromCur} = ${rate.toFixed(4)} ${toCur}`}
          </button>
          <div style={{ height: "1px", flex: 1, background: "var(--bg3)" }} />
        </div>

        {/* To */}
        <div className="daloy-field">
          <label className="daloy-eyebrow">To</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Currency pill → opens to-picker on click */}
            <button
              onClick={() => setPicker("to")}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "0 12px", height: "44px", borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--bg3)", background: "var(--bg2)",
                cursor: "pointer", flexShrink: 0, transition: "background 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
            >
              <span style={{ fontSize: "1rem" }}>{toMeta?.flag}</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem", color: "var(--ink2)" }}>
                {toCur}
              </span>
            </button>
            {/* Result display */}
            <div style={{
              flex: 1, display: "flex", alignItems: "center",
              padding: "0 12px", borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--bg3)", background: "var(--bg3)", height: "44px",
            }}>
              {isLoading ? (
                <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem", color: "var(--ink4)", margin: 0 }}>
                  fetching…
                </p>
              ) : (
                <p style={{
                  fontFamily: "IBM Plex Mono, monospace", fontSize: "1.4rem",
                  fontWeight: 500, color: "var(--forest)", margin: 0,
                }}>
                  {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="daloy-field">
          <label className="daloy-label">Quick amounts in {fromCur}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {PRESETS.map(p => {
              const isActive = centStr === numberToCentStr(p);
              return (
                <button
                  key={p}
                  onClick={() => setCentStr(numberToCentStr(p))}
                  style={{
                    padding: "5px 12px", borderRadius: "100px",
                    border: `1.5px solid ${isActive ? "var(--steel-m)" : "var(--bg3)"}`,
                    background: isActive ? "var(--steel-bg)" : "var(--bg2)",
                    fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem",
                    color: isActive ? "var(--steel)" : "var(--ink3)",
                    cursor: "pointer", transition: "all 0.12s",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rate info */}
        <div style={{
          padding: "10px 12px", borderRadius: "var(--radius-sm)",
          background: "var(--steel-bg)", border: "1px solid var(--steel-m)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px",
        }}>
          <div>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", fontWeight: 500, color: "var(--steel)", margin: 0 }}>
              Exchange rate
            </p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem", color: "var(--steel-m)", margin: "2px 0 0" }}>
              1 {fromCur} = {isLoading ? "…" : rate.toFixed(6)} {toCur}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.65rem", color: "var(--ink4)", margin: 0 }}>
              {isLoading
                ? "Fetching rates…"
                : isError
                  ? "Rate fetch failed"
                  : lastUpdated
                    ? `Updated ${lastUpdated}`
                    : "Live rates"}
            </p>
            {/* <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.62rem", color: "var(--ink4)", margin: "1px 0 0" }}>
              via ExchangeRate-API
            </p> */}
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.62rem", color: "var(--ink4)", margin: "1px 0 0" }}>
              via Frankfurter (ECB)
            </p>
          </div>
        </div>

        {/* CTA: Log transaction hint */}
        {/* <div style={{
          padding: "10px 12px", borderRadius: "var(--radius-sm)",
          background: "var(--bg2)", border: "1.5px solid var(--bg3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", color: "var(--ink3)", margin: 0 }}>
            Made a purchase in {fromCur}?
          </p>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              fontFamily: "Outfit, sans-serif", fontSize: "0.75rem", fontWeight: 500,
              color: "var(--forest)", background: "transparent", border: "none",
              cursor: "pointer", padding: 0,
            }}
          >
            Log expense <ArrowRight size={11} strokeWidth={1.5} />
          </button>
        </div> */}
      </div>
    </ModalShell>
  );
}