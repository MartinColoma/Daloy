import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ViewMode,
  isoDay,
  isoMonth,
  startOfWeek,
  getDayLabel,
  getWeekLabel,
  getMonthLabel,
} from "../../lib/historyUtils";
import { useCurrency } from "../../hooks/useCurrency";

// ── View tab switcher ──────────────────────────────────────────────────────
interface ViewTabsProps {
  active: ViewMode;
  onChange: (v: ViewMode) => void;
}

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  const tabs: ViewMode[] = ["day", "week", "month"];
  return (
    <div
      className="flex rounded-[var(--radius-md)] overflow-hidden"
      style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
    >
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="flex-1 py-2 font-outfit font-medium text-[0.8rem] capitalize transition-colors"
          style={{
            background: active === t ? "var(--ink)" : "transparent",
            color: active === t ? "#fff" : "var(--ink3)",
            borderBottom:
              active === t
                ? "2px solid var(--forest-xl)"
                : "2px solid transparent",
          }}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ── Period navigator ───────────────────────────────────────────────────────
interface PeriodNavigatorProps {
  view: ViewMode;
  cursor: string;
  onChange: (c: string) => void;
}

export function PeriodNavigator({ view, cursor, onChange }: PeriodNavigatorProps) {
  const label =
    view === "day"
      ? getDayLabel(cursor)
      : view === "week"
      ? getWeekLabel(cursor)
      : getMonthLabel(cursor);

  // Check if cursor is at "today" to disable the forward arrow
  const isAtPresent = (() => {
    const today = isoDay(new Date());
    if (view === "day") return cursor === today;
    if (view === "week") return cursor === isoDay(startOfWeek(new Date()));
    return cursor === isoMonth(new Date());
  })();

  const go = (dir: -1 | 1) => {
    if (view === "day") {
      // Use local date parts — never toISOString() — to avoid UTC offset shift
      const [y, m, d] = cursor.split("-").map(Number);
      const next = new Date(y, m - 1, d + dir);
      onChange(isoDay(next));
    } else if (view === "week") {
      const [y, m, d] = cursor.split("-").map(Number);
      const next = new Date(y, m - 1, d + dir * 7);
      onChange(isoDay(next));
    } else {
      const [y, m] = cursor.split("-").map(Number);
      const next = new Date(y, m - 1 + dir, 1);
      onChange(isoMonth(next));
    }
  };

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => go(-1)}
        className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors"
        style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg2)")}
      >
        <ChevronLeft size={14} style={{ color: "var(--ink3)" }} />
      </button>

      <p
        className="font-outfit font-semibold text-[0.9rem] text-center px-2"
        style={{ color: "var(--ink)" }}
      >
        {label}
      </p>

      <button
        onClick={() => go(1)}
        disabled={isAtPresent}
        className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors"
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--bg3)",
          opacity: isAtPresent ? 0.3 : 1,
          cursor: isAtPresent ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isAtPresent) e.currentTarget.style.background = "var(--bg3)";
        }}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg2)")}
      >
        <ChevronRight size={14} style={{ color: "var(--ink3)" }} />
      </button>
    </div>
  );
}

// ── Summary bar ────────────────────────────────────────────────────────────
interface SummaryBarProps {
  income: number;
  expense: number;
  loading: boolean;
}

export function SummaryBar({ income, expense, loading }: SummaryBarProps) {
  const net = income - expense;

  if (loading) {
    return (
      <div className="flex gap-4 px-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1">
            <div
              className="h-2 w-12 animate-pulse rounded"
              style={{ background: "var(--bg3)" }}
            />
            <div
              className="h-4 w-20 animate-pulse rounded"
              style={{ background: "var(--bg3)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  const { format } = useCurrency(); // ← add

  return (
    <div className="flex gap-4 px-1">
      {[
        { label: "Income", value: income, color: "var(--income)" },
        { label: "Expenses", value: expense, color: "var(--expense)" },
        {
          label: "Net",
          value: net,
          color: net >= 0 ? "var(--income)" : "var(--expense)",
          prefix: net >= 0 ? "+" : "−",
        },
      ].map(({ label, value, color, prefix }) => (
        <div key={label} className="flex-1 flex flex-col gap-0.5">
          <p
            className="font-mono text-[0.5rem] tracking-[0.14em] uppercase"
            style={{ color: "var(--ink4)" }}
          >
            {label}
          </p>
          <p
            className="font-mono font-medium text-[0.92rem] leading-none"
            style={{ color }}
          >
            {prefix ?? ""}
            {format(value)}
          </p>
        </div>
      ))}
    </div>
  );
}