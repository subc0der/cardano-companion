/**
 * DeFi Aggregator Module
 * Exports types, constants, and API functions.
 */

// Types
export type {
  DEXProtocol,
  Token,
  SwapRoute,
  SwapQuote,
  DEXComparison,
  LPPosition,
  TokenPair,
  TokenSearchResult,
  EstimateRequest,
  EstimateResponse,
} from './types';

// Constants
export {
  DEFI_CONFIG,
  DEX_INFO,
  DEX_SWAP_URLS,
  ADA_TOKEN,
  COMMON_TOKENS,
  PRIMARY_DEXES,
  formatTokenAmount,
  parseTokenAmount,
} from './constants';

// API
export {
  getAdaPrice,
  searchTokens,
  getSwapEstimate,
  getSwapEstimateFromDex,
  compareAllDexes,
  clearCache,
} from './aggregator-api';
