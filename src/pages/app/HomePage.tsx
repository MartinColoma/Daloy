import { useState, useEffect } from "react";
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Briefcase, ArrowLeftRight, Users,
  RefreshCcw, Handshake, SlidersHorizontal,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useLayout } from "../../layouts/LayoutContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { ModalName } from "../../layouts/LayoutContext";
import {
  fetchHomeWallets,
  fetchHomeSummary,
  fetchRecentTransactions,
  fetchBudgetSnapshot,
} from "../../services/homeService";
import type {
  HomeWalletItem,
  RecentTransactionItem,
  BudgetSnapshotItem,
  HomeSummaryResponse,
} from "../../types/home.types";

// ── Wallet brand colors (FE-only mapping by name) ─────────────
const WALLET_BRAND_COLORS: Record<string, string> = {
  "gcash":   "#005CFF",
  "maya":    "#2D8653",
  "cash":    "#5C4033",
  "bpi":     "#CC0000",
  "bdo":     "#0033A0",
  "metrobank": "#FFD700",
};

function getWalletColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(WALLET_BRAND_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "var(--ink)"; // default dark
}

// ── Quick actions ─────────────────────────────────────────────
const QUICK_ACTIONS: { key: string; icon: React.ElementType; label: string; modal: ModalName }[] = [
  { key: "add-expense",      icon: ShoppingCart,      label: "Add Expense",      modal: "add-expense"      },
  { key: "log-income",       icon: Briefcase,          label: "Log Income",       modal: "log-income"       },
  { key: "transfer",         icon: ArrowLeftRight,     label: "Transfer",         modal: "transfer"         },
  { key: "budget-limits",    icon: SlidersHorizontal,  label: "Budget Limits",    modal: "budget-limits"    },
  { key: "convert-currency", icon: RefreshCcw,         label: "Convert Currency", modal: "convert-currency" },
  { key: "group-expense",    icon: Users,              label: "Group Expense",    modal: "group-expense"    },
  { key: "settle-up",        icon: Handshake,          label: "Settle Up",        modal: "settle-up"        },
];

