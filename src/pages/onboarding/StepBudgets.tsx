import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

/* ─────────────────────────────────────────────
   StepBudgets.tsx — Onboarding Step 3 (Skippable)
   Set monthly budget envelopes per category.
   Shows system default categories with suggested limits.
   Marks onboarding_done = true on save or skip.
───────────────────────────────────────────── */

interface BudgetEntry {
  category: string;
  icon:     string;
  limit:    string;
  enabled:  boolean;
}

const DEFAULTS: BudgetEntry[] = [
  { category: "Food & Dining",    icon: "🍜", limit: "5000",  enabled: true  },
  { category: "Groceries",        icon: "🛒", limit: "3000",  enabled: true  },
  { category: "Transport",        icon: "🚌", limit: "2000",  enabled: true  },
  { category: "Bills & Utilities",icon: "💡", limit: "4000",  enabled: true  },
  { category: "Shopping",         icon: "🛍️", limit: "3000",  enabled: false },
  { category: "Entertainment",    icon: "🎬", limit: "1500",  enabled: false },
  { category: "Health",           icon: "🏥", limit: "2000",  enabled: false },
  { category: "Personal Care",    icon: "💅", limit: "1000",  enabled: false },
  { category: "Subscriptions",    icon: "🔄", limit: "500",   enabled: false },
];

export default function StepBudgets() {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);
  const setUser  = useAuthStore(s => s.setUser);
  const symbol   = user?.baseCurrency === "PHP" ? "₱" : user?.baseCurrency ?? "₱";

  const [budgets, setBudgets] = useState<BudgetEntry[]>(DEFAULTS);
  const [saving,  setSaving]  = useState(false);

  function toggle(index: number) {
    setBudgets(b => b.map((e, i) => i === index ? { ...e, enabled: !e.enabled } : e));
  }

  function updateLimit(index: number, value: string) {
    setBudgets(b => b.map((e, i) => i === index ? { ...e, limit: value } : e));
  }

  async function finish(skip = false) {
    setSaving(true);
    try {
      if (!skip) {
        const enabled = budgets.filter(b => b.enabled && Number(b.limit) > 0);
        // TODO: POST /api/budgets for each enabled budget
        console.log("Creating budgets:", enabled);
      }
      // Mark onboarding done
      // TODO: PATCH /api/users/me { onboardingDone: true }
      if (user) setUser({ ...user, onboardingDone: true });
      navigate("/home");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = budgets.filter(b => b.enabled).length;

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
        {activeCount} envelopes active
      </p>

      {/* Budget list */}
      <div
        className="rounded-[var(--radius-md)] overflow-hidden mb-6"
        style={{ border: "1px solid var(--bg3)" }}
      >
        {budgets.map((b, i) => (
          <div
            key={b.category}
            className="flex items-center gap-3 px-4 py-3 transition-colors"
            style={{
              background: b.enabled ? "var(--bg2)" : "var(--bg)",
              borderBottom: i < budgets.length - 1 ? "1px solid var(--bg3)" : "none",
              opacity: b.enabled ? 1 : 0.5,
            }}
          >
            {/* Toggle */}
            <button
              onClick={() => toggle(i)}
              className="w-9 h-5 rounded-full relative transition-colors shrink-0"
              style={{ background: b.enabled ? "var(--forest)" : "var(--bg3)" }}
              aria-checked={b.enabled}
              role="checkbox"
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: b.enabled ? "translateX(17px)" : "translateX(2px)" }}
              />
            </button>

            {/* Icon + name */}
            <span className="text-[1rem] shrink-0">{b.icon}</span>
            <span
              className="flex-1 font-outfit text-[0.875rem] font-medium"
              style={{ color: "var(--ink)" }}
            >
              {b.category}
            </span>

            {/* Limit input */}
            {b.enabled && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[0.72rem]" style={{ color: "var(--ink4)" }}>
                  {symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={b.limit}
                  onChange={e => updateLimit(i, e.target.value)}
                  className="w-[72px] font-mono text-[0.85rem] text-right bg-transparent outline-none"
                  style={{ color: "var(--ink)" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info note */}
      <div
        className="flex gap-2.5 rounded-[var(--radius-md)] px-4 py-3 mb-6 font-outfit text-[0.8rem]"
        style={{ background: "var(--forest-bg)", color: "var(--forest-m)" }}
      >
        <span>💡</span>
        <span>
          Amounts shown are suggestions based on common Filipino spending patterns.
          Adjust freely to match your lifestyle.
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => finish(true)}
          disabled={saving}
          className="flex items-center gap-1 font-outfit font-medium text-[0.85rem] px-5 py-[0.65rem] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50"
          style={{
            border: "1.5px solid var(--bg3)",
            color: "var(--ink3)",
          }}
        >
          Skip <ChevronRight size={14} />
        </button>
        <button
          onClick={() => finish(false)}
          disabled={saving || activeCount === 0}
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