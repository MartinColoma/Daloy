// ============================================================
// hooks/useLogIncome.ts
// ============================================================

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAddIncomeOptions, createIncome } from "../../services/quickActions/quickActionsService";
import { useExchangeRates } from "../../hooks/currency/useExchangeRates";
import { useCurrency } from "../../hooks/currency/useCurrency";
import { parseCurrencyInput } from "../../lib/currencyUtils";
import type { CreateIncomeRequest } from "../../types/home/quickActions.types";

// ── Form state shape ──────────────────────────────────────────
export interface LogIncomeForm {
  amount:      string;
  description: string;
  walletId:    string;
  categoryId:  string;
  date:        string;
  isRecurring: boolean;
  currency:    string;
}

const defaultForm = (): LogIncomeForm => ({
  amount:      "",
  description: "",
  walletId:    "",
  categoryId:  "",
  date:        new Date().toISOString().split("T")[0],
  isRecurring: false,
  currency:    "PHP",
});

// ── Hook ──────────────────────────────────────────────────────
export function useLogIncome(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { currency: baseCurrency }  = useCurrency();

  const [form, setForm] = useState<LogIncomeForm>(defaultForm);

  const optionsQuery = useQuery({
    queryKey: ["income-options"],
    queryFn:  fetchAddIncomeOptions,
    staleTime: 1000 * 60 * 5,
  });

  const options = optionsQuery.data;

  // Seed walletId + categoryId once — only when options first arrive and form is still blank
  useEffect(() => {
    if (!options) return;
    setForm(f => ({
      ...f,
      walletId:   f.walletId   || options.wallets[0]?.id    || "",
      categoryId: f.categoryId || options.categories[0]?.id || "",
    }));
  }, [options]);

  // Exchange rates — only fetch when input currency differs from base
  const needsConversion = form.currency !== baseCurrency;
  const ratesQuery = useExchangeRates(needsConversion ? form.currency : undefined);

  // Derived: rate and converted preview amount
  const exchangeRate: number = (() => {
    if (!needsConversion) return 1;
    const rates = ratesQuery.data;
    if (!rates) return 1;
    // rates are keyed as { [quote]: rate } where 1 form.currency = rate baseCurrency
    return rates[baseCurrency] ?? 1;
  })();

  const rawAmount       = parseCurrencyInput(form.amount);
  const convertedAmount = rawAmount * exchangeRate;

  // Mutation
  const mutation = useMutation({
    mutationFn: (payload: CreateIncomeRequest) => createIncome(payload),
    onSuccess: () => {
      // Invalidate anything that depends on transactions or wallet balances
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["net-worth"] });
      setForm(defaultForm());
      onSuccess?.();
    },
  });

  // Submit — assembles the full payload expected by the BE
  function submit() {
    if (!rawAmount || !form.walletId || !form.categoryId) return;

    const payload: CreateIncomeRequest = {
      wallet_id:         form.walletId,
      category_id:       form.categoryId,
      amount:            convertedAmount,          // base currency amount
      original_amount:   rawAmount,                // what the user typed
      original_currency: form.currency,
      exchange_rate:     exchangeRate,
      description:       form.description || undefined,
      transacted_at:     new Date(form.date).toISOString(),
      is_recurring:      form.isRecurring,
      recurring_id:      null,
    };

    mutation.mutate(payload);
  }

  function setField<K extends keyof LogIncomeForm>(key: K, value: LogIncomeForm[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  const isValid = rawAmount > 0 && !!form.walletId && !!form.categoryId;

  return {
    form,
    setField,
    // Options
    categories:      options?.categories ?? [],
    wallets:         options?.wallets    ?? [],
    optionsLoading:  optionsQuery.isLoading,
    // Currency / exchange
    baseCurrency,
    exchangeRate,
    convertedAmount,
    needsConversion,
    ratesLoading:    needsConversion && ratesQuery.isFetching,
    // Submit
    submit,
    isValid,
    isSubmitting:    mutation.isPending,
    isError:         mutation.isError,
    error:           mutation.error,
    reset:           () => setForm(defaultForm()),
  };
}