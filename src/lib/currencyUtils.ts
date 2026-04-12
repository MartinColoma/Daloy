// ============================================================
// Daloy — Currency Formatting Utility
// src/lib/currencyUtils.ts
// ============================================================

/**
 * Format a numeric amount as a currency string using the user's base currency.
 * Always use this — never call Intl.NumberFormat directly in components.
 *
 * @param amount   - The numeric value to format (in base currency units)
 * @param currency - ISO 4217 currency code, e.g. "PHP", "USD", "JPY"
 * @param opts.compact  - Use compact notation (e.g. ₱1.2K instead of ₱1,200)
 * @param opts.showSign - Prefix with + or − based on sign (for income/expense display)
 */
export function formatCurrency(
  amount: number,
  currency: string,
  opts?: { compact?: boolean; showSign?: boolean }
): string {
  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: opts?.compact ? "compact" : "standard",
  }).format(Math.abs(amount));

  if (opts?.showSign && amount !== 0) {
    return `${amount > 0 ? "+" : "−"}${formatted}`;
  }

  return formatted;
}

/**
 * Extract just the currency symbol for a given ISO 4217 code.
 * e.g. "PHP" → "₱", "USD" → "$", "EUR" → "€"
 *
 * Falls back to the currency code itself if the symbol cannot be resolved.
 */
export function getCurrencySymbol(currency: string): string {
  return (
    new Intl.NumberFormat("en-PH", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}

/**
 * Format a compact balance for tight spaces (wallet chips, summary bars).
 * e.g. 125000 → "₱125K", 1200000 → "₱1.2M"
 */
export function formatCompact(amount: number, currency: string): string {
  return formatCurrency(amount, currency, { compact: true });
}

/**
 * Format a signed amount — used in transaction lists and history items.
 * Income is positive (+), expenses are negative (−).
 * e.g. 3500  → "+₱3,500.00"
 *      -1200 → "−₱1,200.00"
 */
export function formatSigned(amount: number, currency: string): string {
  return formatCurrency(amount, currency, { showSign: true });
}

/**
 * Parse a raw numeric string into a float, safe for display purposes.
 * Never use for arithmetic — always keep amounts as numbers from the API.
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}