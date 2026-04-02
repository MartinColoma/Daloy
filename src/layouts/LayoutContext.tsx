import { createContext, useContext, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   LayoutContext.tsx
   Provides page-level controls to any child
   component without prop drilling:
     · setPageTitle          → updates TopBar title
     · openModal             → triggers any named modal
     · openQuickActions      → opens the mobile FAB sheet
     · setModalSuccessHandler → lets pages register a
                                callback to run after a
                                modal successfully saves
───────────────────────────────────────────── */

export type ModalName =
  | "add-expense"
  | "log-income"
  | "transfer"
  | "group-expense"
  | "convert-currency"
  | "settle-up"
  | "budget-limits"
  | "add-wallet";

interface LayoutContextValue {
  pageTitle:    string;
  setPageTitle: (title: string) => void;

  activeModal: ModalName | null;
  openModal:   (modal: ModalName) => void;
  closeModal:  () => void;

  quickActionsOpen:    boolean;
  openQuickActions:    () => void;
  closeQuickActions:   () => void;
  toggleQuickActions:  () => void;

  onModalSuccess:         (() => void) | null;
  setModalSuccessHandler: (fn: (() => void) | null) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [pageTitle,        setPageTitle]    = useState("Home");
  const [activeModal,      setActiveModal]  = useState<ModalName | null>(null);
  const [quickActionsOpen, setQuickActions] = useState(false);
  const [onModalSuccess,   setOnModalSuccess] = useState<(() => void) | null>(null);

  const openModal          = useCallback((modal: ModalName) => setActiveModal(modal), []);
  const closeModal         = useCallback(() => setActiveModal(null), []);
  const openQuickActions   = useCallback(() => setQuickActions(true), []);
  const closeQuickActions  = useCallback(() => setQuickActions(false), []);
  const toggleQuickActions = useCallback(() => setQuickActions(p => !p), []);

  // useState setter wraps functions in lazy-init — use the `() => fn` pattern
  // to store a function reference rather than calling it immediately.
  const setModalSuccessHandler = useCallback(
    (fn: (() => void) | null) => setOnModalSuccess(() => fn),
    [],
  );

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
        onModalSuccess,
        setModalSuccessHandler,
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