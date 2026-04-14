// ============================================================
// services/quickActionsService.ts
// API calls for Quick Actions modals — fully typed.
// ============================================================

import apiClient from "../apiClient";
import type {
  AddExpenseOptionsResponse,
  CreateExpenseRequest,
  CreateExpenseResponse,
  CreateExpenseBulkResponse,
} from "../../types/home/quickActions.types";
import type {
  AddIncomeOptionsResponse,
  CreateIncomeRequest,
  CreateIncomeResponse,
  CreateIncomeBulkResponse,
} from "../../types/home/quickActions.types";

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

// ── POST /quick-actions/add-expense/bulk ────────────────────
export async function createExpenseBulk(
  payload: CreateExpenseRequest[],
): Promise<CreateExpenseBulkResponse> {
  const { data } = await apiClient.post<{ success: boolean; data: CreateExpenseBulkResponse }>(
    "api/quick-actions/add-expense/bulk",
    { items: payload },
  );
  return data.data;
}

// ── GET /quick-actions/log-income/options ────────────────────
export async function fetchAddIncomeOptions(): Promise<AddIncomeOptionsResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: AddIncomeOptionsResponse }>(
    "api/quick-actions/log-income/options",
  );
  return data.data;
}

// ── POST /quick-actions/log-income ───────────────────────────
export async function createIncome(
  payload: CreateIncomeRequest,
): Promise<CreateIncomeResponse> {
  const { data } = await apiClient.post<{ success: boolean; data: CreateIncomeResponse }>(
    "api/quick-actions/log-income",
    payload,
  );
  return data.data;
}

// ── POST /quick-actions/log-income/bulk ─────────────────────
export async function createIncomeBulk(
  payload: CreateIncomeRequest[],
): Promise<CreateIncomeBulkResponse> {
  const { data } = await apiClient.post<{ success: boolean; data: CreateIncomeBulkResponse }>(
    "api/quick-actions/log-income/bulk",
    { items: payload },
  );
  return data.data;
}