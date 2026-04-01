import { Outlet } from "react-router-dom";
import BottomNav        from "../components/layout/BottomNav";
import FAB              from "../components/layout/FAB";
import BottomSheet      from "../components/layout/BottomSheet";
import QuickActionsSheet from "../components/layout/QuickActionsSheet";
import { useLayout }    from "./LayoutContext";
import ModalManager from "../components/modals/ModalManager";

/* ─────────────────────────────────────────────
   MobileLayout.tsx
   Full-height shell: scrollable content + BottomNav.
   FAB floats center above BottomNav.
   Quick Actions sheet slides up on FAB tap.
   Rendered by RootLayout when window < 1024px.
───────────────────────────────────────────── */

export default function MobileLayout() {
  const { quickActionsOpen, closeQuickActions } = useLayout();

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Scrollable page content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom nav + FAB — relative so FAB can use absolute positioning */}
      <div className="relative shrink-0">
        <FAB />
        <BottomNav />
      </div>
      <ModalManager />  
      {/* Quick Actions bottom sheet */}
      <BottomSheet isOpen={quickActionsOpen} onClose={closeQuickActions}>
        <QuickActionsSheet />
      </BottomSheet>
    </div>
  );
}