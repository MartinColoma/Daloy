import { useState, useEffect, useCallback, useMemo } from "react";
import { useLayout } from "../../layouts/LayoutContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  getHistoryForDay,
  getHistoryForWeek,
  getHistoryForMonth,
} from "../../services/history/historyService";
import type {
  HistoryTransactionItem,
  HistoryPeriodSummary,
} from "../../services/history/historyService";

import {
  type ViewMode,
  type TypeFilter,
  type BarDatum,
  isoDay,
  isoMonth,
  startOfWeek,
  matchesType,
} from "../../lib/historyUtils";
import { ChartBlock, TransactionListSection } from "../../components/history/HistorySections";

// ── Helpers ────────────────────────────────────────────────────────────────
function buildChartBars(
  view: ViewMode,
  cursor: string,
  transactions: HistoryTransactionItem[]
): BarDatum[] {
  const credit = (t: HistoryTransactionItem) =>
    t.type === "income" || t.type === "settlement";
  const debit = (t: HistoryTransactionItem) =>
    t.type === "expense" || t.type === "split_expense";

  if (view === "day") {
    const slots: BarDatum[] = Array.from({ length: 6 }, (_, i) => ({
      label:
        i === 0
          ? "12a"
          : i * 4 < 12
          ? `${i * 4}a`
          : i * 4 === 12
          ? "12p"
          : `${i * 4 - 12}p`,
      expense: 0,
      income: 0,
      active: false,
    }));
    transactions.forEach((t) => {
      const slot = Math.floor(new Date(t.transactedAt).getHours() / 4);
      if (credit(t)) slots[slot].income += t.amount;
      else if (debit(t)) slots[slot].expense += t.amount;
    });
    const nowSlot = Math.floor(new Date().getHours() / 4);
    if (cursor === isoDay(new Date())) slots[nowSlot].active = true;
    return slots;
  }

  if (view === "week") {
    const start = new Date(cursor + "T00:00:00");
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const slots: BarDatum[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        label: dayNames[d.getDay()],
        expense: 0,
        income: 0,
        active: isoDay(d) === isoDay(new Date()),
      };
    });
    transactions.forEach((t) => {
      const d = new Date(t.transactedAt);
      const idx = Math.round((d.getTime() - start.getTime()) / 86_400_000);
      if (idx >= 0 && idx < 7) {
        if (credit(t)) slots[idx].income += t.amount;
        else if (debit(t)) slots[idx].expense += t.amount;
      }
    });
    return slots;
  }

  // month
  const [y, m] = cursor.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const todayIso = isoDay(new Date());
  const slots: BarDatum[] = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1),
    expense: 0,
    income: 0,
    active: todayIso === `${cursor}-${String(i + 1).padStart(2, "0")}`,
  }));
  transactions.forEach((t) => {
    const day = parseInt(t.transactedAt.slice(8, 10), 10) - 1;
    if (day >= 0 && day < daysInMonth) {
      if (credit(t)) slots[day].income += t.amount;
      else if (debit(t)) slots[day].expense += t.amount;
    }
  });
  // sparse labels for month view
  return slots.map((s, i) => ({
    ...s,
    label: (i + 1) % 5 === 1 || i + 1 === daysInMonth ? s.label : "",
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function HistoryPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setPageTitle, setModalSuccessHandler } = useLayout();

  const [transactions, setTransactions] = useState<HistoryTransactionItem[]>([]);
  const [summary, setSummary] = useState<HistoryPeriodSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

  // Default view is Day ──────────────────────────────────────────────────
  const [view, setView] = useState<ViewMode>("day");
  const [dayCursor, setDayCursor] = useState(() => isoDay(new Date()));
  const [weekCursor, setWeekCursor] = useState(() => isoDay(startOfWeek(new Date())));
  const [monthCursor, setMonthCursor] = useState(() => isoMonth(new Date()));

  const cursor =
    view === "day" ? dayCursor : view === "week" ? weekCursor : monthCursor;
  const setCursor =
    view === "day" ? setDayCursor : view === "week" ? setWeekCursor : setMonthCursor;

  // ── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true);
    const req =
      view === "day"
        ? getHistoryForDay(cursor)
        : view === "week"
        ? getHistoryForWeek(cursor)
        : getHistoryForMonth(cursor);
    req
      .then((r) => {
        setTransactions(r.transactions);
        setSummary(r.summary);
      })
      .finally(() => setLoading(false));
  }, [view, cursor]);

  useEffect(() => {
    setPageTitle("History");
    setModalSuccessHandler(load);
    return () => setModalSuccessHandler(null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Client-side filter ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const byType = transactions.filter((t) => matchesType(t, typeFilter));
    if (!search.trim()) return byType;
    const q = search.toLowerCase();
    return byType.filter(
      (t) =>
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.categoryName ?? "").toLowerCase().includes(q) ||
        (t.walletName ?? "").toLowerCase().includes(q)
    );
  }, [transactions, typeFilter, search]);

  const isFiltered = search.trim() !== "" || typeFilter !== "All";

  // ── Chart bars ───────────────────────────────────────────────────────────
  const chartBars = useMemo(
    () => buildChartBars(view, cursor, transactions),
    [view, cursor, transactions]
  );

  // ── Bar-click navigation: clicking a bar jumps to that day ───────────────
  const handleBarClick = (index: number) => {
    if (view === "week") {
      const start = new Date(cursor + "T00:00:00");
      start.setDate(start.getDate() + index);
      setDayCursor(isoDay(start));
      setView("day");
    } else if (view === "month") {
      const [y, m] = cursor.split("-").map(Number);
      const d = new Date(y, m - 1, index + 1);
      setDayCursor(isoDay(d));
      setView("day");
    }
  };

  // ── Shared view-change handler (resets search/filter) ────────────────────
  const handleViewChange = (v: ViewMode) => {
    setView(v);
    setSearch("");
    setTypeFilter("All");
  };

  // ── Shared chart block props ─────────────────────────────────────────────
  const chartProps = {
    view,
    cursor,
    summary,
    chartBars,
    loading,
    onViewChange: handleViewChange,
    onCursorChange: setCursor,
    onBarClick: handleBarClick,
  };

  // ── Desktop ──────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div>
          <p
            className="font-mono text-[0.57rem] tracking-[0.18em] uppercase"
            style={{ color: "var(--ink4)" }}
          >
            Transaction History
          </p>
          <h1
            className="font-lora font-bold text-[1.55rem] leading-tight mt-0.5"
            style={{ color: "var(--ink)" }}
          >
            History
          </h1>
        </div>

        <ChartBlock {...chartProps} />

        <TransactionListSection
          transactions={filtered}
          search={search}
          typeFilter={typeFilter}
          loading={loading}
          isFiltered={isFiltered}
          onSearchChange={setSearch}
          onTypeFilterChange={setTypeFilter}
          inline
        />
      </div>
    );
  }

  // ── Mobile ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1
        className="font-lora font-bold text-[1.4rem] leading-tight"
        style={{ color: "var(--ink)" }}
      >
        History
      </h1>

      <ChartBlock {...chartProps} />

      <TransactionListSection
        transactions={filtered}
        search={search}
        typeFilter={typeFilter}
        loading={loading}
        isFiltered={isFiltered}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
        mobile
      />
    </div>
  );
}