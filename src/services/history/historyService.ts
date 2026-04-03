// ============================================================
// src/services/history/historyService.ts
// ============================================================

import apiClient from "../apiClient";
import type {
  HistoryTransactionItem,
  HistoryPeriodSummary,
  HistoryListResponse,
  HistoryQueryParams,
} from "../../types/index";

// ── Re-export for consumers that want to import from one place ──
export type {
  HistoryTransactionItem,
  HistoryPeriodSummary,
  HistoryListResponse,
  HistoryQueryParams,
};

function buildParams(q: HistoryQueryParams): Record<string, string> {
  const p: Record<string, string> = {};
  if (q.dateFrom)      p.dateFrom   = q.dateFrom;
  if (q.dateTo)        p.dateTo     = q.dateTo;
  if (q.type)          p.type       = q.type;
  if (q.walletId)      p.walletId   = q.walletId;
  if (q.categoryId)    p.categoryId = q.categoryId;
  if (q.search)        p.search     = q.search;
  if (q.page  != null) p.page       = String(q.page);
  if (q.limit != null) p.limit      = String(q.limit);
  return p;
}

export async function getHistory(
  params: HistoryQueryParams = {},
): Promise<HistoryListResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: HistoryListResponse }>(
    "/api/history",
    { params: buildParams(params) },
  );
  return data.data;
}

export async function getHistoryForDay(
  isoDate: string,
  extra: Omit<HistoryQueryParams, "dateFrom" | "dateTo"> = {},
): Promise<HistoryListResponse> {
  return getHistory({ ...extra, dateFrom: isoDate, dateTo: isoDate, limit: 500 });
}

export async function getHistoryForWeek(
  weekStart: string,
  extra: Omit<HistoryQueryParams, "dateFrom" | "dateTo"> = {},
): Promise<HistoryListResponse> {
  const start = new Date(weekStart + "T00:00:00");
  const end   = new Date(start);
  end.setDate(start.getDate() + 6);
  const dateTo = end.toISOString().slice(0, 10);
  return getHistory({ ...extra, dateFrom: weekStart, dateTo, limit: 500 });
}

export async function getHistoryForMonth(
  yearMonth: string,
  extra: Omit<HistoryQueryParams, "dateFrom" | "dateTo"> = {},
): Promise<HistoryListResponse> {
  const [y, m] = yearMonth.split("-").map(Number);
  const dateFrom = `${yearMonth}-01`;
  const lastDay  = new Date(y, m, 0).getDate();
  const dateTo   = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
  return getHistory({ ...extra, dateFrom, dateTo, limit: 500 });
}