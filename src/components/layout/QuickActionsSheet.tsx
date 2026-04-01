import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Users,
  RefreshCw,
  Handshake,
  SlidersHorizontal,
} from "lucide-react";
import { useLayout, type ModalName } from "../../layouts/LayoutContext";

/* ─────────────────────────────────────────────
   QuickActionsSheet.tsx
   7-item action grid rendered inside BottomSheet
   when the FAB is tapped on mobile.
───────────────────────────────────────────── */

interface Action {
  label:   string;
  icon:    React.ElementType;
  modal:   ModalName;
  color:   string;
  bg:      string;
}

const ACTIONS: Action[] = [
  { label: "Add Expense",      icon: TrendingDown,      modal: "add-expense",      color: "var(--expense)", bg: "#FBF0F0"           },
  { label: "Log Income",       icon: TrendingUp,        modal: "log-income",       color: "var(--income)",  bg: "var(--forest-bg)"  },
  { label: "Transfer",         icon: ArrowLeftRight,    modal: "transfer",         color: "var(--steel)",   bg: "var(--steel-bg)"   },
  { label: "Group Expense",    icon: Users,             modal: "group-expense",    color: "var(--steel-m)", bg: "var(--steel-bg)"   },
  { label: "Convert Currency", icon: RefreshCw,         modal: "convert-currency", color: "var(--gold)",    bg: "var(--gold-bg)"    },
  { label: "Settle Up",        icon: Handshake,         modal: "settle-up",        color: "var(--income)",  bg: "var(--forest-bg)"  },
  { label: "Budget Limits",    icon: SlidersHorizontal, modal: "budget-limits",    color: "var(--ink2)",    bg: "var(--bg3)"        },
];

export default function QuickActionsSheet() {
  const { openModal, closeQuickActions } = useLayout();

  function handleAction(modal: ModalName) {
    closeQuickActions();
    openModal(modal);
  }

  return (
    <div className="px-5 pt-3 pb-6">
      <p
        className="font-mono text-[0.65rem] tracking-[0.16em] uppercase mb-4"
        style={{ color: "var(--ink4)" }}
      >
        Quick Actions
      </p>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(({ label, icon: Icon, modal, color, bg }) => (
          <button
            key={modal}
            onClick={() => handleAction(modal)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center transition-transform group-active:scale-95"
              style={{ background: bg }}
            >
              <Icon size={20} strokeWidth={1.8} style={{ color }} />
            </div>
            <span
              className="font-outfit font-medium text-[0.65rem] text-center leading-tight"
              style={{ color: "var(--ink3)" }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}