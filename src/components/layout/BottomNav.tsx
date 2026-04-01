import { NavLink } from "react-router-dom";
import { Home, Wallet, History, User } from "lucide-react";

/* ─────────────────────────────────────────────
   BottomNav.tsx — Mobile bottom navigation
   Home · Wallet · [FAB slot] · History · Profile
   Active dot indicator below active icon.
───────────────────────────────────────────── */

const LEFT_NAV  = [
  { to: "/home",    icon: Home,    label: "Home"    },
  { to: "/wallet",  icon: Wallet,  label: "Wallets" },
];
const RIGHT_NAV = [
  { to: "/history", icon: History, label: "History" },
  { to: "/profile", icon: User,    label: "Profile" },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      className="flex flex-col items-center gap-0.5 flex-1 py-2 no-underline relative"
      style={{ color: "var(--ink4)" }}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={22}
            strokeWidth={isActive ? 2.2 : 1.6}
            style={{ color: isActive ? "var(--forest)" : "var(--ink3)" }}
          />
          <span
            className="font-outfit text-[0.6rem] font-medium"
            style={{ color: isActive ? "var(--forest)" : "var(--ink4)" }}
          >
            {label}
          </span>
          {/* Active dot */}
          {isActive && (
            <span
              className="absolute top-1 w-1 h-1 rounded-full"
              style={{ background: "var(--forest)" }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {

  return (
    <nav
      className="flex items-stretch"
      style={{
        background: "var(--bg2)",
        borderTop: "1px solid var(--bg3)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Left items */}
      {LEFT_NAV.map(item => (
        <NavItem key={item.to} {...item} />
      ))}

      {/* FAB slot — empty space that the FAB floats above */}
      <div className="flex-1" aria-hidden />

      {/* Right items */}
      {RIGHT_NAV.map(item => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}