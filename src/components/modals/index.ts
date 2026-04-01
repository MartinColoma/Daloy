/* ─────────────────────────────────────────────
   modals/index.ts — barrel export
   Usage:
     import { AddExpenseModal, TransferModal, ... } from "@/modals";
───────────────────────────────────────────── */

export { default as ModalShell }           from "./ModalShell";
export { default as AddExpenseModal }      from "./AddExpenseModal";
export { default as LogIncomeModal }       from "./LogIncomeModal";
export { default as TransferModal }        from "./TransferModal";
export { default as GroupExpenseModal }    from "./GroupExpenseModal";
export { default as ConvertCurrencyModal } from "./ConvertCurrencyModal";
export { default as SettleUpModal }        from "./SettleUpModal";
export { default as BudgetLimitsModal }    from "./BudgetLimitsModal";