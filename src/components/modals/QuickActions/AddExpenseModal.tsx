import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Plus, Trash2, Package, Receipt, RefreshCw } from "lucide-react";
import ModalShell from "../ModalShell";
import { useLayout } from "../../../layouts/LayoutContext";
import { useExchangeRates } from "../../../hooks/currency/useExchangeRates";
import {
  fetchAddExpenseOptions,
  createExpense,
  createExpenseBulk,
} from "../../../services/quickActions/quickActionsService";
import type {
  ExpenseCategoryOption,
  WalletOption,
} from "../../../types/home/quickActions.types";

// ── Currency list (codes only — pulled from your SUPPORTED_CURRENCIES) ───────
const CURRENCY_CODES = [
  "PHP","USD","EUR","GBP","SGD","MYR","IDR","THB","VND","BND","KHR","LAK",
  "MMK","TWD","JPY","CNY","KRW","HKD","AUD","NZD","CAD","CHF","SEK","NOK",
  "DKK","INR","PKR","BDT","LKR","NPR","MXN","BRL","ARS","CLP","COP","ZAR",
  "NGN","GHS","KES","TRY","PLN","CZK","HUF","RUB","AED","SAR","QAR","KWD",
  "BHD","OMR","JOD","EGP","ILS",
];

// ── Types ────────────────────────────────────────────────────
type Mode = "single" | "multi";

interface LineItem {
  id:          string;
  centStr:     string;
  description: string;
}

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────
function makeCentKey(e: React.KeyboardEvent<HTMLInputElement>, prev: string): string {
  if (e.key === "Backspace") return prev.slice(0, -1);
  if (/^\d$/.test(e.key)) {
    const next = (prev + e.key).replace(/^0+/, "") || "";
    if (parseInt(next, 10) > 99_999_999_999) return prev;
    return next;
  }
  return prev;
}

