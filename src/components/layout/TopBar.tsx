import { Bell, Search } from "lucide-react";
import { useLayout } from "../../layouts/LayoutContext";

/* ─────────────────────────────────────────────
   TopBar.tsx — Desktop top bar
   Dynamic page title · month pill · icon buttons
───────────────────────────────────────────── */

function currentMonthLabel() {
  return new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" });
}

export default function TopBar() {
  const { pageTitle } = useLayout();

  return (
    <header
      className="flex items-center justify-between px-8 py-4 shrink-0"
      style={{
        background: "var(--bg2)",
        borderBottom: "1px solid var(--bg3)",
        minHeight: "60px",
      }}
    >
      {/* Left: page title */}
      <h1
        className="font-lora font-semibold text-[1.2rem] tracking-tight"
        style={{ color: "var(--ink)" }}
      >
        {pageTitle}
      </h1>

      {/* Right: month pill + icons */}
      <div className="flex items-center gap-3">
        {/* Month pill */}
        <span
          className="font-mono text-[0.7rem] tracking-[0.1em] uppercase px-3 py-1 rounded-full"
          style={{
            background: "var(--bg3)",
            color: "var(--ink3)",
          }}
        >
          {currentMonthLabel()}
        </span>

        {/* Search */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors"
          style={{ color: "var(--ink3)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          aria-label="Search"
        >
          <Search size={16} strokeWidth={1.8} />
        </button>

        {/* Notifications */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors"
          style={{ color: "var(--ink3)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}