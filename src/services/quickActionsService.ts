// ============================================================
// services/quickActionsService.ts
// API calls for Quick Actions modals — fully typed.
// ============================================================

import apiClient from "./apiClient";
import type {
  AddExpenseOptionsResponse,
  CreateExpenseRequest,
  CreateExpenseResponse,
} from "../types/quickActions.types";

// ── GET /quick-actions/add-expense/options ───────────────────
export async function fetchAddExpenseOptions(): Promise<AddExpenseOptionsResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: AddExpenseOptionsResponse }>(
    "api/quick-actions/add-expense/options",
  );
  return data.data;
}

// ── POST /quick-actions/add-expense ─────────────────────────
export async function createExpense(
  payload: CreateExpenseRequest,
): Promise<CreateExpenseResponse> {
  const { data } = await apiClient.post<{ success: boolean; data: CreateExpenseResponse }>(
    "api/quick-actions/add-expense",
    payload,
  );
  return data.data;
}