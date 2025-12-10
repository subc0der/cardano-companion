/**
 * Minswap Aggregator API Client
 * Fetches swap quotes, token data, and price information.
 * API Docs: https://docs.minswap.org/developer/aggregator-api
 */

import type {
  Token,
  SwapQuote,
  SwapRoute,
  DEXProtocol,
  TokenSearchResult,
  EstimateRequest,
} from './types';
import { DEFI_CONFIG, ADA_TOKEN } from './constants';

const BASE_URL = DEFI_CONFIG.AGGREGATOR_BASE_URL;

/**
 * Simple in-memory cache for API responses.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Rate limiting state.
 */
let lastRequestTime = 0;

async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < DEFI_CONFIG.MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, DEFI_CONFIG.MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
  return fetch(url, options);
}

/**
 * Get current ADA price in USD.
 * GET /ada-price?currency=usd
 */
export async function getAdaPrice(): Promise<{ usd: number; eur: number } | null> {
  const cacheKey = 'ada-price';
  const cached = getCached<{ usd: number; eur: number }>(cacheKey);
  if (cached) return cached;

  try {
    // API requires currency parameter
    const response = await rateLimitedFetch(`${BASE_URL}/ada-price?currency=usd`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ADA price: ${response.status}`);
    }

    const data = await response.json();
    // Response format: { currency: "usd", value: { price: 0.75, change_24h: -2.34 } }
    const result = {
      usd: data.value?.price || data.price || 0,
      eur: 0, // Would need separate call for EUR
    };

    setCache(cacheKey, result, DEFI_CONFIG.PRICE_CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error('[DeFi] Failed to fetch ADA price:', error);
    return null;
  }
}

/**
 * Search for tokens by name, ticker, or policy ID.
 * POST /tokens
 */
export async function searchTokens(
  query: string,
  options: { verified?: boolean; limit?: number } = {}
): Promise<TokenSearchResult> {
  const { verified = true } = options;

  const cacheKey = `tokens-${query}-${verified}`;
  const cached = getCached<TokenSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    // API format: { query, only_verified }
    const response = await rateLimitedFetch(`${BASE_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        only_verified: verified,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to search tokens: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Minswap API returns: { tokens: [...], search_after: [] }
    const rawTokens = data.tokens || [];
    const tokenArray = Array.isArray(rawTokens) ? rawTokens : [];

    const tokens: Token[] = tokenArray.map((t: Record<string, unknown>) => ({
      id: (t.token_id || t.id) as string,
      ticker: (t.ticker || 'UNKNOWN') as string,
      name: (t.project_name || t.name || t.ticker || 'Unknown Token') as string,
      decimals: (t.decimals as number) || 0,
      logo: (t.logo as string) || null,
      verified: (t.is_verified || false) as boolean,
      priceInAda: (t.price_by_ada as number) || null,
    }));

    const result: TokenSearchResult = {
      tokens,
      hasMore: tokenArray.length >= 20,
      total: data.total || tokenArray.length,
    };

    setCache(cacheKey, result, DEFI_CONFIG.TOKEN_CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error('[DeFi] Failed to search tokens:', error);
    return { tokens: [], hasMore: false, total: 0 };
  }
}

/**
 * Get a swap estimate from the aggregator.
 * POST /estimate
 *
 * API expects:
 * - amount: Input token amount (string)
 * - token_in: Input token ID ("lovelace" for ADA)
 * - token_out: Output token ID
 * - slippage: Maximum slippage percentage (number)
 * - amount_in_decimal: Whether amount is in decimal format (boolean)
 */
export async function getSwapEstimate(request: EstimateRequest): Promise<SwapQuote> {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    slippageTolerance = DEFI_CONFIG.DEFAULT_SLIPPAGE_PERCENT,
  } = request;

  const cacheKey = `estimate-${tokenIn}-${tokenOut}-${amountIn}`;
  const cached = getCached<SwapQuote>(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached;

  // Build request body per API docs
  const requestBody = {
    amount: amountIn,
    token_in: tokenIn,
    token_out: tokenOut,
    slippage: slippageTolerance,
    amount_in_decimal: false, // We're using smallest units (lovelace)
    allow_multi_hops: true,
  };

  const response = await rateLimitedFetch(`${BASE_URL}/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Swap estimate failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Parse response per Minswap API structure:
  // { token_in, token_out, amount_in, amount_out, min_amount_out, total_lp_fee, total_dex_fee,
  //   deposits, avg_price_impact, paths: [[{...step}]] }
  const amountOut = (data.amount_out || '0') as string;
  const priceImpact = (data.avg_price_impact || 0) as number;
  const totalFee = String(
    Number(data.total_lp_fee || 0) + Number(data.total_dex_fee || 0)
  );

  // Extract routes from paths - paths is array of arrays (multi-path routing)
  const routes: SwapRoute[] = [];
  const paths = (data.paths || []) as Array<Array<Record<string, unknown>>>;

  for (const path of paths) {
    for (const step of path) {
      routes.push({
        protocol: (step.protocol || 'Minswap') as DEXProtocol,
        poolId: (step.pool_id || '') as string,
        tokenIn: (step.token_in || tokenIn) as string,
        tokenOut: (step.token_out || tokenOut) as string,
        amountIn: (step.amount_in || amountIn) as string,
        amountOut: (step.amount_out || amountOut) as string,
        fee: String(Number(step.lp_fee || 0) + Number(step.dex_fee || 0)),
      });
    }
  }

  // Determine best protocol from first route
  const bestProtocol = routes[0]?.protocol || 'Minswap';

  // Get token info
  const tokenInInfo = tokenIn === 'lovelace' ? ADA_TOKEN : await getTokenInfo(tokenIn);
  const tokenOutInfo = tokenOut === 'lovelace' ? ADA_TOKEN : await getTokenInfo(tokenOut);

  const quote: SwapQuote = {
    tokenIn: tokenInInfo,
    tokenOut: tokenOutInfo,
    amountIn,
    amountOut,
    priceImpact,
    routes: routes.length > 0 ? routes : [{
      protocol: bestProtocol,
      poolId: '',
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      fee: totalFee,
    }],
    totalFee,
    bestProtocol,
    expiresAt: Date.now() + DEFI_CONFIG.QUOTE_VALIDITY_MS,
  };

  setCache(cacheKey, quote, DEFI_CONFIG.QUOTE_VALIDITY_MS);
  return quote;
}

/**
 * Get token info by ID.
 */
async function getTokenInfo(tokenId: string): Promise<Token> {
  const cacheKey = `token-${tokenId}`;
  const cached = getCached<Token>(cacheKey);
  if (cached) return cached;

  try {
    const result = await searchTokens(tokenId, { limit: 1 });
    if (result.tokens.length > 0) {
      setCache(cacheKey, result.tokens[0], DEFI_CONFIG.TOKEN_CACHE_TTL_MS);
      return result.tokens[0];
    }
  } catch (error) {
    console.error('[DeFi] Failed to get token info:', error);
    // Fall through to default
  }

  // Return a default token object
  // The asset name portion of token IDs is hex-encoded - try to decode it
  let ticker = 'UNKNOWN';
  if (tokenId.length > 56) {
    // Token ID format: policyId (56 chars) + assetName (hex)
    const assetNameHex = tokenId.slice(56);
    try {
      // Validate hex string has even length (each byte = 2 hex chars)
      if (assetNameHex.length % 2 !== 0) {
        throw new Error('Asset name hex length is not even');
      }
      // Decode hex to ASCII
      let decoded = '';
      for (let i = 0; i < assetNameHex.length; i += 2) {
        const charCode = parseInt(assetNameHex.slice(i, i + 2), 16);
        // Only include printable ASCII characters
        if (charCode >= 32 && charCode <= 126) {
          decoded += String.fromCharCode(charCode);
        }
      }
      if (decoded.length > 0) {
        ticker = decoded.slice(0, 10).toUpperCase();
      } else {
        // No printable chars - use truncated ID
        ticker = tokenId.slice(-6).toUpperCase();
      }
    } catch {
      // Fall back to truncated ID
      ticker = tokenId.slice(-6).toUpperCase();
    }
  }

  const defaultToken: Token = {
    id: tokenId,
    ticker,
    name: 'Unknown Token',
    decimals: 6, // Most Cardano tokens use 6 decimals
    logo: null,
    verified: false,
    priceInAda: null,
  };

  return defaultToken;
}

/**
 * Get quotes from a specific DEX only.
 * Note: The Minswap aggregator may not support per-DEX filtering directly.
 * This is a best-effort implementation.
 */
export async function getSwapEstimateFromDex(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  dex: DEXProtocol
): Promise<SwapQuote | null> {
  try {
    const quote = await getSwapEstimate({
      tokenIn,
      tokenOut,
      amountIn,
    });

    // Check if this DEX is in the route
    const matchesDex = quote.routes.some((r) => r.protocol === dex) || quote.bestProtocol === dex;

    if (matchesDex) {
      return { ...quote, bestProtocol: dex };
    }

    return null;
  } catch (error) {
    console.error(`[DeFi] Failed to get swap estimate from ${dex}:`, error);
    return null;
  }
}

/**
 * Compare quotes across multiple DEXes.
 * Since Minswap aggregator returns the best route, we return the aggregated result.
 */
export async function compareAllDexes(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  _dexes: DEXProtocol[]
): Promise<Map<DEXProtocol, SwapQuote | null>> {
  const results = new Map<DEXProtocol, SwapQuote | null>();

  try {
    // Get the best quote from aggregator
    const quote = await getSwapEstimate({
      tokenIn,
      tokenOut,
      amountIn,
    });

    // Add the best protocol result
    results.set(quote.bestProtocol, quote);

    // Add route protocols if different
    for (const route of quote.routes) {
      if (!results.has(route.protocol)) {
        results.set(route.protocol, quote);
      }
    }
  } catch (error) {
    console.error('[DeFi] Failed to compare DEXes:', error);
  }

  return results;
}

/**
 * Clear all cached data.
 */
export function clearCache(): void {
  cache.clear();
}
