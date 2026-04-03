import { ViewTabs, PeriodNavigator, SummaryBar } from "./HistoryControls";
import { SpendingChart } from "./SpendingChart";
import { TxnRow, Skeleton, EmptyHistory, SearchBar, TypePills } from "./HistoryListItems";
import { fmt, formatDayEyebrow, getDayTotals, groupByDay } from "../../lib/historyUtils";
import type { ViewMode, TypeFilter, BarDatum } from "../../lib/historyUtils";
import type { HistoryTransactionItem, HistoryPeriodSummary } from "../../services/history/historyService";

// ── Chart + summary card ───────────────────────────────────────────────────
interface ChartBlockProps {
  view: ViewMode;
  cursor: string;
  summary: HistoryPeriodSummary;
  chartBars: BarDatum[];
  loading: boolean;
  onViewChange: (v: ViewMode) => void;
  onCursorChange: (c: string) => void;
  onBarClick?: (index: number) => void;
}

export function ChartBlock({
  view,
  cursor,
  summary,
  chartBars,
  loading,
  onViewChange,
  onCursorChange,
  onBarClick,
}: ChartBlockProps) {
  return (
    <div
      className="rounded-[var(--radius-lg)] px-4 pt-4 pb-3 flex flex-col gap-4"
      style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
    >
      <ViewTabs active={view} onChange={onViewChange} />
      <PeriodNavigator view={view} cursor={cursor} onChange={onCursorChange} />
      <SummaryBar
        income={summary.totalIncome}
        expense={summary.totalExpenses}
        loading={loading}
      />
      <SpendingChart bars={chartBars} loading={loading} onBarClick={onBarClick} />
    </div>
  );
}

// ── Transaction day group ──────────────────────────────────────────────────
interface DayGroupProps {
  dateKey: string;
  txns: HistoryTransactionItem[];
  mobile?: boolean;
}

export function DayGroup({ dateKey, txns, mobile }: DayGroupProps) {
  const t = getDayTotals(txns);
  return (
    <div>
      <div
        className={`flex items-center justify-between mb-1.5 ${mobile ? "px-0.5" : "px-1"}`}
      >
        <p
          className={`font-mono tracking-[0.18em] uppercase ${mobile ? "text-[0.55rem]" : "text-[0.57rem]"}`}
          style={{ color: "var(--ink4)" }}
        >
          {formatDayEyebrow(dateKey)}
        </p>
        <div className={`flex items-center ${mobile ? "gap-2" : "gap-3"}`}>
          {t.income > 0 && (
            <span
              className={`font-mono ${mobile ? "text-[0.62rem]" : "text-[0.65rem]"}`}
              style={{ color: "var(--income)" }}
            >
              +{fmt(t.income)}
            </span>
          )}
          {t.expense > 0 && (
            <span
              className={`font-mono ${mobile ? "text-[0.62rem]" : "text-[0.65rem]"}`}
              style={{ color: "var(--expense)" }}
            >
              −{fmt(t.expense)}
            </span>
          )}
        </div>
      </div>
      <div
        className="rounded-[var(--radius-md)] overflow-hidden"
        style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
      >
        {txns.map((tx, i) => (
          <TxnRow key={tx.id} t={tx} last={i === txns.length - 1} />
        ))}
      </div>
    </div>
  );
}

// ── Full transaction list section (handles loading / empty / populated) ────
interface TransactionListSectionProps {
  transactions: HistoryTransactionItem[];
  search: string;
  typeFilter: TypeFilter;
  loading: boolean;
  isFiltered: boolean;
  onSearchChange: (v: string) => void;
  onTypeFilterChange: (f: TypeFilter) => void;
  mobile?: boolean;
  inline?: boolean; // desktop: search + pills on same row
}

export function TransactionListSection({
  transactions,
  search,
  typeFilter,
  loading,
  isFiltered,
  onSearchChange,
  onTypeFilterChange,
  mobile,
  inline,
}: TransactionListSectionProps) {
  const groups = groupByDay(transactions);

  return (
    <>
      {/* Filters */}
      {inline ? (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar value={search} onChange={onSearchChange} />
          </div>
          <TypePills active={typeFilter} onChange={onTypeFilterChange} />
        </div>
      ) : (
        <>
          <SearchBar value={search} onChange={onSearchChange} />
          <TypePills active={typeFilter} onChange={onTypeFilterChange} />
        </>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(mobile ? 5 : 6)].map((_, i) => (
            <Skeleton key={i} style={{ height: "56px" }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyHistory filtered={isFiltered} />
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <DayGroup key={g.dateKey} dateKey={g.dateKey} txns={g.txns} mobile={mobile} />
          ))}
        </div>
      )}
    </>
  );
}