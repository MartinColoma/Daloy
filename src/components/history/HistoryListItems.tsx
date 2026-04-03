import { Search, X, TrendingUp, TrendingDown, ArrowLeftRight, Users, Handshake } from "lucide-react";
import type { HistoryTransactionItem } from "../../services/history/historyService";
import { fmt, type TypeFilter, TYPE_FILTERS } from "../../lib/historyUtils";

// ── Transaction type icon ──────────────────────────────────────────────────
export function TxnTypeIcon({ type }: { type: HistoryTransactionItem["type"] }) {
  const p = { size: 13, strokeWidth: 1.8 };
  if (type === "income") return <TrendingUp {...p} />;
  if (type === "transfer") return <ArrowLeftRight {...p} />;
  if (type === "split_expense") return <Users {...p} />;
  if (type === "settlement") return <Handshake {...p} />;
  return <TrendingDown {...p} />;
}

// ── Transaction row ────────────────────────────────────────────────────────
interface TxnRowProps {
  t: HistoryTransactionItem;
  last: boolean;
}

export function TxnRow({ t, last }: TxnRowProps) {
  const isCredit = t.type === "income" || t.type === "settlement";
  const isTransfer = t.type === "transfer";
  const amountColor = isCredit
    ? "var(--income)"
    : isTransfer
    ? "var(--steel-m)"
    : "var(--expense)";
  const prefix = isCredit ? "+" : isTransfer ? "" : "−";

  const subtitleParts = [t.categoryName, t.walletName].filter(Boolean);
  if (t.originalCurrency && t.originalCurrency !== "PHP" && t.originalAmount) {
    subtitleParts.push(
      `${t.originalCurrency} ${Math.abs(t.originalAmount).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: last ? "none" : "1px solid var(--bg3)" }}
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[0.92rem] shrink-0"
        style={{ background: "var(--bg3)" }}
      >
        {t.categoryIcon ?? "💳"}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-outfit font-medium text-[0.86rem] truncate"
          style={{ color: "var(--ink)" }}
        >
          {t.description || t.categoryName || "Transaction"}
        </p>
        <p
          className="font-outfit text-[0.7rem] truncate"
          style={{ color: "var(--ink4)" }}
        >
          {subtitleParts.join(" · ")}
          {isTransfer && t.toWalletName ? ` → ${t.toWalletName}` : ""}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p
          className="font-mono text-[0.86rem] font-medium"
          style={{ color: amountColor }}
        >
          {prefix}
          {fmt(t.amount)}
        </p>
        <div
          className="flex items-center justify-end gap-1 mt-0.5"
          style={{ color: "var(--ink4)" }}
        >
          <TxnTypeIcon type={t.type} />
          <span className="font-outfit text-[0.6rem] capitalize">
            {t.type.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton placeholder ───────────────────────────────────────────────────
export function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="animate-pulse rounded-[var(--radius-sm)]"
      style={{ background: "var(--bg3)", ...style }}
    />
  );
}

// ── Search bar ─────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--ink4)" }}
      />
      <input
        type="text"
        placeholder="Search transactions…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-9 py-2.5 rounded-[var(--radius-md)] font-outfit text-[0.83rem] outline-none transition-all"
        style={{
          background: "var(--bg2)",
          border: "1.5px solid var(--bg3)",
          color: "var(--ink)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--forest-m)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--bg3)")}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--ink4)" }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ── Type filter pills ──────────────────────────────────────────────────────
interface TypePillsProps {
  active: TypeFilter;
  onChange: (f: TypeFilter) => void;
}

export function TypePills({ active, onChange }: TypePillsProps) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-0.5"
      style={{ scrollbarWidth: "none" }}
    >
      {TYPE_FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className="shrink-0 px-3 py-1.5 rounded-full font-outfit text-[0.7rem] font-medium transition-colors"
          style={{
            background: active === f ? "var(--forest)" : "var(--bg2)",
            color: active === f ? "#fff" : "var(--ink3)",
            border: `1px solid ${active === f ? "var(--forest)" : "var(--bg3)"}`,
          }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
export function EmptyHistory({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-md)] px-4 py-12 flex flex-col items-center gap-2 text-center"
      style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
    >
      <p className="text-2xl">🗂️</p>
      <p
        className="font-outfit font-medium text-[0.88rem]"
        style={{ color: "var(--ink2)" }}
      >
        {filtered ? "No matching transactions" : "No transactions this period"}
      </p>
      <p className="font-outfit text-[0.75rem]" style={{ color: "var(--ink4)" }}>
        {filtered
          ? "Try adjusting your search or filter."
          : "Tap + below to log your first one."}
      </p>
    </div>
  );
}