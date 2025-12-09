/**
 * DeFi Aggregator Constants
 * Configuration, DEX info, and common tokens.
 */

import type { DEXProtocol, Token } from './types';

/**
 * API and behavior configuration.
 */
export const DEFI_CONFIG = {
  /** Minswap Aggregator API base URL */
  AGGREGATOR_BASE_URL: 'https://agg-api.minswap.org/aggregator',

  /** Default slippage tolerance (0.5%) */
  DEFAULT_SLIPPAGE_PERCENT: 0.5,

  /** How long a quote is valid (30 seconds) */
  QUOTE_VALIDITY_MS: 30_000,

  /** Minimum time between API requests (2 seconds - be polite to free API) */
  MIN_REQUEST_INTERVAL_MS: 2000,

  /** Maximum requests per minute (be respectful) */
  MAX_REQUESTS_PER_MINUTE: 30,

  /** Maximum token pairs in watchlist */
  MAX_WATCHLIST_PAIRS: 10,

  /** Debounce delay for token search (300ms) */
  TOKEN_SEARCH_DEBOUNCE_MS: 300,

  /** Token list cache TTL (5 minutes) */
  TOKEN_CACHE_TTL_MS: 5 * 60 * 1000,

  /** Price cache TTL (30 seconds) */
  PRICE_CACHE_TTL_MS: 30_000,

  /** Default input amount for comparison (100 ADA in lovelace) */
  DEFAULT_COMPARE_AMOUNT: '100000000',

  /** Multiplier for BigInt percentage calculations (10000 = 2 decimal precision) */
  PERCENT_BIGINT_MULTIPLIER: BigInt(10000),
} as const;

/**
 * DEX display information and colors.
 */
export const DEX_INFO: Record<DEXProtocol, { name: string; shortName: string; color: string }> = {
  Minswap: { name: 'Minswap V1', shortName: 'MIN V1', color: '#3B82F6' },
  MinswapV2: { name: 'Minswap V2', shortName: 'MIN', color: '#3B82F6' },
  MinswapStable: { name: 'Minswap Stable', shortName: 'MIN-S', color: '#60A5FA' },
  SundaeSwap: { name: 'SundaeSwap V1', shortName: 'SUN V1', color: '#8B5CF6' },
  SundaeSwapV3: { name: 'SundaeSwap V3', shortName: 'SUN', color: '#8B5CF6' },
  WingRiders: { name: 'WingRiders V1', shortName: 'WR V1', color: '#10B981' },
  WingRidersV2: { name: 'WingRiders V2', shortName: 'WR', color: '#10B981' },
  WingRidersStable: { name: 'WingRiders Stable', shortName: 'WR-S', color: '#34D399' },
  Spectrum: { name: 'Spectrum', shortName: 'SPEC', color: '#F59E0B' },
  VyFinance: { name: 'VyFinance', shortName: 'VY', color: '#EC4899' },
  MuesliSwap: { name: 'MuesliSwap', shortName: 'MUSL', color: '#92400E' },
  Splash: { name: 'Splash', shortName: 'SPSH', color: '#06B6D4' },
  SplashStable: { name: 'Splash Stable', shortName: 'SPSH-S', color: '#22D3EE' },
};

/**
 * DEX URLs for external swap execution.
 */
export const DEX_SWAP_URLS: Partial<Record<DEXProtocol, (tokenIn: string, tokenOut: string) => string>> = {
  MinswapV2: (tIn, tOut) =>
    `https://app.minswap.org/swap?currencySymbolA=${tIn}&currencySymbolB=${tOut}`,
  SundaeSwapV3: () =>
    'https://app.sundaeswap.finance/swap',
  WingRidersV2: () =>
    'https://app.wingriders.com/swap',
  Spectrum: () =>
    'https://app.spectrum.fi/cardano/swap',
  VyFinance: () =>
    'https://app.vyfi.io/dex',
  MuesliSwap: () =>
    'https://muesliswap.com/swap',
};

/**
 * ADA token constant.
 */
export const ADA_TOKEN: Token = {
  id: 'lovelace',
  ticker: 'ADA',
  name: 'Cardano',
  decimals: 6,
  logo: null,
  verified: true,
  priceInAda: 1, // ADA is always 1 ADA
};

/**
 * Common tokens for quick access.
 * Token IDs are concatenated policyId + assetName (no separator).
 * Source: Minswap Aggregator API /tokens endpoint
 */
export const COMMON_TOKENS: Token[] = [
  ADA_TOKEN,
  {
    // MIN token - from Minswap API
    id: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
    ticker: 'MIN',
    name: 'Minswap',
    decimals: 6,
    logo: 'https://asset-logos.minswap.org/29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
    verified: true,
    priceInAda: null,
  },
  {
    // SUNDAE token
    id: '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d7753554e444145',
    ticker: 'SUNDAE',
    name: 'SundaeSwap',
    decimals: 6,
    logo: null,
    verified: true,
    priceInAda: null,
  },
  {
    // WRT token (WingRiders)
    id: 'c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d507357696e67526964657273',
    ticker: 'WRT',
    name: 'WingRiders',
    decimals: 6,
    logo: null,
    verified: true,
    priceInAda: null,
  },
  {
    // DJED stablecoin
    id: '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
    ticker: 'DJED',
    name: 'Djed',
    decimals: 6,
    logo: null,
    verified: true,
    priceInAda: null,
  },
  {
    // iUSD (Indigo)
    id: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344',
    ticker: 'iUSD',
    name: 'Indigo USD',
    decimals: 6,
    logo: null,
    verified: true,
    priceInAda: null,
  },
];

/**
 * Primary DEXes to query for comparison (most liquid, active).
 */
export const PRIMARY_DEXES: DEXProtocol[] = [
  'MinswapV2',
  'SundaeSwapV3',
  'WingRidersV2',
  'Spectrum',
  'VyFinance',
  'MuesliSwap',
];

/**
 * Format amount from smallest unit to display value.
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  if (fraction === BigInt(0)) {
    return whole.toLocaleString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  // Trim trailing zeros, keep up to 4 decimal places
  const trimmed = fractionStr.slice(0, 4).replace(/0+$/, '');

  if (trimmed === '') {
    return whole.toLocaleString();
  }

  return `${whole.toLocaleString()}.${trimmed}`;
}

/**
 * Parse display value to smallest unit.
 */
export function parseTokenAmount(displayValue: string, decimals: number): string {
  const cleanValue = displayValue.replace(/,/g, '');
  const [whole, fraction = ''] = cleanValue.split('.');

  const paddedFraction = fraction.slice(0, decimals).padEnd(decimals, '0');
  const combined = whole + paddedFraction;

  // Remove leading zeros but keep at least one digit
  return combined.replace(/^0+/, '') || '0';
}
