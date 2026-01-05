/**
 * Hook for fetching and caching ADA fiat prices.
 * Uses React Query for automatic caching and refetching.
 */

import { useQuery } from '@tanstack/react-query';
import { getAdaPrice, type AdaPrices } from '../defi/aggregator-api';
import { useSettingsStore, type CurrencyDisplay } from '../stores/settings';

// Re-export for convenience
export type { AdaPrices };

/** Query key for fiat prices */
const FIAT_PRICE_QUERY_KEY = ['ada-fiat-price'];

/** Refetch interval: 60 seconds */
const REFETCH_INTERVAL_MS = 60_000;

/**
 * Fetches and caches ADA fiat prices.
 * Only fetches when a fiat currency is selected (not ADA).
 */
export function useFiatPrice() {
  const currencyDisplay = useSettingsStore((state) => state.currencyDisplay);

  const query = useQuery({
    queryKey: FIAT_PRICE_QUERY_KEY,
    queryFn: async (): Promise<AdaPrices> => {
      const prices = await getAdaPrice();
      if (!prices) {
        throw new Error('Failed to fetch fiat prices');
      }
      return prices;
    },
    // Only fetch when fiat is selected
    enabled: currencyDisplay !== 'ADA',
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: 2,
  });

  return {
    prices: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Formats an ADA amount to the user's selected currency.
 * Returns formatted string with currency symbol.
 *
 * @param adaAmount - The amount in ADA
 * @param currency - The target currency display setting
 * @param prices - The current fiat prices (from useFiatPrice hook)
 * @param hideBalance - If true, returns masked value
 * @returns Formatted currency string (e.g., "$123.45" or "€99.00")
 */
export function formatFiatValue(
  adaAmount: number,
  currency: CurrencyDisplay,
  prices: AdaPrices | undefined,
  hideBalance = false
): string {
  if (hideBalance) {
    return '****';
  }

  if (currency === 'ADA') {
    return `${adaAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ADA`;
  }

  if (!prices) {
    return '---';
  }

  let rate: number;
  let symbol: string;
  switch (currency) {
    case 'USD':
      rate = prices.usd;
      symbol = '$';
      break;
    case 'EUR':
      rate = prices.eur;
      symbol = '€';
      break;
    case 'GBP':
      rate = prices.gbp;
      symbol = '£';
      break;
    default:
      return '---';
  }

  const fiatValue = adaAmount * rate;
  return `${symbol}${fiatValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Returns currency symbol for display.
 */
export function getCurrencySymbol(currency: CurrencyDisplay): string {
  switch (currency) {
    case 'ADA':
      return '₳';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
  }
}
