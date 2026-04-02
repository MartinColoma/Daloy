import { NavLink } from "react-router-dom";
import {
  Home,
  Wallet,
  History,
  User,
  Plus,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useAuth } from "../../hooks/useAuth";
import { useLayout } from "../../layouts/LayoutContext";

/* ─────────────────────────────────────────────
   Sidebar.tsx — Desktop sidebar
   Dark bg (--ink) · 4 nav items · Add Transaction CTA
   Per design spec: 210px wide, dark theme, --forest-xl accent
───────────────────────────────────────────── */

const NAV_ITEMS = [
  { to: "/home",    icon: Home,    label: "Home"    },
  { to: "/wallet",  icon: Wallet,  label: "Wallet"  },
  { to: "/history", icon: History, label: "History" },
  { to: "/profile", icon: User,    label: "Profile" },
];

export default function Sidebar() {
  const user          = useAuthStore(s => s.user);
  const { openModal } = useLayout();
  const { signOut, isLoading } = useAuth();

  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className="flex flex-col h-full shrink-0 py-6 px-0"
      style={{
        background: "var(--ink)",
        width: "210px",
        minWidth: "210px",
      }}
    >
      {/* Logo */}
      <div className="px-6 mb-10">
        <span
          className="font-lora font-bold text-[1.25rem] tracking-tight"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          dal<span style={{ color: "var(--forest-xl)" }}>oy</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 px-6 py-[0.65rem] font-outfit font-medium text-[0.875rem] transition-colors no-underline"
            style={({ isActive }) =>
              isActive
                ? {
                    color: "rgba(255,255,255,0.92)",
                    background: "rgba(255,255,255,0.07)",
                    borderLeft: "2px solid var(--forest-xl)",
                  }
                : {
                    color: "rgba(255,255,255,0.45)",
                    borderLeft: "2px solid transparent",
                  }
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  style={{
                    color: isActive
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(255,255,255,0.35)",
                  }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Add Transaction CTA */}
      <div className="px-5 mt-4">
        <button
          onClick={() => openModal("add-expense")}
          className="w-full flex items-center justify-center gap-2 font-outfit font-medium text-[0.82rem] text-white py-[0.6rem] rounded-[var(--radius-sm)] transition-colors"
          style={{ background: "var(--forest)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--forest-m)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
        >
          <Plus size={14} strokeWidth={2.2} />
          Add Transaction
        </button>
      </div>

      {/* User chip — click to log out */}
      <button
        onClick={signOut}
        disabled={isLoading}
        className="mx-4 mt-5 flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left w-[calc(100%-2rem)] group transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "rgba(255,255,255,0.06)" }}
        onMouseEnter={e => {
          if (!isLoading) e.currentTarget.style.background = "rgba(255,255,255,0.11)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        title="Sign out"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-outfit font-semibold text-[0.7rem] text-white shrink-0"
          style={{ background: "var(--forest)" }}
        >
          {initials}
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <p
            className="font-outfit font-medium text-[0.8rem] truncate"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {user?.displayName ?? "User"}
          </p>
          <p
            className="font-outfit text-[0.68rem] truncate"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {user?.email}
          </p>
        </div>
        {/* Logout icon — fades in on hover */}
        <LogOut
          size={13}
          strokeWidth={1.8}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "rgba(255,255,255,0.45)" }}
        />
      </button>
    </aside>
  );
}