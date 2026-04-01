// ============================================================
// services/homeService.ts
// API calls for the /home dashboard — fully typed.
// ============================================================

import apiClient from "./apiClient";
import type {
  HomeSummaryResponse,
  RecentTransactionsResponse,
  BudgetSnapshotResponse,
  HomeWalletsResponse,
} from "../types/home.types";

// ── GET /home/wallets ────────────────────────────────────────
export async function fetchHomeWallets(): Promise<HomeWalletsResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: HomeWalletsResponse }>(
    "api/home/wallets",
  );
  return data.data;
}

// ── GET /home/summary ────────────────────────────────────────
export async function fetchHomeSummary(): Promise<HomeSummaryResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: HomeSummaryResponse }>(
    "api/home/summary",
  );
  return data.data;
}

// ── GET /home/recent-transactions ───────────────────────────
export async function fetchRecentTransactions(limit = 10): Promise<RecentTransactionsResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: RecentTransactionsResponse }>(
    `api/home/recent-transactions?limit=${limit}`,
  );
  return data.data;
}

// ── GET /home/budget-snapshot ────────────────────────────────
export async function fetchBudgetSnapshot(): Promise<BudgetSnapshotResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: BudgetSnapshotResponse }>(
    "api/home/budget-snapshot",
  );
  return data.data;
}