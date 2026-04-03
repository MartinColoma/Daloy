import { useState, useEffect } from "react";
import {
  Bell, Shield, Download, HelpCircle,
  ChevronRight, LogOut, BarChart2, TrendingUp,
  PieChart, AlertTriangle, Check,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useAuth } from "../../hooks/useAuth";
import { useLayout } from "../../layouts/LayoutContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";

// ── Helpers ───────────────────────────────────────────────────
function fmt(n: number): string {
  return `₱${Math.abs(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="animate-pulse rounded-[var(--radius-sm)]" style={{ background: "var(--bg3)", ...style }} />
  );
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ name, url, size = 56 }: { name: string; url?: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-outfit font-semibold"
      style={{
        width: size, height: size,
        background: "var(--forest)",
        color: "#fff",
        fontSize: size * 0.34,
      }}
    >
      {initials}
    </div>
  );
}

// REPLACE SettingsRow entirely:
function SettingsRow({
  icon: Icon, label, sublabel, onClick, rightSlot, danger = false, last = false,
}: {
  icon:       React.ElementType;
  label:      string;
  sublabel?:  string;
  onClick?:   () => void;
  rightSlot?: React.ReactNode;
  danger?:    boolean;
  last?:      boolean;
}) {
  const inner = (
    <>
      <div
        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
        style={{ background: danger ? "#FBF0F0" : "var(--bg3)" }}
      >
        <Icon size={15} strokeWidth={1.6} style={{ color: danger ? "var(--expense)" : "var(--ink3)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-outfit font-medium text-[0.86rem]"
          style={{ color: danger ? "var(--expense)" : "var(--ink)" }}
        >
          {label}
        </p>
        {sublabel && (
          <p className="font-outfit text-[0.7rem] truncate" style={{ color: "var(--ink4)" }}>{sublabel}</p>
        )}
      </div>
      {rightSlot ?? <ChevronRight size={14} style={{ color: "var(--ink4)" }} />}
    </>
  );

  const sharedStyle: React.CSSProperties = { borderBottom: last ? "none" : "1px solid var(--bg3)" };
  const sharedClass = "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left";

  // When a rightSlot is provided, the row itself is not interactive — use a div
  if (rightSlot) {
    return (
      <div className={sharedClass} style={sharedStyle}>
        {inner}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={sharedClass}
      style={sharedStyle}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {inner}
    </button>
  );
}

// ── Settings section card ─────────────────────────────────────
function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[0.55rem] tracking-[0.18em] uppercase mb-2 px-1" style={{ color: "var(--ink4)" }}>
        {title}
      </p>
      <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
        {children}
      </div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-0.5 py-3">
      <p className="font-mono font-medium text-[1rem] leading-none" style={{ color: color ?? "var(--ink)" }}>{value}</p>
      <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase" style={{ color: "var(--ink4)" }}>{label}</p>
    </div>
  );
}

// ── Insight card ──────────────────────────────────────────────
function InsightCard({
  icon: Icon, title, value, sub, color,
}: {
  icon:   React.ElementType;
  title:  string;
  value:  string;
  sub:    string;
  color?: string;
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-[var(--radius-md)] px-4 py-3 flex flex-col gap-1.5"
      style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={13} strokeWidth={1.6} style={{ color: color ?? "var(--ink4)" }} />
        <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase" style={{ color: "var(--ink4)" }}>{title}</p>
      </div>
      <p className="font-mono font-medium text-[1.1rem] leading-none" style={{ color: color ?? "var(--ink)" }}>{value}</p>
      <p className="font-outfit text-[0.68rem]" style={{ color: "var(--ink4)" }}>{sub}</p>
    </div>
  );
}

// ── Rule check row ────────────────────────────────────────────
function RuleCheck({ label, passing, detail }: { label: string; passing: boolean; detail: string }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      style={{ borderBottom: "1px solid var(--bg3)" }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: passing ? "var(--forest-bg)" : "#FBF0F0" }}
      >
        {passing
          ? <Check size={10} strokeWidth={2.5} style={{ color: "var(--forest)" }} />
          : <AlertTriangle size={9} strokeWidth={2} style={{ color: "var(--expense)" }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-outfit font-medium text-[0.82rem]" style={{ color: "var(--ink)" }}>{label}</p>
        <p className="font-outfit text-[0.7rem] mt-0.5" style={{ color: passing ? "var(--ink4)" : "var(--expense)" }}>{detail}</p>
      </div>
    </div>
  );
}

// ── Insights section (shared, used in both layouts) ───────────
function InsightsSection({ collapsed = false }: { collapsed?: boolean }) {
  // Placeholder data — replace with real hook when insightService is wired
  const stats = {
    savingsRate: 22.4,
    topCategory: "Food",
    topAmount:   4200,
    netWorth:    58420,
    monthIncome: 35000,
    monthExpense: 27160,
    passes50_30_20: false,
    passes20savings: true,
  };

  const net = stats.monthIncome - stats.monthExpense;

  if (collapsed) {
    // Compact version for use inside a settings card row
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mini stats */}
      <div
        className="flex rounded-[var(--radius-md)] overflow-hidden divide-x"
        style={{ background: "var(--bg2)", border: "1px solid var(--bg3)", borderColor: "var(--bg3)" }}
      >
        <StatPill label="Savings Rate" value={`${stats.savingsRate}%`} color={stats.savingsRate >= 20 ? "var(--income)" : "var(--expense)"} />
        <div style={{ width: "1px", background: "var(--bg3)" }} />
        <StatPill label="Net Worth" value={`₱${(stats.netWorth / 1000).toFixed(1)}k`} color="var(--ink)" />
        <div style={{ width: "1px", background: "var(--bg3)" }} />
        <StatPill label="Monthly Net" value={net >= 0 ? `+${fmt(net)}` : `−${fmt(net)}`} color={net >= 0 ? "var(--income)" : "var(--expense)"} />
      </div>

      {/* Insight cards */}
      <div className="flex gap-3">
        <InsightCard
          icon={PieChart}
          title="Top Category"
          value={`₱${stats.topAmount.toLocaleString()}`}
          sub={`${stats.topCategory} · this month`}
          color="var(--clay-m)"
        />
        <InsightCard
          icon={TrendingUp}
          title="Income"
          value={fmt(stats.monthIncome)}
          sub="vs last month"
          color="var(--income)"
        />
      </div>

      {/* 50/30/20 rule checks */}
      <div>
        <p className="font-mono text-[0.55rem] tracking-[0.18em] uppercase mb-2 px-1" style={{ color: "var(--ink4)" }}>
          Financial Health Checks
        </p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bg3)" }}>
          <RuleCheck
            label="20% Savings Rule"
            passing={stats.passes20savings}
            detail={stats.passes20savings ? `You're saving ${stats.savingsRate}% — on track.` : `Target 20%. Currently at ${stats.savingsRate}%.`}
          />
          <RuleCheck
            label="50/30/20 Budget"
            passing={stats.passes50_30_20}
            detail={stats.passes50_30_20 ? "Needs, wants, and savings are balanced." : "Spending mix is off. Review budget breakdown."}
          />
          <RuleCheck
            label="Emergency Fund"
            passing={false}
            detail="Aim for 3–6 months of expenses in savings."
          />
        </div>
      </div>
    </div>
  );
}