function centsToDisplay(centStr: string): string {
  if (!centStr) return "";
  return (parseInt(centStr, 10) / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function centsToNumber(centStr: string): number {
  return centStr ? parseInt(centStr, 10) / 100 : 0;
}

// ── Component ────────────────────────────────────────────────
// Spin keyframe injected once for the rate-loading icon
const spinStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;
if (typeof document !== "undefined" && !document.getElementById("daloy-spin")) {
  const s = document.createElement("style");
  s.id = "daloy-spin"; s.textContent = spinStyle;
  document.head.appendChild(s);
}
export default function AddExpenseModal({ isOpen, onClose }: Props) {
  const { onModalSuccess } = useLayout();

  // ── Exchange rates (base = PHP; refetched hourly by React Query) ─────────
  // We always fetch PHP-based rates so we can convert any → PHP.
  // If the wallet itself is foreign (e.g. USD wallet), we derive:
  //   rate = PHP/walletCurrency  →  walletAmount = originalAmount / rate
  const {
    data:    rates,
    isError: ratesError,
    isFetching: ratesFetching,
  } = useExchangeRates("PHP");

  /**
   * Returns how many units of `toCurrency` equal 1 unit of `fromCurrency`.
   * Falls back to 1 (no conversion) if rates aren't loaded yet.
   */
  const getRate = useCallback((from: string, to: string): number => {
    if (from === to) return 1;
    if (!rates)      return 1;          // rates not loaded — caller should guard
    // rates map is PHP-based: { USD: 0.0175, EUR: 0.016, PHP: 1, … }
    // to convert from→to: divide by from-rate, multiply by to-rate
    const fromRate = rates[from] ?? 1;
    const toRate   = rates[to]   ?? 1;
    return toRate / fromRate;
  }, [rates]);

  // ── Mode ────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("single");

  // ── Shared fields ───────────────────────────────────────────
  const [walletId,    setWalletId]    = useState("");
  const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
  const [note,        setNote]        = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // ── Single-mode fields ──────────────────────────────────────
  const [centStr,     setCentStr]     = useState("");
  const [description, setDescription] = useState("");
  const [categoryId,  setCategoryId]  = useState("");
  const [currency,    setCurrency]    = useState("PHP");

  // ── Multi-mode line items ───────────────────────────────────
  const makeItem = (): LineItem => ({
    id:          crypto.randomUUID(),
    centStr:     "",
    description: "",
  });
  const [items,           setItems]           = useState<LineItem[]>([]);
  const [multiCategoryId, setMultiCategoryId] = useState("");
  const [multiCurrency,   setMultiCurrency]   = useState("PHP"); // shared currency for all items

  // ── Remote data ─────────────────────────────────────────────
  const [categories, setCategories] = useState<ExpenseCategoryOption[]>([]);
  const [wallets,    setWallets]    = useState<WalletOption[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Load options ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    fetchAddExpenseOptions()
      .then(({ categories, wallets }) => {
        setCategories(categories);
        setWallets(wallets);
        const defaultCat = categories[0]?.id ?? "";
        const defaultWal = wallets[0]?.id   ?? "";
        if (categories.length > 0) { setCategoryId(defaultCat); setMultiCategoryId(defaultCat); }
        if (wallets.length > 0) {
          setWalletId(defaultWal);
          setMultiCurrency(wallets[0]?.currency ?? "PHP");
        }
        setItems([makeItem(), makeItem()]);
      })
      .catch(() => setError("Failed to load options. Please try again."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // ── Derived: single mode ─────────────────────────────────────
  const singleAmount       = centsToNumber(centStr);
  const selectedWallet     = wallets.find(w => w.id === walletId);
  const walletCurrency     = selectedWallet?.currency ?? "PHP";
  const walletBalance      = selectedWallet?.balance  ?? 0;

  // Amount in wallet's currency (what will actually be deducted)
  const singleRate         = getRate(currency, walletCurrency);
  const singleBaseAmount   = singleAmount * singleRate;
  const needsConversion    = currency !== walletCurrency;
  const singleInsufficient =
    !!centStr && singleAmount > 0 && !!rates && singleBaseAmount > walletBalance;

  // ── Derived: multi mode ──────────────────────────────────────
  // All items share one currency (the merchant's currency) — convert once to wallet currency
  const multiRate          = getRate(multiCurrency, walletCurrency);
  const multiTotal         = items.reduce((sum, it) => sum + centsToNumber(it.centStr), 0) * multiRate;
  const multiInsufficient  = !!rates && multiTotal > walletBalance && items.some(i => i.centStr);
  const multiNeedsConv     = multiCurrency !== walletCurrency;

  // ── Handlers: single ─────────────────────────────────────────
  const handleAmountKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setCentStr(prev => makeCentKey(e, prev));
    e.preventDefault();
  }, []);

  // ── Handlers: multi ──────────────────────────────────────────
  const handleItemAmountKey = useCallback(
    (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
      setItems(prev => prev.map(it =>
        it.id === id ? { ...it, centStr: makeCentKey(e, it.centStr) } : it
      ));
      e.preventDefault();
    },
    [],
  );

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));

  const addItem = () =>
    setItems(prev => [...prev, makeItem()]);

  const removeItem = (id: string) =>
    setItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev);

  // ── Reset ────────────────────────────────────────────────────
  const handleClose = () => {
    setCentStr(""); setDescription(""); setNote(""); setIsRecurring(false);
    setCurrency("PHP"); setMultiCurrency(walletCurrency); setError(null);
    const defaultCat = categories[0]?.id ?? "";
    setItems([makeItem(), makeItem()]);
    setMultiCategoryId(defaultCat);
    setMode("single");
    onClose();
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "single") {
        const exchangeRate = getRate(currency, walletCurrency);
        const baseAmount   = singleAmount * exchangeRate;
        await createExpense({
          walletId, categoryId,
          amount:           baseAmount,
          originalAmount:   singleAmount,
          originalCurrency: currency,
          exchangeRate,
          description,
          transactedAt: new Date(date).toISOString(),
          note: note || undefined,
          isRecurring,
        });
      } else {
        const validItems   = items.filter(it => it.centStr && it.description.trim());
        const exchangeRate = getRate(multiCurrency, walletCurrency);
        const payload = validItems.map(it => {
          const amt = centsToNumber(it.centStr);
          return {
            walletId,
            categoryId:       multiCategoryId,
            amount:           amt * exchangeRate,
            originalAmount:   amt,
            originalCurrency: multiCurrency,
            exchangeRate,
            description:      it.description.trim(),
            transactedAt:     new Date(date).toISOString(),
            note:             note || undefined,
            isRecurring,
          };
        });
        await createExpenseBulk(payload);
      }

      onModalSuccess?.();
      handleClose();
    } catch {
      setError("Failed to save expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Disabled logic ───────────────────────────────────────────
  const ratesNeeded    = needsConversion || multiNeedsConv;
  const ratesNotReady    = ratesNeeded && !rates;
  const singleDisabled   =
    !centStr || !description || submitting || loading || singleInsufficient || ratesNotReady;
  const multiDisabled    =
    items.every(it => !it.centStr || !it.description.trim()) || submitting || loading || multiInsufficient || ratesNotReady;
  const isDisabled = mode === "single" ? singleDisabled : multiDisabled;

  // ── Styles ───────────────────────────────────────────────────
  const tabBase: React.CSSProperties = {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
    padding: "8px 12px",
    border: "none", cursor: "pointer",
    fontFamily: "Outfit, sans-serif", fontSize: "0.82rem", fontWeight: 500,
    borderRadius: "var(--radius-sm)",
    transition: "background 0.15s, color 0.15s",
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Expense"
      subtitle={mode === "single" ? "Record money going out" : "Record multiple items at once"}
      icon={<ShoppingCart size={18} strokeWidth={1.5} />}
      accentColor="var(--expense)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── Mode toggle ──────────────────────────────────── */}
        <div style={{
          display: "flex", gap: "4px",
          padding: "4px",
          background: "var(--bg2)",
          borderRadius: "var(--radius-sm)",
          border: "1.5px solid var(--bg3)",
        }}>
          <button
            style={{
              ...tabBase,
              background: mode === "single" ? "white" : "transparent",
              color:      mode === "single" ? "var(--ink)"  : "var(--ink4)",
              boxShadow:  mode === "single" ? "var(--shadow-sm)" : "none",
            }}
            onClick={() => setMode("single")}
          >
            <Receipt size={14} strokeWidth={1.5} />
            Single Item
          </button>
          <button
            style={{
              ...tabBase,
              background: mode === "multi" ? "white" : "transparent",
              color:      mode === "multi" ? "var(--ink)"  : "var(--ink4)",
              boxShadow:  mode === "multi" ? "var(--shadow-sm)" : "none",
            }}
            onClick={() => setMode("multi")}
          >
            <Package size={14} strokeWidth={1.5} />
            Multiple Items
          </button>
        </div>

        {/* ── Error banner ─────────────────────────────────── */}
        {error && (
          <p style={{
            padding: "10px 12px",
            background: "var(--clay-bg)", border: "1.5px solid var(--clay-m)",
            borderRadius: "var(--radius-sm)", color: "var(--clay)",
            fontSize: "0.82rem", fontFamily: "Outfit, sans-serif", margin: 0,
          }}>
            {error}
          </p>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/*  SINGLE MODE                                       */}
        {/* ══════════════════════════════════════════════════ */}
        {mode === "single" && (
          <>
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
                  {CURRENCY_CODES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input
                  className="daloy-input-mono"
                  type="text" inputMode="numeric" placeholder="0.00"
                  value={centsToDisplay(centStr)}
                  onKeyDown={handleAmountKey}
                  onChange={() => {}}
                  style={{
                    color: singleInsufficient ? "var(--clay)" : "var(--expense)",
                    transition: "color 0.15s",
                  }}
                />
              </div>

              {/* FX hint — only show when currency differs from wallet */}
              {needsConversion && centStr && (
                <p className="daloy-hint" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {ratesFetching && <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} />}
                  {rates
                    ? <>≈ {walletCurrency} {singleBaseAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · rate {singleRate.toFixed(4)}</>
                    : ratesError ? "⚠ Could not load exchange rate" : "Loading rate…"
                  }
                </p>
              )}

              {singleInsufficient && <InsufficientBanner wallet={selectedWallet} balance={walletBalance} currency={walletCurrency} />}
            </div>

            {/* Description */}
            <div className="daloy-field">
              <label className="daloy-label">Description</label>
              <input
                className="daloy-input"
                type="text" placeholder="e.g. SM Supermarket"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Category + Wallet */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="daloy-field">
                <label className="daloy-label">Category</label>
                <select
                  className="daloy-select" value={categoryId}
                  onChange={e => setCategoryId(e.target.value)} disabled={loading}
                >
                  {loading ? <option>Loading…</option> : categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="daloy-field">
                <label className="daloy-label">Wallet</label>
                <WalletSelect wallets={wallets} value={walletId} onChange={setWalletId} loading={loading} />
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/*  MULTI MODE                                        */}
        {/* ══════════════════════════════════════════════════ */}
        {mode === "multi" && (
          <>
            {/* Shared: Wallet + Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="daloy-field">
                <label className="daloy-label">Pay from Wallet</label>
                <WalletSelect wallets={wallets} value={walletId} onChange={setWalletId} loading={loading} />
              </div>
              <div className="daloy-field">
                <label className="daloy-label">Category</label>
                <select
                  className="daloy-select"
                  value={multiCategoryId}
                  onChange={e => setMultiCategoryId(e.target.value)}
                  disabled={loading}
                >
                  {loading ? <option>Loading…</option> : categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shared: Receipt currency */}
            <div className="daloy-field">
              <label className="daloy-label">
                Receipt Currency
                <span style={{ color: "var(--ink4)", fontWeight: 400, marginLeft: 4 }}>
                  — all items on this receipt are in this currency
                </span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select
                  className="daloy-select"
                  value={multiCurrency}
                  onChange={e => setMultiCurrency(e.target.value)}
                  style={{ width: "110px", flexShrink: 0 }}
                >
                  {CURRENCY_CODES.map(c => <option key={c}>{c}</option>)}
                </select>
                {multiNeedsConv && (
                  <p className="daloy-hint" style={{ margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                    {ratesFetching && <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} />}
                    {rates
                      ? <>1 {multiCurrency} = {walletCurrency} {multiRate.toFixed(4)} · total deducted from {selectedWallet?.name}</>
                      : ratesError ? "⚠ Could not load rate" : "Loading rate…"
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Rates error warning */}
            {ratesError && (
              <p style={{
                padding: "8px 12px",
                background: "var(--gold-bg)", border: "1.5px solid var(--gold-l)",
                borderRadius: "var(--radius-sm)", color: "var(--gold)",
                fontSize: "0.78rem", fontFamily: "Outfit, sans-serif", margin: 0,
              }}>
                ⚠ Could not load exchange rates. Same-currency items will still work.
              </p>
            )}

            {/* Multi-total display */}
            {multiTotal > 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px",
                background: multiInsufficient ? "var(--clay-bg)" : "var(--forest-bg)",
                border: `1.5px solid ${multiInsufficient ? "var(--clay-m)" : "var(--forest-xl)"}`,
                borderRadius: "var(--radius-sm)",
              }}>
                <span style={{
                  fontFamily: "Outfit, sans-serif", fontSize: "0.8rem",
                  color: multiInsufficient ? "var(--clay)" : "var(--forest)",
                  fontWeight: 500, display: "flex", alignItems: "center", gap: "5px",
                }}>
                  {ratesFetching && <RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} />}
                  {multiInsufficient ? "Insufficient balance" : "Total"}
                </span>
                <span style={{
                  fontFamily: "IBM Plex Mono, monospace", fontSize: "0.95rem", fontWeight: 500,
                  color: multiInsufficient ? "var(--clay)" : "var(--expense)",
                }}>
                  {walletCurrency} {multiTotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Line items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 32px",
                gap: "6px",
                padding: "0 2px",
              }}>
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", fontWeight: 500, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Item</span>
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", fontWeight: 500, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Amount</span>
                <span />
              </div>

              {items.map((item, idx) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  index={idx}
                  currency={multiCurrency}  
                  onAmountKey={handleItemAmountKey}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                />
              ))}
            </div>

            <button
              onClick={addItem}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "9px",
                background: "transparent",
                border: "1.5px dashed var(--bg3)",
                borderRadius: "var(--radius-sm)",
                color: "var(--ink4)", cursor: "pointer",
                fontFamily: "Outfit, sans-serif", fontSize: "0.82rem",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--forest-l)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--forest)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bg3)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--ink4)";
              }}
            >
              <Plus size={14} strokeWidth={2} />
              Add item
            </button>
          </>
        )}

        {/* ── Shared: Date ─────────────────────────────────── */}
        <div className="daloy-field">
          <label className="daloy-label">Date</label>
          <input
            className="daloy-input" type="date" value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* ── Shared: Note ─────────────────────────────────── */}
        <div className="daloy-field">
          <label className="daloy-label">
            Note <span style={{ color: "var(--ink4)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            className="daloy-input" type="text"
            placeholder="Any extra details…"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* ── Shared: Recurring toggle ─────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
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
              width: "42px", height: "24px", borderRadius: "100px",
              background: isRecurring ? "var(--forest)" : "var(--bg3)",
              border: "none", cursor: "pointer",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
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

        {/* ── Actions ──────────────────────────────────────── */}
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
              background: isDisabled ? "var(--bg3)" : "var(--expense)",
              color:      isDisabled ? "var(--ink4)" : "white",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {submitting
              ? "Saving…"
              : mode === "multi"
                ? `Save ${items.filter(i => i.centStr && i.description).length || ""} Expenses`
                : "Save Expense"
            }
          </button>
        </div>

      </div>
    </ModalShell>
  );
}

