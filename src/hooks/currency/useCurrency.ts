// src/hooks/useCurrency.ts
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, getCurrencySymbol } from '../../lib/currencyUtils';

export function useCurrency() {
  // baseCurrency is already on user — populated at login via /api/auth/signin or oauth/callback
  const currency = useAuthStore(s => s.user?.baseCurrency ?? 'PHP');

  return {
    currency,
    symbol: getCurrencySymbol(currency),
    format: (amount: number, opts?: { compact?: boolean; showSign?: boolean }) =>
      formatCurrency(amount, currency, opts),
    formatForeign: (amount: number, foreignCurrency: string, opts?: { compact?: boolean; showSign?: boolean }) =>
      formatCurrency(amount, foreignCurrency, opts),
  };
}