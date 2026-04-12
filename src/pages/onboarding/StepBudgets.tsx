import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { getCurrencySymbol } from "../../lib/currencyUtils";
import { useOnboardingStore } from "../../stores/onboardingStore"; 
import {
  fetchSystemCategories,
  postWallets,           
  postBudgets,
  postOnboardingComplete,
  type SystemCategory,
} from "../../services/onboarding/onboardingService";

/* ─────────────────────────────────────────────
   StepBudgets.tsx — Onboarding Step 3 (Skippable)
   Enabled envelopes always float to the top as
   a group. Disabled are shown below as a second
   group. Toggling moves items between groups.
───────────────────────────────────────────── */
// Suggested limits per category name (PHP defaults)
const SUGGESTED_LIMITS: Record<string, string> = {
  "Food & Dining":     "5000",
  "Groceries":         "3000",
  "Transport":         "2000",
  "Bills & Utilities": "4000",
  "Shopping":          "3000",
  "Entertainment":     "1500",
  "Health":            "2000",
  "Personal Care":     "1000",
  "Subscriptions":     "500",
};

// Which categories are enabled by default
const DEFAULT_ENABLED = new Set([
  "Food & Dining",
  "Groceries",
  "Transport",
  "Bills & Utilities",
]);

interface BudgetEntry {
  category: SystemCategory;
  centStr:  string;  // cent-first raw string e.g. "500000" = 5000.00
  enabled:  boolean;
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

// Pre-populate suggested limits as centStr (multiply by 100)
function toCentStr(amount: string): string {
  const n = parseFloat(amount);
  if (isNaN(n) || n <= 0) return "";
  return String(Math.round(n * 100));
}

function currentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

// ── Budget row ────────────────────────────────────────────────
function BudgetRow({
  entry,
  isLast,
  symbol,
  onToggle,
  onKeyDown,
}: {
  entry:         BudgetEntry;
  isLast:        boolean;
  symbol:        string;
  onToggle:      () => void;
  onKeyDown:     (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-all"
      style={{
        background:   entry.enabled ? "var(--bg2)" : "var(--bg)",
        borderBottom: isLast ? "none" : "1px solid var(--bg3)",
      }}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={entry.enabled}
        style={{
          width: "40px", height: "22px", flexShrink: 0,
          borderRadius: "100px", border: "none", cursor: "pointer",
          background: entry.enabled ? "var(--forest)" : "var(--bg3)",
          position: "relative", transition: "background 0.2s", padding: 0,
        }}
      >
        <span style={{
          position: "absolute",
          top: "3px",
          left: entry.enabled ? "21px" : "3px",
          width: "16px", height: "16px",
          borderRadius: "100px", background: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }} />
      </button>

      {/* Icon + name */}
      <span className="text-[1rem] shrink-0">{entry.category.icon}</span>
      <span
        className="flex-1 font-outfit text-[0.875rem] font-medium"
        style={{ color: entry.enabled ? "var(--ink)" : "var(--ink4)" }}
      >
        {entry.category.name}
      </span>

      {/* Limit input — cent-first, only when enabled */}
      {entry.enabled && (
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
            value={centStrToDisplay(entry.centStr)}
            onKeyDown={e => onKeyDown(e)}
            onChange={() => {/* controlled via onKeyDown */}}
            className="w-[72px] font-mono text-[0.85rem] text-right bg-transparent outline-none"
            style={{ color: "var(--ink)" }}
          />
        </div>
      )}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div
      className="px-4 py-1.5 font-mono text-[0.57rem] tracking-[0.18em] uppercase"
      style={{ background: "var(--bg3)", color: "var(--ink4)" }}
    >
      {label}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════

export default function StepBudgets() {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);
  const setUser  = useAuthStore(s => s.setUser);

  const currency = user?.baseCurrency ?? "PHP";
  const symbol   = getCurrencySymbol(currency);

  const [budgets,  setBudgets]  = useState<BudgetEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    fetchSystemCategories()
      .then(cats => {
        const expenseCats = cats.filter(c => c.type === "expense");
        setBudgets(
          expenseCats.map(cat => ({
            category: cat,
            centStr:  toCentStr(SUGGESTED_LIMITS[cat.name] ?? "1000"),
            enabled:  DEFAULT_ENABLED.has(cat.name),
          })),
        );
      })
      .catch(() => setError("Failed to load categories. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  // ── Split into two stable groups ─────────────────────────
  // Each group preserves original order — only membership changes on toggle.
  const { enabled, disabled } = useMemo(() => ({
    enabled:  budgets.filter(b => b.enabled),
    disabled: budgets.filter(b => !b.enabled),
  }), [budgets]);

  function toggle(categoryId: string) {
    setBudgets(b =>
      b.map(e =>
        e.category.id === categoryId ? { ...e, enabled: !e.enabled } : e,
      ),
    );
  }

  function handleAmountKey(categoryId: string, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      setBudgets(b => b.map(x =>
        x.category.id === categoryId ? { ...x, centStr: x.centStr.slice(0, -1) } : x,
      ));
    } else if (/^\d$/.test(e.key)) {
      setBudgets(b => b.map(x => {
        if (x.category.id !== categoryId) return x;
        const next = (x.centStr + e.key).replace(/^0+/, "") || "";
        if (parseInt(next || "0", 10) > 99_999_999_999) return x;
        return { ...x, centStr: next };
      }));
    }
    e.preventDefault();
  }

const stagedWallets = useOnboardingStore(s => s.wallets);
const reset         = useOnboardingStore(s => s.reset);

async function finish(skip: boolean) {
  setSaving(true);
  setError(null);
  try {
    // 1. Flush staged wallets — always, regardless of skip
    //    (user may have skipped budgets but still set up wallets)
    if (stagedWallets.length > 0) {
      await postWallets(stagedWallets);
    }

    // 2. Flush budgets — only if user didn't skip
    if (!skip) {
      const periodStart = currentMonthStart();
      const payload = budgets
        .filter(b => b.enabled && centStrToNumber(b.centStr) > 0)
        .map(b => ({
          categoryId:  b.category.id,
          amountLimit: centStrToNumber(b.centStr),
          period:      "monthly" as const,
          periodStart,
          rollover:    false,
        }));
      if (payload.length > 0) {
        await postBudgets(payload);
      }
    }

    // 3. Mark onboarding complete and clear the staging store
    await postOnboardingComplete();
    reset();
    if (user) setUser({ ...user, onboardingDone: true });
    navigate("/home");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
  } finally {
    setSaving(false);
  }
}

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 rounded mb-3 animate-pulse" style={{ background: "var(--bg3)" }} />
        <div className="h-4 w-72 rounded mb-8 animate-pulse" style={{ background: "var(--bg3)" }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-[var(--radius-md)] mb-2 animate-pulse" style={{ background: "var(--bg2)" }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <h2
        className="font-lora font-bold text-[1.75rem] tracking-tight mb-1"
        style={{ color: "var(--ink)" }}
      >
        Set your budget limits.
      </h2>
      <p
        className="font-outfit font-light text-[0.9rem] mb-2"
        style={{ color: "var(--ink3)" }}
      >
        Toggle categories you want to track and set monthly limits.
        You can always change these later.
      </p>
      <p
        className="font-mono text-[0.7rem] tracking-[0.1em] uppercase mb-6"
        style={{ color: "var(--ink4)" }}
      >
        {enabled.length} {enabled.length === 1 ? "envelope" : "envelopes"} active
      </p>

      {/* Budget list — grouped */}
      <div
        className="rounded-[var(--radius-md)] overflow-hidden mb-6"
        style={{ border: "1px solid var(--bg3)" }}
      >
        {/* ── Enabled group ── */}
        {enabled.length > 0 && (
          <>
            <SectionLabel label="Active envelopes" />
            {enabled.map((b, i) => (
              <BudgetRow
                key={b.category.id}
                entry={b}
                isLast={i === enabled.length - 1 && disabled.length === 0}
                symbol={symbol}
                onToggle={() => toggle(b.category.id)}
                onKeyDown={e => handleAmountKey(b.category.id, e)}
              />
            ))}
          </>
        )}

        {/* ── Disabled group ── */}
        {disabled.length > 0 && (
          <>
            <SectionLabel label="Not tracking" />
            {disabled.map((b, i) => (
              <BudgetRow
                key={b.category.id}
                entry={b}
                isLast={i === disabled.length - 1}
                symbol={symbol}
                onToggle={() => toggle(b.category.id)}
                onKeyDown={e => handleAmountKey(b.category.id, e)}
              />
            ))}
          </>
        )}

        {/* Edge case: nothing loaded */}
        {enabled.length === 0 && disabled.length === 0 && (
          <p
            className="font-outfit text-[0.85rem] text-center py-8"
            style={{ color: "var(--ink4)" }}
          >
            No categories available.
          </p>
        )}
      </div>

      {/* Info note */}
      <div
        className="flex gap-2.5 rounded-[var(--radius-md)] px-4 py-3 mb-4 font-outfit text-[0.8rem]"
        style={{ background: "var(--forest-bg)", color: "var(--forest-m)" }}
      >
        <span>💡</span>
        <span>
          Suggested amounts are based on common spending patterns.
          Adjust freely to match your lifestyle.
        </span>
      </div>

      {/* Inline error */}
      {error && (
        <p className="font-outfit text-[0.8rem] mb-4 px-1" style={{ color: "var(--expense)" }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => finish(true)}
          disabled={saving}
          className="flex items-center gap-1 font-outfit font-medium text-[0.85rem] px-5 py-[0.65rem] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50"
          style={{ border: "1.5px solid var(--bg3)", color: "var(--ink3)" }}
        >
          Skip <ChevronRight size={14} />
        </button>
        <button
          onClick={() => finish(false)}
          disabled={saving || enabled.length === 0}
          className="flex-1 flex items-center justify-center gap-2 font-outfit font-medium text-[0.875rem] text-white py-[0.65rem] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50"
          style={{ background: "var(--forest)" }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "var(--forest-m)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
        >
          {saving
            ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <>Finish Setup <ArrowRight size={14} /></>
          }
        </button>
      </div>
    </div>
  );
}