// ── Helpers ───────────────────────────────────────────────────
function fmt(n: number): string {
  return `₱${Math.abs(n).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtFull(n: number): string {
  return `₱${Math.abs(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function budgetColor(spent: number, limit: number): string {
  const pct = spent / limit;
  if (pct >= 1)    return "var(--expense)";
  if (pct >= 0.75) return "#C4913A";
  return "var(--forest-l)";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function formatTxnDate(iso: string): string {
  const date  = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const monthLabel = date.toLocaleDateString("en-PH", { month: "short", day: "numeric" }).toUpperCase();

  if (sameDay(date, today))     return `TODAY · ${monthLabel}`;
  if (sameDay(date, yesterday)) return `YESTERDAY · ${monthLabel}`;
  return monthLabel;
}

function groupTransactions(txns: RecentTransactionItem[]) {
  const groups: { date: string; txns: RecentTransactionItem[] }[] = [];
  txns.forEach(t => {
    const label = formatTxnDate(t.transactedAt);
    const last  = groups[groups.length - 1];
    if (last && last.date === label) last.txns.push(t);
    else groups.push({ date: label, txns: [t] });
  });
  return groups;
}

// ── Loading skeleton ──────────────────────────────────────────
function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-sm)] ${className ?? ""}`}
      style={{ background: "var(--bg3)", ...style }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function TxnRow({ t, last }: { t: RecentTransactionItem; last: boolean }) {
  const subtitleParts = [t.categoryName, t.walletName].filter(Boolean);
  if (t.originalCurrency && t.originalCurrency !== "PHP" && t.originalAmount) {
    subtitleParts.push(
      `${t.originalCurrency} ${Math.abs(t.originalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: last ? "none" : "1px solid var(--bg3)" }}
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[0.95rem] shrink-0"
        style={{ background: "var(--bg3)" }}
      >
        {t.categoryIcon ?? "💳"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-outfit font-medium text-[0.86rem] truncate" style={{ color: "var(--ink)" }}>
          {t.description || t.categoryName || "Transaction"}
        </p>
        <p className="font-outfit text-[0.7rem] truncate" style={{ color: "var(--ink4)" }}>
          {subtitleParts.join(" · ")}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="font-mono text-[0.86rem] font-medium"
          style={{
            color: t.type === "income" || t.type === "settlement"
              ? "var(--income)"
              : t.type === "transfer"
              ? "var(--steel-m)"
              : "var(--expense)",
          }}
        >
          {t.type === "income" || t.type === "settlement" ? "+" : t.type === "transfer" ? "" : "−"}
          {fmt(t.amount)}
        </p>
        <p className="font-outfit text-[0.63rem]" style={{ color: "var(--ink4)" }}>
          {t.type === "transfer" && t.toWalletName ? `${t.walletName} → ${t.toWalletName}` : t.walletName}
        </p>
      </div>
    </div>
  );
}

function TransactionList({ txns, loading }: { txns: RecentTransactionItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} style={{ height: "52px" }} />)}
      </div>
    );
  }

  if (txns.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-md)] px-4 py-8 text-center"
        style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
      >
        <p className="font-outfit text-[0.85rem]" style={{ color: "var(--ink4)" }}>
          No transactions yet. Add your first one!
        </p>
      </div>
    );
  }

  const groups = groupTransactions(txns);
  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
      {groups.map((g, gi) => (
        <div key={g.date}>
          <div
            className="px-4 py-1.5 font-mono text-[0.57rem] tracking-[0.18em] uppercase"
            style={{ background: "var(--bg3)", color: "var(--ink4)", borderTop: gi > 0 ? "1px solid var(--bg3)" : "none" }}
          >
            {g.date}
          </div>
          {g.txns.map((t, i) => (
            <TxnRow key={t.id} t={t} last={i === g.txns.length - 1} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESKTOP-ONLY COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StatCard({ label, value, sub, subColor, loading }: {
  label: string; value: string; sub?: string; subColor?: string; loading?: boolean;
}) {
  return (
    <div
      className="flex-1 min-w-0 px-5 py-4 flex flex-col gap-1 rounded-[var(--radius-md)]"
      style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
    >
      <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
        {label}
      </p>
      {loading
        ? <Skeleton style={{ height: "28px", width: "80px", marginTop: "2px" }} />
        : <p className="font-mono font-medium text-[1.45rem] leading-none mt-0.5" style={{ color: "var(--ink)" }}>{value}</p>
      }
      {sub && !loading && (
        <p className="font-outfit text-[0.7rem] mt-0.5" style={{ color: subColor ?? "var(--ink4)" }}>{sub}</p>
      )}
    </div>
  );
}

function DesktopRightPanel({ wallets, budgets, overCount, loading }: {
  wallets:  HomeWalletItem[];
  budgets:  BudgetSnapshotItem[];
  overCount: number;
  loading:  boolean;
}) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto" style={{ flex: "0 0 25%", minWidth: "260px" }}>
      {/* Wallets */}
      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--bg3)" }}>
          <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>Wallets</p>
          <Link to="/wallet" className="font-outfit text-[0.68rem] font-medium no-underline flex items-center gap-0.5" style={{ color: "var(--forest)" }}>
            Manage <ArrowRight size={10} />
          </Link>
        </div>
        <div className="flex flex-col gap-1.5 p-2.5">
          {loading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} style={{ height: "36px" }} />)
            : wallets.filter(w => !w.isArchived).map(w => (
                <div
                  key={w.id}
                  className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)]"
                  style={{ background: getWalletColor(w.name) }}
                >
                  <p className="font-outfit font-medium text-[0.75rem]" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {w.icon} {w.name}
                  </p>
                  <p className="font-mono text-[0.78rem] font-medium text-white">
                    {fmt(w.currentBalance)}
                  </p>
                </div>
              ))
          }
        </div>
      </div>

      {/* Budget Snapshot */}
      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--bg3)" }}>
          <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>Budget Snapshot</p>
          {overCount > 0 && (
            <span className="font-outfit text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "var(--expense)" }}>
              {overCount} over
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 px-4 py-3">
          {loading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} style={{ height: "48px" }} />)
            : budgets.length === 0
            ? <p className="font-outfit text-[0.78rem]" style={{ color: "var(--ink4)" }}>No active budgets.</p>
            : budgets.map(b => {
                const pct     = Math.min((b.spent / b.amountLimit) * 100, 100);
                const color   = budgetColor(b.spent, b.amountLimit);
                const isOver  = b.spent > b.amountLimit;
                return (
                  <div key={b.budgetId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-outfit text-[0.76rem] font-medium" style={{ color: "var(--ink2)" }}>
                        {b.categoryIcon} {b.categoryName}
                      </span>
                      <span className="font-mono text-[0.62rem]" style={{ color: "var(--ink4)" }}>
                        {fmt(b.spent)}/{fmt(b.amountLimit)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <p className="font-outfit text-[0.63rem]" style={{ color: isOver ? "var(--expense)" : "var(--ink4)" }}>
                      {isOver ? `Over by ${fmt(b.spent - b.amountLimit)}` : `${fmt(b.remaining)} remaining`}
                    </p>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}

function DesktopQuickActions() {
  const { openModal } = useLayout();
  return (
    <div>
      <p className="font-outfit font-semibold text-[0.95rem] mb-3" style={{ color: "var(--ink)" }}>Quick Actions</p>
      <div className="grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ key, icon: Icon, label, modal }) => (
          <button
            key={key}
            onClick={() => openModal(modal)}
            className="flex flex-col items-center gap-2 py-4 px-3 rounded-[var(--radius-md)] transition-colors"
            style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <Icon size={18} strokeWidth={1.5} style={{ color: "var(--ink3)" }} />
            <span className="font-outfit text-[0.7rem] font-medium text-center leading-tight" style={{ color: "var(--ink3)" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE-ONLY COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MobileBalanceHero({ summary, loading }: { summary: HomeSummaryResponse | null; loading: boolean }) {
  const netFlow = summary ? summary.monthIncome - summary.monthExpense : 0;
  const isUp    = netFlow >= 0;

  return (
    <div className="rounded-[var(--radius-lg)] px-5 py-5 flex flex-col gap-4" style={{ background: "var(--ink)" }}>
      <div>
        <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.38)" }}>Net Balance</p>
        {loading
          ? <Skeleton style={{ height: "36px", width: "160px", marginTop: "4px", background: "rgba(255,255,255,0.12)" }} />
          : <p className="font-mono font-medium text-[2rem] leading-none mt-1 text-white">{fmtFull(summary?.netBalance ?? 0)}</p>
        }
        {!loading && summary && (
          <div className="flex items-center gap-1 mt-1.5">
            {isUp
              ? <TrendingUp size={11} style={{ color: "var(--forest-xl)" }} />
              : <TrendingDown size={11} style={{ color: "var(--expense)" }} />
            }
            <span className="font-outfit text-[0.72rem]" style={{ color: isUp ? "var(--forest-xl)" : "var(--expense)" }}>
              {isUp ? "+" : "−"}{fmt(Math.abs(summary.netFlowChange))} vs last month
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex-1 rounded-[var(--radius-sm)] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.32)" }}>Income</p>
          {loading
            ? <Skeleton style={{ height: "20px", width: "72px", marginTop: "4px", background: "rgba(255,255,255,0.12)" }} />
            : <p className="font-mono font-medium text-[0.95rem] text-white mt-0.5">{fmt(summary?.monthIncome ?? 0)}</p>
          }
        </div>
        <div className="flex-1 rounded-[var(--radius-sm)] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.32)" }}>Expenses</p>
          {loading
            ? <Skeleton style={{ height: "20px", width: "72px", marginTop: "4px", background: "rgba(255,255,255,0.12)" }} />
            : <p className="font-mono font-medium text-[0.95rem] text-white mt-0.5">{fmt(summary?.monthExpense ?? 0)}</p>
          }
        </div>
      </div>
    </div>
  );
}

function MobileWalletChips({ wallets, loading }: { wallets: HomeWalletItem[]; loading: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>Wallets</p>
        <Link to="/wallet" className="font-outfit text-[0.72rem] font-medium no-underline flex items-center gap-0.5" style={{ color: "var(--forest)" }}>
          Manage <ArrowRight size={11} />
        </Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 rounded-[var(--radius-md)] animate-pulse" style={{ background: "var(--bg3)", minWidth: "130px", minHeight: "80px" }} />
            ))
          : wallets.filter(w => !w.isArchived).map(w => (
              <div
                key={w.id}
                className="flex-shrink-0 rounded-[var(--radius-md)] px-4 py-3 flex flex-col justify-between"
                style={{ background: getWalletColor(w.name), minWidth: "130px", minHeight: "80px" }}
              >
                <p className="font-outfit font-medium text-[0.72rem]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {w.icon} {w.name}
                </p>
                <div>
                  <p className="font-mono font-medium text-[0.95rem] leading-none text-white">{fmt(w.currentBalance)}</p>
                  <p className="font-mono text-[0.55rem] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{w.currency}</p>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

function MobileBudgetBars({ budgets, overCount, loading }: {
  budgets:   BudgetSnapshotItem[];
  overCount: number;
  loading:   boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>Budgets</p>
        <div className="flex items-center gap-2">
          {overCount > 0 && (
            <span className="flex items-center gap-1 font-outfit text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "var(--expense)" }}>
              <AlertCircle size={9} /> {overCount} over
            </span>
          )}
          <Link to="/wallet" className="font-outfit text-[0.72rem] font-medium no-underline" style={{ color: "var(--forest)" }}>View all</Link>
        </div>
      </div>
      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="px-4 py-3" style={{ borderBottom: i < 2 ? "1px solid var(--bg3)" : "none" }}>
                <Skeleton style={{ height: "48px" }} />
              </div>
            ))
          : budgets.length === 0
          ? <p className="font-outfit text-[0.82rem] px-4 py-5 text-center" style={{ color: "var(--ink4)" }}>No active budgets.</p>
          : budgets.map((b, i) => {
              const pct    = Math.min((b.spent / b.amountLimit) * 100, 100);
              const color  = budgetColor(b.spent, b.amountLimit);
              const isOver = b.spent > b.amountLimit;
              return (
                <div key={b.budgetId} className="px-4 py-3" style={{ borderBottom: i < budgets.length - 1 ? "1px solid var(--bg3)" : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.85rem]">{b.categoryIcon}</span>
                      <span className="font-outfit font-medium text-[0.82rem]" style={{ color: "var(--ink2)" }}>{b.categoryName}</span>
                      {isOver && (
                        <span className="font-outfit text-[0.58rem] font-semibold px-1 py-0.5 rounded" style={{ background: "#FEE2E2", color: "var(--expense)" }}>OVER</span>
                      )}
                    </div>
                    <span className="font-mono text-[0.65rem]" style={{ color: "var(--ink4)" }}>{fmt(b.spent)}/{fmt(b.amountLimit)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <p className="font-outfit text-[0.65rem] mt-1" style={{ color: isOver ? "var(--expense)" : "var(--ink4)" }}>
                    {isOver ? `Over by ${fmt(b.spent - b.amountLimit)}` : `${fmt(b.remaining)} remaining`}
                  </p>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════

export default function HomePage() {
  const user             = useAuthStore(s => s.user);
  const { setPageTitle } = useLayout();
  const isDesktop        = useMediaQuery("(min-width: 768px)");

  const [summary,      setSummary]      = useState<HomeSummaryResponse | null>(null);
  const [wallets,      setWallets]      = useState<HomeWalletItem[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState<RecentTransactionItem[]>([]);
  const [budgets,      setBudgets]      = useState<BudgetSnapshotItem[]>([]);
  const [overCount,    setOverCount]    = useState(0);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [loadingTxns,    setLoadingTxns]    = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);

  useEffect(() => {
    setPageTitle("Home");

    // Fire all 4 requests in parallel
    fetchHomeSummary()
      .then(setSummary)
      .finally(() => setLoadingSummary(false));

    fetchHomeWallets()
      .then(r => { setWallets(r.wallets); setTotalBalance(r.totalBalance); })
      .finally(() => setLoadingWallets(false));

    fetchRecentTransactions(10)
      .then(r => setTransactions(r.transactions))
      .finally(() => setLoadingTxns(false));

    fetchBudgetSnapshot()
      .then(r => { setBudgets(r.budgets); setOverCount(r.overCount); })
      .finally(() => setLoadingBudgets(false));
  }, [setPageTitle]);

  const savingsRate = summary
    ? `${summary.savingsRate}%`
    : "—";

  if (isDesktop) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div>
          <p className="font-outfit font-light text-[0.85rem]" style={{ color: "var(--ink4)" }}>Good {getGreeting()},</p>
          <h1 className="font-lora font-bold text-[1.55rem] leading-tight" style={{ color: "var(--ink)" }}>
            {user?.displayName?.split(" ")[0] ?? "there"}.
          </h1>
        </div>

        <div className="flex gap-3">
          <StatCard label="Net Balance"    value={fmt(totalBalance)}           sub={summary ? `${summary.netFlowChange >= 0 ? "+" : ""}${fmt(summary.netFlowChange)} vs last month` : undefined} subColor={summary && summary.netFlowChange >= 0 ? "var(--income)" : "var(--expense)"} loading={loadingSummary || loadingWallets} />
          <StatCard label="Income (Month)" value={fmt(summary?.monthIncome ?? 0)}  loading={loadingSummary} />
          <StatCard label="Expenses (Month)" value={fmt(summary?.monthExpense ?? 0)} loading={loadingSummary} />
          <StatCard label="Savings Rate"   value={savingsRate} sub={summary && summary.savingsRate >= 20 ? "On track ✓" : "Target: 20%"} subColor="var(--forest)" loading={loadingSummary} />
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          <div className="min-w-0 flex flex-col gap-4 overflow-y-auto" style={{ flex: "0 0 75%" }}>
            <DesktopQuickActions />
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-outfit font-semibold text-[0.95rem]" style={{ color: "var(--ink)" }}>Recent Transactions</p>
                <Link to="/history" className="font-outfit text-[0.73rem] font-medium no-underline flex items-center gap-1" style={{ color: "var(--forest)" }}>
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <TransactionList txns={transactions} loading={loadingTxns} />
            </div>
          </div>
          <DesktopRightPanel wallets={wallets} budgets={budgets} overCount={overCount} loading={loadingWallets || loadingBudgets} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div>
        <p className="font-outfit font-light text-[0.82rem]" style={{ color: "var(--ink4)" }}>Good {getGreeting()},</p>
        <h1 className="font-lora font-bold text-[1.4rem] leading-tight" style={{ color: "var(--ink)" }}>
          {user?.displayName?.split(" ")[0] ?? "there"}.
        </h1>
      </div>
      <MobileBalanceHero summary={summary} loading={loadingSummary} />
      <MobileWalletChips wallets={wallets} loading={loadingWallets} />
      <MobileBudgetBars budgets={budgets} overCount={overCount} loading={loadingBudgets} />
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-outfit font-semibold text-[0.9rem]" style={{ color: "var(--ink)" }}>Recent</p>
          <Link to="/history" className="font-outfit text-[0.72rem] font-medium no-underline flex items-center gap-0.5" style={{ color: "var(--forest)" }}>
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <TransactionList txns={transactions} loading={loadingTxns} />
      </div>
    </div>
  );
}