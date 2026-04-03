/**
 * dateUtils.ts — src/lib/dateUtils.ts
 *
 * All date/time formatting and UTC conversion helpers for Daloy.
 * Golden rule: DB always stores UTC. Convert to local ONLY at display time.
 *
 * Usage:
 *   import { formatDate, formatDateTime, toUTCString, getDayRangeUTC } from "../lib/dateUtils";
 */

// ── User's detected timezone ───────────────────────────────────────────────
// Resolved once at module load. Safe to use everywhere — browser always has this.
export const USER_TZ: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ── Core formatter ─────────────────────────────────────────────────────────
/**
 * Low-level formatter. Pass any valid Intl.DateTimeFormatOptions.
 * All other helpers below are wrappers around this.
 */
export function formatTZ(
  utcInput: string | Date,
  options: Intl.DateTimeFormatOptions,
  locale = "en-PH"
): string {
  const date = typeof utcInput === "string" ? new Date(utcInput) : utcInput;
  return new Intl.DateTimeFormat(locale, {
    timeZone: USER_TZ,
    ...options,
  }).format(date);
}

// ── Display helpers ────────────────────────────────────────────────────────

/** "Apr 3, 2026" */
export function formatDate(utcInput: string | Date): string {
  return formatTZ(utcInput, { month: "short", day: "numeric", year: "numeric" });
}

/** "Apr 3" — no year, for lists and charts */
export function formatDateShort(utcInput: string | Date): string {
  return formatTZ(utcInput, { month: "short", day: "numeric" });
}

/** "April 2026" — for monthly summaries */
export function formatMonthYear(utcInput: string | Date): string {
  return formatTZ(utcInput, { month: "long", year: "numeric" });
}

/** "Apr 2026" — compact month header */
export function formatMonthYearShort(utcInput: string | Date): string {
  return formatTZ(utcInput, { month: "short", year: "numeric" });
}

/** "3:45 PM" */
export function formatTime(utcInput: string | Date): string {
  return formatTZ(utcInput, { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "Apr 3, 2026 · 3:45 PM" — transaction detail view */
export function formatDateTime(utcInput: string | Date): string {
  const d = formatDate(utcInput);
  const t = formatTime(utcInput);
  return `${d} · ${t}`;
}

/** "Today", "Yesterday", or "Apr 3" — for transaction list group headers */
export function formatRelativeDay(utcInput: string | Date): string {
  const date  = typeof utcInput === "string" ? new Date(utcInput) : utcInput;

  // Get local "today" and "yesterday" as YYYY-MM-DD strings for comparison
  const todayStr     = formatTZ(new Date(), { year: "numeric", month: "2-digit", day: "2-digit" });
  const inputStr     = formatTZ(date,       { year: "numeric", month: "2-digit", day: "2-digit" });

  const todayDate    = new Date(todayStr);
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterdayStr = formatTZ(yesterdayDate, { year: "numeric", month: "2-digit", day: "2-digit" });

  if (inputStr === todayStr)     return "Today";
  if (inputStr === yesterdayStr) return "Yesterday";
  return formatDateShort(date);
}

// ── DB query helpers ───────────────────────────────────────────────────────

/**
 * Convert a local date string ("YYYY-MM-DD") to a UTC ISO string
 * representing the START of that day in the user's timezone.
 *
 * Use this as the `gte` filter when querying Supabase.
 *
 * Example (user in Asia/Manila, UTC+8):
 *   localDayStartUTC("2026-04-03") → "2026-04-02T16:00:00.000Z"
 */
export function localDayStartUTC(localDateStr: string): string {
  // Parse as local midnight by appending no timezone — JS treats this as local
  const localMidnight = new Date(`${localDateStr}T00:00:00`);
  return localMidnight.toISOString();
}

/**
 * Convert a local date string ("YYYY-MM-DD") to a UTC ISO string
 * representing the END of that day (23:59:59.999) in the user's timezone.
 *
 * Use this as the `lte` filter when querying Supabase.
 */
export function localDayEndUTC(localDateStr: string): string {
  const localEndOfDay = new Date(`${localDateStr}T23:59:59.999`);
  return localEndOfDay.toISOString();
}

/**
 * Get UTC start and end for a full local day.
 * Convenience wrapper — pass result directly to Supabase filters.
 *
 * Example:
 *   const { from, to } = getDayRangeUTC("2026-04-03");
 *   .gte("transacted_at", from).lte("transacted_at", to)
 */
export function getDayRangeUTC(localDateStr: string): { from: string; to: string } {
  return {
    from: localDayStartUTC(localDateStr),
    to:   localDayEndUTC(localDateStr),
  };
}

/**
 * Get UTC range for the current local month.
 * Used for monthly budget queries and insight summaries.
 *
 * Example (Asia/Manila, April 2026):
 *   { from: "2026-03-31T16:00:00.000Z", to: "2026-04-30T15:59:59.999Z" }
 */
export function getCurrentMonthRangeUTC(): { from: string; to: string } {
  // Use Intl to get local year and month reliably (avoids UTC drift)
  const localYear  = parseInt(formatTZ(new Date(), { year: "numeric" }), 10);
  const localMonth = parseInt(formatTZ(new Date(), { month: "numeric" }), 10); // 1-based

  const firstDay = `${localYear}-${String(localMonth).padStart(2, "0")}-01`;
  const lastDay  = new Date(localYear, localMonth, 0).getDate(); // 0th day of next month = last day of current
  const lastDayStr = `${localYear}-${String(localMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return {
    from: localDayStartUTC(firstDay),
    to:   localDayEndUTC(lastDayStr),
  };
}

/**
 * Get UTC range for a specific local month.
 *
 * @param year  — local year  (e.g. 2026)
 * @param month — local month, 1-based (e.g. 4 for April)
 */
export function getMonthRangeUTC(year: number, month: number): { from: string; to: string } {
  const firstDay   = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDayNum = new Date(year, month, 0).getDate();
  const lastDay    = `${year}-${String(month).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;

  return {
    from: localDayStartUTC(firstDay),
    to:   localDayEndUTC(lastDay),
  };
}

// ── Write helpers ──────────────────────────────────────────────────────────

/**
 * Get the current timestamp as a UTC ISO string for DB inserts.
 * Always use this instead of new Date().toLocaleString().
 *
 *   transacted_at: toUTCString()
 */
export function toUTCString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Convert a local datetime-local input value ("2026-04-03T15:30")
 * to a UTC ISO string for storing in Supabase.
 *
 * Use this when the user picks a custom transaction date/time.
 */
export function localInputToUTC(localDateTimeStr: string): string {
  // new Date("2026-04-03T15:30") is parsed as LOCAL time by the JS engine
  return new Date(localDateTimeStr).toISOString();
}