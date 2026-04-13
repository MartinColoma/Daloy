// hooks/useExchangeRates.ts
import { useQuery } from "@tanstack/react-query";
import { getLatestRates } from "../services/currency/currencyService";

// hooks/useExchangeRates.ts
export function useExchangeRates(base?: string) {
  return useQuery({
    queryKey: ["exchange-rates", base],
    queryFn:  () => getLatestRates(base!),
    staleTime: 1000 * 60 * 60,
    enabled:  !!base,          
  })
}