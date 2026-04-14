import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Wallet, History, User, Plus, LogOut, ChevronUp, Settings,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useAuth } from "../../hooks/auth/useAuth";
import { useLayout } from "../../layouts/LayoutContext";

const NAV_ITEMS = [
  { to: "/home",    icon: Home,    label: "Home"    },
  { to: "/wallet",  icon: Wallet,  label: "Wallet"  },
  { to: "/history", icon: History, label: "History" },
  { to: "/profile", icon: User,    label: "Profile" },
];

export default function Sidebar() {
  const user            = useAuthStore(s => s.user);
  const { openModal }   = useLayout();
  const { signOut, isLoading } = useAuth();
  const navigate        = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className="flex flex-col h-full shrink-0 py-6 px-0"
      style={{ background: "var(--ink)", width: "210px", minWidth: "210px" }}
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
                ? { color: "rgba(255,255,255,0.92)", background: "rgba(255,255,255,0.07)", borderLeft: "2px solid var(--forest-xl)" }
                : { color: "rgba(255,255,255,0.45)", borderLeft: "2px solid transparent" }
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  style={{ color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}
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

      {/* User chip with dropdown */}
      <div ref={dropdownRef} className="mx-4 mt-5 relative">

        {/* Dropdown — anchored above the chip */}
        {dropdownOpen && (
          <div
            className="absolute bottom-[calc(100%+6px)] left-0 right-0 rounded-[var(--radius-md)] overflow-hidden z-50"
            style={{
              background: "rgba(38,35,30,0.98)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.35)",
            }}
          >
            <button
              onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
              className="w-full flex items-center gap-3 px-4 py-[0.65rem] font-outfit font-medium text-[0.82rem] transition-colors text-left"
              style={{ color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Settings size={13} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.4)" }} />
              Profile & Settings
            </button>
            <button
              onClick={async () => { setDropdownOpen(false); await signOut(); }}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-[0.65rem] font-outfit font-medium text-[0.82rem] transition-colors text-left disabled:opacity-50"
              style={{ color: "var(--forest-xl)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={13} strokeWidth={1.8} style={{ color: "var(--forest-xl)" }} />
              {isLoading ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        )}

        {/* Chip trigger */}
        <button
          onClick={() => setDropdownOpen(p => !p)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-colors"
          style={{
            background: dropdownOpen ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.06)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.11)"; }}
          onMouseLeave={e => {
            if (!dropdownOpen) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-outfit font-semibold text-[0.7rem] text-white shrink-0"
            style={{ background: "var(--forest)" }}
          >
            {initials}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="font-outfit font-medium text-[0.8rem] truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
              {user?.displayName ?? "User"}
            </p>
            <p className="font-outfit text-[0.68rem] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
              {user?.email}
            </p>
          </div>
          <ChevronUp
            size={13}
            strokeWidth={2}
            className="shrink-0 transition-transform duration-200"
            style={{
              color: "rgba(255,255,255,0.35)",
              transform: dropdownOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
        </button>
      </div>
    </aside>
  );
}