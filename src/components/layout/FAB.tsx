import { Plus } from "lucide-react";
import { useLayout } from "../../layouts/LayoutContext";

/* ─────────────────────────────────────────────
   FAB.tsx — Mobile Floating Action Button
   Sits center above the bottom nav.
   Rotates icon to ✕ when Quick Actions sheet is open.
───────────────────────────────────────────── */

export default function FAB() {
  const { quickActionsOpen, toggleQuickActions } = useLayout();

  return (
    <button
      onClick={toggleQuickActions}
      aria-label={quickActionsOpen ? "Close quick actions" : "Open quick actions"}
      className="absolute left-1/2 -translate-x-1/2 -translate-y-[22px] w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
      style={{
        background: quickActionsOpen ? "var(--expense)" : "var(--forest)",
        boxShadow: "var(--shadow-lg)",
        bottom: "calc(env(safe-area-inset-bottom))",
      }}
    >
      <Plus
        size={22}
        strokeWidth={2.5}
        color="white"
        style={{
          transform: quickActionsOpen ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}
      />
    </button>
  );
}