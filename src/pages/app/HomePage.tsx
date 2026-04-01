import { useEffect } from "react";
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Briefcase,
  ArrowLeftRight,
  Users,
  RefreshCcw,
  Handshake,
  SlidersHorizontal,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useLayout } from "../../layouts/LayoutContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { ModalName } from "../../layouts/LayoutContext";

/* ─────────────────────────────────────────────
   HomePage.tsx — /home
   Renders DesktopHome or MobileHome based on
   the useMediaQuery breakpoint hook.

   Desktop:
     · Greeting + stat cards row
     · Left col: Quick Actions → Recent Transactions
     · Right panel: Wallet strips + Budget Snapshot

   Mobile:
     · Greeting + balance hero card
     · Wallet chips horizontal scroll strip
     · Budget envelope bars with alert badges
     · Recent transactions (last 5, grouped by day)
     · (Quick Actions live in FAB sheet, not here)
───────────────────────────────────────────── */

// ── Shared mock data ──────────────────────────────────────────
const MOCK_WALLETS = [
  { id: "1", name: "BPI Jumpstart", icon: "🏦", balance: 28400, currency: "PHP", brandColor: "#1C1A17" },
  { id: "2", name: "GCash",         icon: "💙", balance: 8650,  currency: "PHP", brandColor: "#005CFF" },
  { id: "3", name: "Maya",          icon: "💚", balance: 5800,  currency: "PHP", brandColor: "#2D8653" },
  { id: "4", name: "Cash",          icon: "💵", balance: 0,     currency: "PHP", brandColor: "#5C4033" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", description: "SM Supermarket",      category: "Food · GCash",              amount: -2340,  type: "expense",  icon: "🛒", wallet: "GCash",         date: "TODAY · MAR 29"      },
  { id: "2", description: "Freelance — Acme Corp", category: "Income · BPI",            amount: 15000,  type: "income",   icon: "💼", wallet: "BPI Jumpstart",  date: "YESTERDAY · MAR 28"  },
  { id: "3", description: "Airfare $120 USD",    category: "Travel · Cash · ₱6,958.04", amount: -6964,  type: "expense",  icon: "✈️", wallet: "Cash",           date: "YESTERDAY · MAR 28"  },
  { id: "4", description: "BPI → GCash",         category: "Transfer",                  amount: 5000,   type: "transfer", icon: "↔️", wallet: "Internal",       date: "MAR 26"              },
  { id: "5", description: "Jollibee",            category: "Food · GCash",              amount: -285,   type: "expense",  icon: "🍟", wallet: "GCash",           date: "MAR 26"              },
];

const MOCK_BUDGETS = [
  { category: "Food",          icon: "🍽️", spent: 3200, limit: 5000 },
  { category: "Transport",     icon: "🚌", spent: 1820, limit: 2000 },
  { category: "Entertainment", icon: "⭐", spent: 1650, limit: 1500 },
];

const QUICK_ACTIONS: { key: string; icon: React.ElementType; label: string; modal: ModalName }[] = [
  { key: "add-expense",      icon: ShoppingCart,     label: "Add Expense",      modal: "add-expense"      },
  { key: "log-income",       icon: Briefcase,         label: "Log Income",       modal: "log-income"       },
  { key: "transfer",         icon: ArrowLeftRight,    label: "Transfer",         modal: "transfer"         },
  { key: "group-expense",    icon: Users,             label: "Group Expense",    modal: "group-expense"    },
  { key: "convert-currency", icon: RefreshCcw,        label: "Convert Currency", modal: "convert-currency" },
  { key: "settle-up",        icon: Handshake,         label: "Settle Up",        modal: "settle-up"        },
  { key: "budget-limits",    icon: SlidersHorizontal, label: "Budget Limits",    modal: "budget-limits"    },
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

function groupTransactions(txns: typeof MOCK_TRANSACTIONS) {
  const groups: { date: string; txns: typeof MOCK_TRANSACTIONS }[] = [];
  txns.forEach(t => {
    const last = groups[groups.length - 1];
    if (last && last.date === t.date) last.txns.push(t);
    else groups.push({ date: t.date, txns: [t] });
  });
  return groups;
}

// ═══════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ── Transaction row (shared between desktop + mobile) ─────────
function TxnRow({ t, last }: { t: typeof MOCK_TRANSACTIONS[0]; last: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: last ? "none" : "1px solid var(--bg3)" }}
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[0.95rem] shrink-0"
        style={{ background: "var(--bg3)" }}
      >
        {t.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-outfit font-medium text-[0.86rem] truncate" style={{ color: "var(--ink)" }}>
          {t.description}
        </p>
        <p className="font-outfit text-[0.7rem] truncate" style={{ color: "var(--ink4)" }}>
          {t.category}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="font-mono text-[0.86rem] font-medium"
          style={{
            color: t.type === "income" ? "var(--income)" : t.type === "transfer" ? "var(--steel-m)" : "var(--expense)",
          }}
        >
          {t.type === "income" ? "+" : t.type === "transfer" ? "" : "−"}{fmt(t.amount)}
        </p>
        <p className="font-outfit text-[0.63rem]" style={{ color: "var(--ink4)" }}>
          {t.wallet}
        </p>
      </div>
    </div>
  );
}

// ── Transaction list (shared) ─────────────────────────────────
function TransactionList({ txns }: { txns: typeof MOCK_TRANSACTIONS }) {
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

// ── Desktop stat card ─────────────────────────────────────────
function StatCard({ label, value, sub, subColor }: {
  label: string; value: string; sub?: string; subColor?: string;
}) {
  return (
    <div
      className="flex-1 min-w-0 px-5 py-4 flex flex-col gap-1 rounded-[var(--radius-md)]"
      style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
    >
      <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
        {label}
      </p>
      <p className="font-mono font-medium text-[1.45rem] leading-none mt-0.5" style={{ color: "var(--ink)" }}>
        {value}
      </p>
      {sub && (
        <p className="font-outfit text-[0.7rem] mt-0.5" style={{ color: subColor ?? "var(--ink4)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Desktop right panel: wallet strips + budget snapshot ──────
function DesktopRightPanel() {
  const overCount = MOCK_BUDGETS.filter(b => b.spent >= b.limit).length;

  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto"
      style={{ flex: "0 0 25%", minWidth: "260px" }}
    >
      {/* Wallets */}
      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--bg3)" }}>
          <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
            Wallets
          </p>
          <Link to="/wallet" className="font-outfit text-[0.68rem] font-medium no-underline flex items-center gap-0.5" style={{ color: "var(--forest)" }}>
            Manage <ArrowRight size={10} />
          </Link>
        </div>
        <div className="flex flex-col gap-1.5 p-2.5">
          {MOCK_WALLETS.map(w => (
            <div
              key={w.id}
              className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)]"
              style={{ background: w.brandColor }}
            >
              <p className="font-outfit font-medium text-[0.75rem]" style={{ color: "rgba(255,255,255,0.75)" }}>
                {w.name}
              </p>
              <p className="font-mono text-[0.78rem] font-medium text-white">
                {fmt(w.balance)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Snapshot */}
      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--bg3)" }}>
          <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
            Budget Snapshot
          </p>
          {overCount > 0 && (
            <span className="font-outfit text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "var(--expense)" }}>
              {overCount} over
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 px-4 py-3">
          {MOCK_BUDGETS.map(b => {
            const pct       = Math.min((b.spent / b.limit) * 100, 100);
            const color     = budgetColor(b.spent, b.limit);
            const remaining = b.limit - b.spent;
            const isOver    = b.spent > b.limit;
            return (
              <div key={b.category} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-outfit text-[0.76rem] font-medium" style={{ color: "var(--ink2)" }}>
                    {b.icon} {b.category}
                  </span>
                  <span className="font-mono text-[0.62rem]" style={{ color: "var(--ink4)" }}>
                    {fmt(b.spent)}/{fmt(b.limit)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="font-outfit text-[0.63rem]" style={{ color: isOver ? "var(--expense)" : "var(--ink4)" }}>
                  {isOver ? `Over by ${fmt(b.spent - b.limit)}` : `${fmt(remaining)} remaining`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Desktop quick actions grid ────────────────────────────────
function DesktopQuickActions() {
  const { openModal } = useLayout();
  return (
    <div>
      <p className="font-outfit font-semibold text-[0.95rem] mb-3" style={{ color: "var(--ink)" }}>
        Quick Actions
      </p>
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
            <span className="font-outfit text-[0.7rem] font-medium text-center leading-tight" style={{ color: "var(--ink3)" }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Desktop Home view ─────────────────────────────────────────
function DesktopHome({ user, totalBalance, monthIncome, monthExpense, savingsRate }: HomeProps) {
  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Greeting */}
      <div>
        <p className="font-outfit font-light text-[0.85rem]" style={{ color: "var(--ink4)" }}>
          Good {getGreeting()},
        </p>
        <h1 className="font-lora font-bold text-[1.55rem] leading-tight" style={{ color: "var(--ink)" }}>
          {user?.displayName?.split(" ")[0] ?? "there"}.
        </h1>
      </div>

      {/* Stat cards */}
      <div className="flex gap-3">
        <StatCard label="Net Balance"    value={fmt(totalBalance)} sub="+₱1,200 this month"   subColor="var(--income)"  />
        <StatCard label="Income (Mar)"   value={fmt(monthIncome)}  sub="Freelance — Acme Corp"                           />
        <StatCard label="Expenses (Mar)" value={fmt(monthExpense)} sub="+₱800 vs last month"   subColor="var(--expense)" />
        <StatCard label="Savings Rate"   value={`${savingsRate}%`} sub="Target 20% · On track" subColor="var(--forest)"  />
      </div>

      {/* Main content area */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left column */}
        <div
          className="min-w-0 flex flex-col gap-4 overflow-y-auto"
          style={{ flex: "0 0 75%" }}
        >
          <DesktopQuickActions />
          {/* Recent transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-outfit font-semibold text-[0.95rem]" style={{ color: "var(--ink)" }}>
                Recent Transactions
              </p>
              <Link to="/history" className="font-outfit text-[0.73rem] font-medium no-underline flex items-center gap-1" style={{ color: "var(--forest)" }}>
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <TransactionList txns={MOCK_TRANSACTIONS} />
          </div>
        </div>
        {/* Right panel */}
        <DesktopRightPanel />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE-ONLY COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ── Mobile balance hero card ──────────────────────────────────
function MobileBalanceHero({ totalBalance, monthIncome, monthExpense }: {
  totalBalance: number; monthIncome: number; monthExpense: number;
}) {
  const netFlow = monthIncome - monthExpense;
  const isUp    = netFlow >= 0;

  return (
    <div
      className="rounded-[var(--radius-lg)] px-5 py-5 flex flex-col gap-4"
      style={{ background: "var(--ink)" }}
    >
      {/* Total */}
      <div>
        <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.38)" }}>
          Net Balance
        </p>
        <p className="font-mono font-medium text-[2rem] leading-none mt-1 text-white">
          {fmtFull(totalBalance)}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {isUp
            ? <TrendingUp size={11} style={{ color: "var(--forest-xl)" }} />
            : <TrendingDown size={11} style={{ color: "var(--expense)" }} />
          }
          <span className="font-outfit text-[0.72rem]" style={{ color: isUp ? "var(--forest-xl)" : "var(--expense)" }}>
            +₱1,200 this month
          </span>
        </div>
      </div>

      {/* Income / Expense mini row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-[var(--radius-sm)] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.32)" }}>
            Income
          </p>
          <p className="font-mono font-medium text-[0.95rem] text-white mt-0.5">
            {fmt(monthIncome)}
          </p>
        </div>
        <div className="flex-1 rounded-[var(--radius-sm)] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.32)" }}>
            Expenses
          </p>
          <p className="font-mono font-medium text-[0.95rem] text-white mt-0.5">
            {fmt(monthExpense)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Mobile wallet chips horizontal strip ──────────────────────
function MobileWalletChips() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
          Wallets
        </p>
        <Link to="/wallet" className="font-outfit text-[0.72rem] font-medium no-underline flex items-center gap-0.5" style={{ color: "var(--forest)" }}>
          Manage <ArrowRight size={11} />
        </Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {MOCK_WALLETS.map(w => (
          <div
            key={w.id}
            className="flex-shrink-0 rounded-[var(--radius-md)] px-4 py-3 flex flex-col justify-between"
            style={{ background: w.brandColor, minWidth: "130px", minHeight: "80px" }}
          >
            <p className="font-outfit font-medium text-[0.72rem]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {w.name}
            </p>
            <div>
              <p className="font-mono font-medium text-[0.95rem] leading-none text-white">
                {fmt(w.balance)}
              </p>
              <p className="font-mono text-[0.55rem] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                {w.currency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile budget envelope bars with alert badges ─────────────
function MobileBudgetBars() {
  const overBudgets = MOCK_BUDGETS.filter(b => b.spent >= b.limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
          Budgets
        </p>
        <div className="flex items-center gap-2">
          {overBudgets.length > 0 && (
            <span
              className="flex items-center gap-1 font-outfit text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "#FEE2E2", color: "var(--expense)" }}
            >
              <AlertCircle size={9} />
              {overBudgets.length} over
            </span>
          )}
          <Link to="/wallet" className="font-outfit text-[0.72rem] font-medium no-underline" style={{ color: "var(--forest)" }}>
            View all
          </Link>
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        {MOCK_BUDGETS.map((b, i) => {
          const pct       = Math.min((b.spent / b.limit) * 100, 100);
          const color     = budgetColor(b.spent, b.limit);
          const isOver    = b.spent > b.limit;
          const remaining = b.limit - b.spent;
          return (
            <div
              key={b.category}
              className="px-4 py-3"
              style={{ borderBottom: i < MOCK_BUDGETS.length - 1 ? "1px solid var(--bg3)" : "none" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.85rem]">{b.icon}</span>
                  <span className="font-outfit font-medium text-[0.82rem]" style={{ color: "var(--ink2)" }}>
                    {b.category}
                  </span>
                  {isOver && (
                    <span className="font-outfit text-[0.58rem] font-semibold px-1 py-0.5 rounded" style={{ background: "#FEE2E2", color: "var(--expense)" }}>
                      OVER
                    </span>
                  )}
                </div>
                <span className="font-mono text-[0.65rem]" style={{ color: "var(--ink4)" }}>
                  {fmt(b.spent)}/{fmt(b.limit)}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <p className="font-outfit text-[0.65rem] mt-1" style={{ color: isOver ? "var(--expense)" : "var(--ink4)" }}>
                {isOver ? `Over by ${fmt(b.spent - b.limit)}` : `${fmt(remaining)} remaining`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mobile Home view ──────────────────────────────────────────
function MobileHome({ user, totalBalance, monthIncome, monthExpense }: Omit<HomeProps, "savingsRate">) {
  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* Greeting */}
      <div>
        <p className="font-outfit font-light text-[0.82rem]" style={{ color: "var(--ink4)" }}>
          Good {getGreeting()},
        </p>
        <h1 className="font-lora font-bold text-[1.4rem] leading-tight" style={{ color: "var(--ink)" }}>
          {user?.displayName?.split(" ")[0] ?? "there"}.
        </h1>
      </div>

      {/* Balance hero */}
      <MobileBalanceHero
        totalBalance={totalBalance}
        monthIncome={monthIncome}
        monthExpense={monthExpense}
      />

      {/* Wallet chips strip */}
      <MobileWalletChips />

      {/* Budget envelope bars */}
      <MobileBudgetBars />

      {/* Recent transactions — last 5, no "Quick Actions" here (lives in FAB) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-outfit font-semibold text-[0.9rem]" style={{ color: "var(--ink)" }}>
            Recent
          </p>
          <Link to="/history" className="font-outfit text-[0.72rem] font-medium no-underline flex items-center gap-0.5" style={{ color: "var(--forest)" }}>
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <TransactionList txns={MOCK_TRANSACTIONS.slice(0, 5)} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════

interface HomeProps {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  savingsRate: string;
}

export default function HomePage() {
  const user             = useAuthStore(s => s.user);
  const { setPageTitle } = useLayout();
  const isDesktop        = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setPageTitle("Home");
  }, [setPageTitle]);

  const totalBalance = MOCK_WALLETS.reduce((sum, w) => sum + w.balance, 0);
  const monthIncome  = 15000;
  const monthExpense = 11800;
  const savingsRate  = ((monthIncome - monthExpense) / monthIncome * 100).toFixed(1);

  const props = { user, totalBalance, monthIncome, monthExpense, savingsRate };

  return isDesktop
    ? <DesktopHome {...props} />
    : <MobileHome  {...props} />;
}