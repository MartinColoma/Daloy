// hooks/useExchangeRates.ts
import { useQuery } from "@tanstack/react-query";
import { getLatestRates } from "../services/currency/currencyService";

export function useExchangeRates(base = "PHP") {
  return useQuery({
    queryKey: ["exchange-rates", base],
    queryFn: () => getLatestRates(base),
    staleTime: 1000 * 60 * 60,
  });
}