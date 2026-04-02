import { useLayout } from "../../layouts/LayoutContext";
import { useWalletStore } from "../../stores/walletStore";
import {
  AddExpenseModal,
  LogIncomeModal,
  TransferModal,
  GroupExpenseModal,
  ConvertCurrencyModal,
  SettleUpModal,
  BudgetLimitsModal,
  AddWalletModal,
} from ".";

/* ─────────────────────────────────────────────
   ModalManager.tsx
   Drop this once inside DesktopLayout.tsx and
   MobileLayout.tsx (or RootLayout), outside the
   main scroll area, so modals portal above everything.

   Usage:
     // In DesktopLayout.tsx or MobileLayout.tsx
     import ModalManager from "@/modals/ModalManager";
     ...
     return (
       <>
         <YourLayout />
         <ModalManager />
       </>
     );

   LayoutContext exposes:
     activeModal: ModalName | null
     openModal(name: ModalName): void
     closeModal(): void

   ModalName type (from LayoutContext.tsx):
     "add-expense" | "log-income" | "transfer" |
     "group-expense" | "convert-currency" |
     "settle-up" | "budget-limits"
───────────────────────────────────────────── */

export default function ModalManager() {
  const { activeModal, closeModal } = useLayout();
  const wallets = useWalletStore((s) => s.wallets);

  return (
    <>
      <AddExpenseModal
        isOpen={activeModal === "add-expense"}
        onClose={closeModal}
      />
      <LogIncomeModal
        isOpen={activeModal === "log-income"}
        onClose={closeModal}
      />
      <TransferModal
        isOpen={activeModal === "transfer"}
        onClose={closeModal}
        allWallets={wallets}
      />
      <GroupExpenseModal
        isOpen={activeModal === "group-expense"}
        onClose={closeModal}
      />
      <ConvertCurrencyModal
        isOpen={activeModal === "convert-currency"}
        onClose={closeModal}
      />
      <SettleUpModal
        isOpen={activeModal === "settle-up"}
        onClose={closeModal}
      />
      <BudgetLimitsModal
        isOpen={activeModal === "budget-limits"}
        onClose={closeModal}
      />
      <AddWalletModal
        isOpen={activeModal === "add-wallet"}
        onClose={closeModal}
      />
    </>
  );
}