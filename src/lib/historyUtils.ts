import type { HistoryTransactionItem } from "../services/history/historyService";

// ── Formatters ─────────────────────────────────────────────────────────────
export function fmt(n: number): string {
  return `₱${Math.abs(n).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Local-safe ISO helpers ─────────────────────────────────────────────────
// IMPORTANT: Never use d.toISOString().slice(0,10) — it converts to UTC,
// which in UTC+8 (PH) subtracts 8 hours and rolls back the date by one day.
// Always build the ISO string from local date parts instead.
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isoMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ── Week helpers ───────────────────────────────────────────────────────────
export function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setDate(d.getDate() - d.getDay()); // back to Sunday
  out.setHours(0, 0, 0, 0);
  return out;
}

export function endOfWeek(d: Date): Date {
  const out = startOfWeek(d);
  out.setDate(out.getDate() + 6); // forward to Saturday
  out.setHours(23, 59, 59, 999);
  return out;
}

// ── Period navigator labels ────────────────────────────────────────────────
export function getDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function getWeekLabel(startIso: string): string {
  const start = new Date(startIso + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-PH", opts)} – ${end.toLocaleDateString("en-PH", opts)}`;
}

export function getMonthLabel(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
}

// ── Day eyebrow label (used in transaction list group headers) ─────────────
export function formatDayEyebrow(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const month = date
    .toLocaleDateString("en-PH", { month: "short", day: "numeric" })
    .toUpperCase();
  if (same(date, today)) return `TODAY · ${month}`;
  if (same(date, yesterday)) return `YESTERDAY · ${month}`;
  return month;
}

// ── Type filter ────────────────────────────────────────────────────────────
export type TypeFilter =
  | "All"
  | "Expense"
  | "Income"
  | "Transfer"
  | "Split"
  | "Settlement";

export const TYPE_FILTERS: TypeFilter[] = [
  "All",
  "Expense",
  "Income",
  "Transfer",
  "Split",
  "Settlement",
];

export function matchesType(
  t: HistoryTransactionItem,
  f: TypeFilter
): boolean {
  if (f === "All") return true;
  if (f === "Expense") return t.type === "expense";
  if (f === "Income") return t.type === "income";
  if (f === "Transfer") return t.type === "transfer";
  if (f === "Split") return t.type === "split_expense";
  if (f === "Settlement") return t.type === "settlement";
  return true;
}

// ── Grouping ───────────────────────────────────────────────────────────────
export function groupByDay(txns: HistoryTransactionItem[]) {
  const sorted = [...txns].sort(
    (a, b) =>
      new Date(b.transactedAt).getTime() - new Date(a.transactedAt).getTime()
  );
  const groups: { dateKey: string; txns: HistoryTransactionItem[] }[] = [];
  sorted.forEach((t) => {
    const key = t.transactedAt.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === key) last.txns.push(t);
    else groups.push({ dateKey: key, txns: [t] });
  });
  return groups;
}

// Per-day-group header subtotals
export function getDayTotals(txns: HistoryTransactionItem[]) {
  return txns.reduce(
    (acc, t) => {
      if (t.type === "income" || t.type === "settlement") acc.income += t.amount;
      else if (t.type === "expense" || t.type === "split_expense")
        acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

// ── Chart bar type ─────────────────────────────────────────────────────────
export interface BarDatum {
  label: string;
  expense: number;
  income: number;
  active?: boolean;
}

// ── View mode ─────────────────────────────────────────────────────────────
export type ViewMode = "day" | "week" | "month";