// ── Sub-components ────────────────────────────────────────────

function WalletSelect({
  wallets, value, onChange, loading,
}: {
  wallets: WalletOption[]; value: string;
  onChange: (v: string) => void; loading: boolean;
}) {
  return (
    <select
      className="daloy-select" value={value}
      onChange={e => onChange(e.target.value)} disabled={loading}
    >
      {loading ? <option>Loading…</option> : wallets.map(w => (
        <option key={w.id} value={w.id}>
          {w.name} · {w.currency}{" "}
          {w.balance.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </option>
      ))}
    </select>
  );
}

function InsufficientBanner({
  wallet, balance, currency,
}: {
  wallet:   WalletOption | undefined;
  balance:  number;
  currency: string;
}) {
  return (
    <p style={{
      padding: "10px 12px",
      background: "var(--clay-bg)", border: "1.5px solid var(--clay-m)",
      borderRadius: "var(--radius-sm)", color: "var(--clay)",
      fontSize: "0.82rem", fontFamily: "Outfit, sans-serif",
      margin: "4px 0 0", lineHeight: 1.5,
    }}>
      Insufficient balance.{" "}
      <strong>{wallet?.name}</strong> only has{" "}
      <strong>
        {currency}{" "}
        {balance.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </strong>.{" "}
      Log income to this wallet first, or choose a different wallet.
    </p>
  );
}

// LineItemRow — add currency to props and update the grid + amount cell
function LineItemRow({
  item, index, currency,
  onAmountKey, onUpdate, onRemove, canRemove,
}: {
  item:         LineItem;
  index:        number;
  currency:     string;
  onAmountKey:  (id: string, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUpdate:     (id: string, patch: Partial<LineItem>) => void;
  onRemove:     (id: string) => void;
  canRemove:    boolean;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 140px 32px",
      gap: "6px",
      alignItems: "center",
    }}>
      <input
        className="daloy-input"
        type="text"
        placeholder={`Item ${index + 1}`}
        value={item.description}
        onChange={e => onUpdate(item.id, { description: e.target.value })}
        style={{ fontSize: "0.83rem", padding: "7px 10px" }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{
          position: "absolute", left: "8px",
          fontFamily: "IBM Plex Mono, monospace", fontSize: "0.68rem",
          fontWeight: 600, color: "var(--ink4)",
          pointerEvents: "none", userSelect: "none",
          letterSpacing: "0.03em",
        }}>
          {currency}
        </span>
        <input
          className="daloy-input-mono"
          type="text" inputMode="numeric"
          placeholder="0.00"
          value={item.centStr ? (parseInt(item.centStr, 10) / 100).toLocaleString("en-PH", {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
          }) : ""}
          onKeyDown={e => onAmountKey(item.id, e)}
          onChange={() => {}}
          style={{
            color: "var(--expense)", fontSize: "0.83rem",
            padding: "7px 10px 7px 36px",
            textAlign: "right",
            width: "100%",
          }}
        />
      </div>

      <button
        onClick={() => onRemove(item.id)}
        disabled={!canRemove}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "32px", height: "32px",
          background: "transparent",
          border: "1.5px solid var(--bg3)",
          borderRadius: "var(--radius-sm)",
          color: canRemove ? "var(--clay)" : "var(--bg3)",
          cursor: canRemove ? "pointer" : "not-allowed",
          transition: "border-color 0.15s, background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!canRemove) return;
          (e.currentTarget as HTMLButtonElement).style.background = "var(--clay-bg)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clay-m)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bg3)";
        }}
      >
        <Trash2 size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}