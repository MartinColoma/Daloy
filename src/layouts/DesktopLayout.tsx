import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopBar  from "../components/layout/TopBar";
import ModalManager from "../components/modals/ModalManager";

/* ─────────────────────────────────────────────
   DesktopLayout.tsx
   Full-height shell: Sidebar (left) + main column.
   Main column: TopBar (top) + scrollable content.
   Rendered by RootLayout when window ≥ 1024px.
───────────────────────────────────────────── */

export default function DesktopLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
      <ModalManager />  
    </div>
  );
}