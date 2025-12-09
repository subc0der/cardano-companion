/**
 * DeFi Aggregator Type Definitions
 * Types for DEX aggregation, token swaps, and LP tracking.
 */

/**
 * Supported DEX protocols on Cardano.
 * Maps to Minswap Aggregator API protocol names.
 */
export type DEXProtocol =
  | 'Minswap'
  | 'MinswapV2'
  | 'MinswapStable'
  | 'SundaeSwap'
  | 'SundaeSwapV3'
  | 'WingRiders'
  | 'WingRidersV2'
  | 'WingRidersStable'
  | 'Spectrum'
  | 'VyFinance'
  | 'MuesliSwap'
  | 'Splash'
  | 'SplashStable';

/**
 * Token information from aggregator API.
 */
export interface Token {
  /** Token ID: "lovelace" for ADA, or "policyId.assetName" */
  id: string;
  /** Short ticker symbol (e.g., "ADA", "MIN") */
  ticker: string;
  /** Full token name */
  name: string;
  /** Decimal places for display */
  decimals: number;
  /** Logo URL or null */
  logo: string | null;
  /** Whether token is verified by Minswap */
  verified: boolean;
  /** USD price if available */
  priceUsd: number | null;
}

/**
 * A single swap route through one DEX pool.
 */
export interface SwapRoute {
  /** Which DEX protocol */
  protocol: DEXProtocol;
  /** Pool identifier */
  poolId: string;
  /** Input token ID */
  tokenIn: string;
  /** Output token ID */
  tokenOut: string;
  /** Input amount (raw, smallest unit) */
  amountIn: string;
  /** Output amount (raw, smallest unit) */
  amountOut: string;
  /** Fee charged (in lovelace) */
  fee: string;
}

/**
 * Complete swap quote from aggregator.
 */
export interface SwapQuote {
  /** Input token */
  tokenIn: Token;
  /** Output token */
  tokenOut: Token;
  /** Input amount (raw) */
  amountIn: string;
  /** Output amount (raw) */
  amountOut: string;
  /** Price impact as decimal (0.01 = 1%) */
  priceImpact: number;
  /** Route(s) taken for the swap */
  routes: SwapRoute[];
  /** Total fee in lovelace */
  totalFee: string;
  /** Best DEX for this swap */
  bestProtocol: DEXProtocol;
  /** Timestamp when quote expires */
  expiresAt: number;
}

/**
 * Comparison of quotes across multiple DEXes.
 */
export interface DEXComparison {
  /** DEX protocol */
  protocol: DEXProtocol;
  /** Amount you'd receive */
  amountOut: string;
  /** Fee charged */
  fee: string;
  /** Price impact percentage */
  priceImpact: number;
  /** Whether this DEX has liquidity */
  available: boolean;
  /** Reason if unavailable */
  reason?: string;
  /** Is this the best rate? */
  isBest?: boolean;
}

/**
 * User's LP position in a DEX pool.
 */
export interface LPPosition {
  /** Pool identifier */
  poolId: string;
  /** Which DEX */
  dex: DEXProtocol;
  /** First token in pair */
  tokenA: Token;
  /** Second token in pair */
  tokenB: Token;
  /** Amount of LP tokens held */
  lpTokenAmount: string;
  /** Estimated value in ADA */
  estimatedValueAda: string;
  /** User's share of pool (0.0001 = 0.01%) */
  poolShare: number;
}

/**
 * Saved token pair for watchlist.
 */
export interface TokenPair {
  /** Unique ID for this pair */
  id: string;
  /** Input token */
  tokenIn: Token;
  /** Output token */
  tokenOut: Token;
  /** Last known exchange rate */
  lastRate: number | null;
  /** When rate was last fetched */
  lastUpdated: number | null;
  /** 24h price change percentage */
  priceChange24h: number | null;
}

/**
 * Search result from token search.
 */
export interface TokenSearchResult {
  tokens: Token[];
  hasMore: boolean;
  total: number;
}

/**
 * API request for swap estimate.
 */
export interface EstimateRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance?: number;
  excludedProtocols?: DEXProtocol[];
}

/**
 * API response for swap estimate.
 */
export interface EstimateResponse {
  amountOut: string;
  priceImpact: number;
  routes: SwapRoute[];
  aggregatedFee: string;
}