// ── Currency preference toggle ────────────────────────────────
const CURRENCIES = ["PHP", "USD", "EUR", "JPY", "SGD", "GBP"];

function CurrencySelector({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {CURRENCIES.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="px-2.5 py-1 rounded-full font-mono text-[0.68rem] font-medium transition-colors"
          style={{
            background: value === c ? "var(--forest)" : "var(--bg2)",
            color:      value === c ? "#fff"          : "var(--ink3)",
            border:     `1px solid ${value === c ? "var(--forest)" : "var(--bg3)"}`,
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════
export default function ProfilePage() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { setPageTitle } = useLayout();
    const user                   = useAuthStore(s => s.user);
    const baseCurrency = user?.baseCurrency ?? "PHP";
    const { signOut, isLoading }  = useAuth();

  const [currency,          setCurrency]          = useState(baseCurrency ?? "PHP");
  const [insightsExpanded,  setInsightsExpanded]  = useState(false);
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(true);

  useEffect(() => { setPageTitle("Profile"); }, []);

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "User";
  const email       = user?.email ?? "";

  const handleSignOut = async () => {
    await signOut?.();
  };

  // ── Desktop ────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div>
          <p className="font-mono text-[0.57rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>Account</p>
          <h1 className="font-lora font-bold text-[1.55rem] leading-tight mt-0.5" style={{ color: "var(--ink)" }}>Profile</h1>
        </div>

        <div className="flex gap-5 items-start">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-4" style={{ flex: "1 1 0", minWidth: 0 }}>
            {/* Account card */}
            <div
              className="flex items-center gap-4 px-5 py-4 rounded-[var(--radius-lg)]"
              style={{ background: "var(--ink)" }}
            >
              <Avatar name={displayName} url={user?.avatarUrl} size={52} />
              <div className="flex-1 min-w-0">
                <p className="font-lora font-semibold text-[1.1rem] text-white leading-snug">{displayName}</p>
                <p className="font-outfit text-[0.75rem] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{email}</p>
              </div>
              <button
                className="px-3 py-1.5 rounded-[var(--radius-sm)] font-outfit font-medium text-[0.72rem] transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              >
                Edit
              </button>
            </div>

            {/* Insights */}
            <div>
              <p className="font-mono text-[0.55rem] tracking-[0.18em] uppercase mb-2 px-1" style={{ color: "var(--ink4)" }}>
                Insights & Reports
              </p>
              <InsightsSection />
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4" style={{ flex: "0 0 320px" }}>
            {/* Preferences */}
            <SettingsCard title="Preferences">
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--bg3)" }}>
                <p className="font-outfit font-medium text-[0.86rem] mb-2" style={{ color: "var(--ink)" }}>Base Currency</p>
                <CurrencySelector value={currency} onChange={setCurrency} />
              </div>
              <SettingsRow
                icon={Bell}
                label="Budget Alerts"
                sublabel={notifBudgetAlerts ? "Notify when over 80%" : "Disabled"}
                rightSlot={
                  <button
                    onClick={() => setNotifBudgetAlerts(p => !p)}
                    className="w-10 h-5 rounded-full transition-colors relative shrink-0"
                    style={{ background: notifBudgetAlerts ? "var(--forest)" : "var(--bg3)" }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: notifBudgetAlerts ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                    />
                  </button>
                }
                last
              />
            </SettingsCard>

            {/* Security */}
            <SettingsCard title="Security">
              <SettingsRow icon={Shield} label="Change Password" sublabel="Update your login credentials" />
              <SettingsRow icon={Shield} label="Connected Accounts" sublabel="Google, Apple" last />
            </SettingsCard>

            {/* Data */}
            <SettingsCard title="Data">
              <SettingsRow icon={Download} label="Export Transactions" sublabel="Download as CSV" />
              <SettingsRow icon={HelpCircle} label="Help & Support" last />
            </SettingsCard>

            {/* Sign out */}
            <SettingsCard title="Session">
              <SettingsRow
                icon={LogOut}
                label="Sign Out"
                sublabel={email}
                danger
                onClick={handleSignOut}
                last
              />
            </SettingsCard>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Profile hero */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-[var(--radius-lg)]"
        style={{ background: "var(--ink)" }}
      >
        <Avatar name={displayName} url={user?.avatarUrl} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-lora font-semibold text-[1.05rem] text-white leading-snug truncate">{displayName}</p>
          <p className="font-outfit text-[0.72rem] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{email}</p>
        </div>
        <button
          className="px-2.5 py-1.5 rounded-[var(--radius-sm)] font-outfit font-medium text-[0.7rem] shrink-0 transition-colors"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
        >
          Edit
        </button>
      </div>

      {/* Insights & Reports (collapsible) */}
      <div>
        <button
          onClick={() => setInsightsExpanded(p => !p)}
          className="w-full flex items-center justify-between mb-2 px-1"
        >
          <p className="font-mono text-[0.55rem] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
            Insights & Reports
          </p>
          <div
            className="flex items-center gap-1 font-outfit text-[0.7rem] font-medium"
            style={{ color: "var(--forest)" }}
          >
            <BarChart2 size={12} />
            {insightsExpanded ? "Collapse" : "Expand"}
          </div>
        </button>
        {insightsExpanded && <InsightsSection />}
        {!insightsExpanded && (
          <button
            onClick={() => setInsightsExpanded(true)}
            className="w-full rounded-[var(--radius-md)] py-3 flex items-center justify-center gap-2 font-outfit font-medium text-[0.82rem] transition-colors"
            style={{ background: "var(--bg2)", border: "1px solid var(--bg3)", color: "var(--ink3)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg2)")}
          >
            <BarChart2 size={14} strokeWidth={1.6} />
            View Insights & Reports
          </button>
        )}
      </div>

      {/* Preferences */}
      <SettingsCard title="Preferences">
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--bg3)" }}>
          <p className="font-outfit font-medium text-[0.86rem] mb-2" style={{ color: "var(--ink)" }}>Base Currency</p>
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
        <SettingsRow
          icon={Bell}
          label="Budget Alerts"
          sublabel={notifBudgetAlerts ? "Notify when over 80%" : "Disabled"}
          rightSlot={
            <button
              onClick={() => setNotifBudgetAlerts(p => !p)}
              className="w-10 h-5 rounded-full transition-colors relative shrink-0"
              style={{ background: notifBudgetAlerts ? "var(--forest)" : "var(--bg3)" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: notifBudgetAlerts ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
              />
            </button>
          }
          last
        />
      </SettingsCard>

      {/* Security */}
      <SettingsCard title="Security">
        <SettingsRow icon={Shield} label="Change Password" sublabel="Update your login credentials" />
        <SettingsRow icon={Shield} label="Connected Accounts" sublabel="Google, Apple" last />
      </SettingsCard>

      {/* Data */}
      <SettingsCard title="Data">
        <SettingsRow icon={Download} label="Export Transactions" sublabel="Download as CSV" />
        <SettingsRow icon={HelpCircle} label="Help & Support" last />
      </SettingsCard>

        {/* Sign out */}
        <SettingsCard title="Session">
        <SettingsRow
            icon={LogOut}
            label="Sign Out"
            sublabel={email}
            danger
            onClick={handleSignOut}
            last
        />
        </SettingsCard>
    </div>
  );
}