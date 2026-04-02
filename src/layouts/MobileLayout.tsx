import { Outlet } from "react-router-dom";
import BottomNav        from "../components/layout/BottomNav";
import FAB              from "../components/layout/FAB";
import BottomSheet      from "../components/layout/BottomSheet";
import QuickActionsSheet from "../components/layout/QuickActionsSheet";
import { useLayout }    from "./LayoutContext";
import ModalManager from "../components/modals/ModalManager";

export default function MobileLayout() {
  const { quickActionsOpen, closeQuickActions } = useLayout();

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Scrollable page content — px-4 gives all pages consistent side padding */}
      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <Outlet />
      </main>

      {/* Bottom nav + FAB */}
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