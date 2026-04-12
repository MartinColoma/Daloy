// services/currencyService.ts

// ─── Provider A: ExchangeRate-API ─────────────────────────────────────────────
// Uncomment to switch back. Requires VITE_EXCHANGE_RATE_API_KEY in .env
//
// const KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
//
// export async function getLatestRates(base = "PHP") {
//   const res = await fetch(`https://v6.exchangerate-api.com/v6/${KEY}/latest/${base}`);
//   const data = await res.json();
//   if (data.result !== "success") throw new Error(data["error-type"]);
//   return data.conversion_rates as Record<string, number>;
// }

// ─── Provider B: Frankfurter (active) ────────────────────────────────────────
// Free, no API key required, ~160 currencies, sourced from central banks.
// v2 response shape: Array<{ base, quote, rate, date }>
//
export async function getLatestRates(base = "PHP") {
  console.log(`[currencyService] Fetching rates with base: ${base}`);

  const res = await fetch(`https://api.frankfurter.dev/v2/rates?base=${base}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  console.log("[currencyService] Raw response:", data);

  // v2 returns an array — map to a flat { QUOTE: rate } record
  // Base currency itself is not included in the array, so we seed it as 1
  const rates: Record<string, number> = { [base]: 1 };
  for (const entry of data) {
    rates[entry.quote] = entry.rate;
  }

  console.log("[currencyService] Processed rates:", rates);

  if (Object.keys(rates).length <= 1) throw new Error("Empty rates response");

  return rates;
}