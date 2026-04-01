import { createContext, useContext, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   LayoutContext.tsx
   Provides page-level controls to any child
   component without prop drilling:
     · setPageTitle   → updates TopBar title
     · openModal      → triggers any named modal
     · openQuickActions → opens the mobile FAB sheet
───────────────────────────────────────────── */

export type ModalName =
  | "add-expense"
  | "log-income"
  | "transfer"
  | "group-expense"
  | "convert-currency"
  | "settle-up"
  | "budget-limits";

interface LayoutContextValue {
  pageTitle: string;
  setPageTitle: (title: string) => void;

  activeModal: ModalName | null;
  openModal: (modal: ModalName) => void;
  closeModal: () => void;

  quickActionsOpen: boolean;
  openQuickActions: () => void;
  closeQuickActions: () => void;
  toggleQuickActions: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [pageTitle, setPageTitle]           = useState("Home");
  const [activeModal, setActiveModal]       = useState<ModalName | null>(null);
  const [quickActionsOpen, setQuickActions] = useState(false);

  const openModal          = useCallback((modal: ModalName) => setActiveModal(modal), []);
  const closeModal         = useCallback(() => setActiveModal(null), []);
  const openQuickActions   = useCallback(() => setQuickActions(true), []);
  const closeQuickActions  = useCallback(() => setQuickActions(false), []);
  const toggleQuickActions = useCallback(() => setQuickActions(p => !p), []);

  return (
    <LayoutContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        activeModal,
        openModal,
        closeModal,
        quickActionsOpen,
        openQuickActions,
        closeQuickActions,
        toggleQuickActions,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside LayoutProvider");
  return ctx;
}