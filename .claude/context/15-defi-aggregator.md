# DeFi Aggregator - Technical Design Document

## Overview

The **DeFi Aggregator** provides users with a unified view of Cardano DEX prices, swap route optimization, and liquidity pool tracking. This is a read-only analytics tool - actual swaps are executed through external DEX interfaces.

### Design Goals
1. **Best price discovery** - Compare rates across all major DEXes
2. **Transparency** - Show fees, slippage, and price impact clearly
3. **Educational** - Help users understand DEX mechanics
4. **Non-custodial** - We never touch user funds or build transactions

---

## Core Features

### 1. Token Price Comparison
Compare swap rates for any token pair across DEXes:
- Real-time price quotes from multiple DEXes
- Show price differences as percentages
- Highlight best rate with visual emphasis
- Include fee breakdown (DEX fee, network fee estimate)

### 2. Swap Route Visualization
For complex swaps (e.g., Token A → Token B with no direct pool):
- Show multi-hop routes (A → ADA → B)
- Compare single-hop vs multi-hop efficiency
- Display total slippage and price impact

### 3. Portfolio DeFi Positions
Track user's liquidity pool positions:
- LP token holdings from wallet
- Estimated value of LP positions
- Impermanent loss indicator (if data available)
- Pool APY/APR where available

### 4. Token Watchlist
Quick access to frequently checked tokens:
- Save favorite token pairs
- Price alerts (future enhancement)
- 24h price change indicators

---

## Supported DEXes

Based on Minswap Aggregator API support:

| DEX | Type | Priority |
|-----|------|----------|
| Minswap V2 | AMM | High |
| Minswap Stable | Stable swap | High |
| SundaeSwap V3 | AMM | High |
| WingRiders V2 | AMM | High |
| WingRiders Stable | Stable swap | Medium |
| Spectrum | AMM | Medium |
| VyFinance | AMM | Medium |
| MuesliSwap | Order book + AMM | Medium |
| Splash | AMM | Low |

---

## Data Sources

### Primary: Minswap Aggregator API

**Base URL**: `https://agg-api.minswap.org/aggregator`

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/ada-price` | Current ADA/USD price | GET |
| `/tokens` | Search/filter tokens | POST |
| `/estimate` | Get swap route + price | POST |
| `/wallet` | Wallet token balances | GET |

### Token Search Request
```typescript
POST /tokens
{
  "searchText": "MIN",      // Optional search term
  "page": 1,
  "limit": 20,
  "verified": true          // Only verified tokens
}
```

### Estimate Request
```typescript
POST /estimate
{
  "tokenIn": "lovelace",                    // ADA
  "tokenOut": "policy.assetName",           // Token ID
  "amountIn": "1000000000",                 // 1000 ADA in lovelace
  "slippageTolerance": 0.5,                 // 0.5%
  "excludedProtocols": []                   // Optional: skip certain DEXes
}
```

### Estimate Response
```typescript
{
  "amountOut": "1234567890",
  "priceImpact": 0.12,                      // 0.12%
  "routes": [
    {
      "protocol": "MinswapV2",
      "poolId": "...",
      "tokenIn": "lovelace",
      "tokenOut": "...",
      "amountIn": "1000000000",
      "amountOut": "1234567890",
      "fee": "3000000"                       // 0.3% fee in lovelace
    }
  ],
  "aggregatedFee": "3000000"
}
```

### Secondary: Blockfrost (for LP token detection)

| Endpoint | Purpose |
|----------|---------|
| `/addresses/{addr}/utxos` | Get LP tokens in wallet |
| `/assets/{asset}` | LP token metadata |

---

## Architecture

### Directory Structure

```
lib/
├── defi/
│   ├── types.ts              # TypeScript interfaces
│   ├── constants.ts          # DEX info, API config
│   ├── aggregator-api.ts     # Minswap aggregator client
│   ├── tokens.ts             # Token search/cache
│   ├── price-compare.ts      # Multi-DEX price comparison
│   └── lp-positions.ts       # LP token detection

components/
├── defi/
│   ├── SwapQuote.tsx         # Price comparison card
│   ├── TokenSelector.tsx     # Token search/select modal
│   ├── RouteVisualization.tsx# Swap route diagram
│   ├── DEXComparisonTable.tsx# Side-by-side DEX rates
│   ├── LPPositionCard.tsx    # Single LP position display
│   ├── TokenWatchlist.tsx    # Saved token pairs
│   └── index.ts              # Barrel export

app/
├── (tabs)/
│   └── defi.tsx              # New tab OR subtab under Tools
```

### Type Definitions

```typescript
// lib/defi/types.ts

export interface Token {
  id: string;                  // "lovelace" or "policyId.assetName"
  ticker: string;
  name: string;
  decimals: number;
  logo: string | null;
  verified: boolean;
  price: number | null;        // USD price
}

export interface SwapQuote {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;            // Raw amount (lovelace/smallest unit)
  amountOut: string;
  priceImpact: number;         // Percentage
  routes: SwapRoute[];
  totalFee: string;
  protocol: string;            // Best DEX name
  expiresAt: number;           // Quote validity timestamp
}

export interface SwapRoute {
  protocol: DEXProtocol;
  poolId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  fee: string;
}

export type DEXProtocol =
  | 'MinswapV2'
  | 'Minswap'
  | 'MinswapStable'
  | 'SundaeSwapV3'
  | 'SundaeSwap'
  | 'WingRidersV2'
  | 'WingRiders'
  | 'WingRidersStableV2'
  | 'Spectrum'
  | 'VyFinance'
  | 'MuesliSwap'
  | 'Splash'
  | 'SplashStable';

export interface DEXComparison {
  protocol: DEXProtocol;
  amountOut: string;
  fee: string;
  priceImpact: number;
  available: boolean;
  reason?: string;             // Why unavailable
}

export interface LPPosition {
  poolId: string;
  dex: DEXProtocol;
  tokenA: Token;
  tokenB: Token;
  lpTokenAmount: string;
  estimatedValueADA: string;
  share: number;               // Pool share percentage
}

export interface TokenPair {
  tokenIn: Token;
  tokenOut: Token;
  lastChecked: number;
  lastRate: number;            // tokenOut per tokenIn
}
```

### Constants

```typescript
// lib/defi/constants.ts

export const DEFI_CONFIG = {
  // API
  AGGREGATOR_BASE_URL: 'https://agg-api.minswap.org/aggregator',

  // Defaults
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
  QUOTE_VALIDITY_MS: 30_000,       // 30 seconds

  // Rate limits (be respectful)
  MIN_REQUEST_INTERVAL_MS: 500,
  MAX_REQUESTS_PER_MINUTE: 60,

  // UI
  MAX_WATCHLIST_PAIRS: 10,
  TOKEN_SEARCH_DEBOUNCE_MS: 300,

  // Cache
  TOKEN_LIST_CACHE_TTL_MS: 5 * 60 * 1000,  // 5 minutes
  PRICE_CACHE_TTL_MS: 30_000,              // 30 seconds
} as const;

export const DEX_INFO: Record<DEXProtocol, { name: string; color: string; logo?: string }> = {
  MinswapV2: { name: 'Minswap', color: '#3B82F6' },
  Minswap: { name: 'Minswap V1', color: '#3B82F6' },
  MinswapStable: { name: 'Minswap Stable', color: '#3B82F6' },
  SundaeSwapV3: { name: 'SundaeSwap', color: '#8B5CF6' },
  SundaeSwap: { name: 'SundaeSwap V1', color: '#8B5CF6' },
  WingRidersV2: { name: 'WingRiders', color: '#10B981' },
  WingRiders: { name: 'WingRiders V1', color: '#10B981' },
  WingRidersStableV2: { name: 'WingRiders Stable', color: '#10B981' },
  Spectrum: { name: 'Spectrum', color: '#F59E0B' },
  VyFinance: { name: 'VyFinance', color: '#EC4899' },
  MuesliSwap: { name: 'MuesliSwap', color: '#8B4513' },
  Splash: { name: 'Splash', color: '#06B6D4' },
  SplashStable: { name: 'Splash Stable', color: '#06B6D4' },
};

// Common tokens for quick access
export const COMMON_TOKENS = [
  { id: 'lovelace', ticker: 'ADA', name: 'Cardano' },
  { id: 'f66...min', ticker: 'MIN', name: 'Minswap' },
  { id: '8f5...sundae', ticker: 'SUNDAE', name: 'SundaeSwap' },
  { id: 'c48...wrt', ticker: 'WRT', name: 'WingRiders' },
  // Add more as needed
] as const;
```

---

## UI Design

### DeFi Tab Layout

```
┌──────────────────────────────────────┐
│  DEFI AGGREGATOR                     │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ SWAP COMPARISON                │  │
│  │                                │  │
│  │ [ADA ▼]  →  [MIN ▼]            │  │
│  │ Amount: [1000        ]         │  │
│  │                                │  │
│  │ ┌────────────────────────────┐ │  │
│  │ │ Minswap      12,345 MIN ★  │ │  │  ← Best rate
│  │ │ Fee: 3 ADA   Impact: 0.1%  │ │  │
│  │ └────────────────────────────┘ │  │
│  │ ┌────────────────────────────┐ │  │
│  │ │ SundaeSwap   12,298 MIN    │ │  │
│  │ │ Fee: 3.5 ADA Impact: 0.2%  │ │  │
│  │ └────────────────────────────┘ │  │
│  │ ┌────────────────────────────┐ │  │
│  │ │ WingRiders   12,156 MIN    │ │  │
│  │ │ Fee: 2.5 ADA Impact: 0.3%  │ │  │
│  │ └────────────────────────────┘ │  │
│  │                                │  │
│  │ [SWAP ON MINSWAP →]            │  │  ← Opens external link
│  └────────────────────────────────┘  │
│                                      │
│  WATCHLIST                           │
│  ┌──────────┐ ┌──────────┐          │
│  │ ADA/MIN  │ │ ADA/DJED │          │
│  │ ▲ +2.3%  │ │ ▼ -0.1%  │          │
│  └──────────┘ └──────────┘          │
│                                      │
│  YOUR LP POSITIONS                   │
│  ┌────────────────────────────────┐  │
│  │ Minswap: ADA/MIN               │  │
│  │ Value: ~500 ADA                │  │
│  │ Share: 0.0001%                 │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### Token Selector Modal

```
┌──────────────────────────────────────┐
│  SELECT TOKEN                    [X] │
├──────────────────────────────────────┤
│  🔍 [Search tokens...            ]   │
│                                      │
│  COMMON TOKENS                       │
│  [ADA] [MIN] [SUNDAE] [DJED] [iUSD]  │
│                                      │
│  ALL TOKENS                          │
│  ┌────────────────────────────────┐  │
│  │ 🔵 ADA      Cardano        ✓  │  │
│  │ 🟣 MIN      Minswap           │  │
│  │ 🟡 SUNDAE   SundaeSwap        │  │
│  │ 🟢 WRT      WingRiders        │  │
│  │ ...                           │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## API Implementation

### Aggregator Client

```typescript
// lib/defi/aggregator-api.ts

const BASE_URL = DEFI_CONFIG.AGGREGATOR_BASE_URL;

export async function getADAPrice(): Promise<{ usd: number; eur: number }> {
  const response = await fetch(`${BASE_URL}/ada-price`);
  if (!response.ok) throw new Error('Failed to fetch ADA price');
  return response.json();
}

export async function searchTokens(
  query: string,
  options: { verified?: boolean; limit?: number } = {}
): Promise<Token[]> {
  const response = await fetch(`${BASE_URL}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchText: query,
      page: 1,
      limit: options.limit || 20,
      verified: options.verified ?? true,
    }),
  });

  if (!response.ok) throw new Error('Failed to search tokens');
  const data = await response.json();

  return data.tokens.map((t: any) => ({
    id: t.id,
    ticker: t.ticker,
    name: t.name,
    decimals: t.decimals,
    logo: t.logo,
    verified: t.isVerified,
    price: t.price,
  }));
}

export async function getSwapEstimate(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  slippage = DEFI_CONFIG.DEFAULT_SLIPPAGE_PERCENT
): Promise<SwapQuote> {
  const response = await fetch(`${BASE_URL}/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokenIn,
      tokenOut,
      amountIn,
      slippageTolerance: slippage,
    }),
  });

  if (!response.ok) throw new Error('Failed to get swap estimate');
  const data = await response.json();

  return {
    tokenIn: data.tokenIn,
    tokenOut: data.tokenOut,
    amountIn,
    amountOut: data.amountOut,
    priceImpact: data.priceImpact,
    routes: data.routes,
    totalFee: data.aggregatedFee,
    protocol: data.routes[0]?.protocol || 'Unknown',
    expiresAt: Date.now() + DEFI_CONFIG.QUOTE_VALIDITY_MS,
  };
}
```

### Multi-DEX Comparison

```typescript
// lib/defi/price-compare.ts

export async function compareAllDEXes(
  tokenIn: string,
  tokenOut: string,
  amountIn: string
): Promise<DEXComparison[]> {
  const allProtocols: DEXProtocol[] = [
    'MinswapV2', 'SundaeSwapV3', 'WingRidersV2',
    'Spectrum', 'VyFinance', 'MuesliSwap'
  ];

  const comparisons = await Promise.all(
    allProtocols.map(async (protocol) => {
      try {
        const estimate = await getSwapEstimate(
          tokenIn, tokenOut, amountIn,
          DEFI_CONFIG.DEFAULT_SLIPPAGE_PERCENT,
          [protocol]  // Only use this protocol
        );

        return {
          protocol,
          amountOut: estimate.amountOut,
          fee: estimate.totalFee,
          priceImpact: estimate.priceImpact,
          available: true,
        };
      } catch (error) {
        return {
          protocol,
          amountOut: '0',
          fee: '0',
          priceImpact: 0,
          available: false,
          reason: 'No liquidity or pair not available',
        };
      }
    })
  );

  // Sort by best rate (highest amountOut)
  return comparisons
    .filter(c => c.available)
    .sort((a, b) => BigInt(b.amountOut) > BigInt(a.amountOut) ? 1 : -1);
}
```

### LP Position Detection

```typescript
// lib/defi/lp-positions.ts

// Known LP token policy IDs (incomplete - would need research)
const LP_POLICIES: Record<string, DEXProtocol> = {
  'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86': 'MinswapV2',
  // Add more as discovered
};

export async function detectLPPositions(
  address: string
): Promise<LPPosition[]> {
  const utxos = await blockfrost.getAddressUtxos(address);
  const lpPositions: LPPosition[] = [];

  for (const utxo of utxos) {
    for (const asset of utxo.amount) {
      if (asset.unit === 'lovelace') continue;

      const policyId = asset.unit.slice(0, 56);
      const protocol = LP_POLICIES[policyId];

      if (protocol) {
        // This is an LP token - fetch pool details
        const position = await getLPPositionDetails(
          asset.unit,
          asset.quantity,
          protocol
        );
        if (position) lpPositions.push(position);
      }
    }
  }

  return lpPositions;
}
```

---

## Implementation Phases

### Phase 1: Basic Price Comparison
- [ ] Create defi types and constants
- [ ] Implement Minswap aggregator API client
- [ ] Build TokenSelector component
- [ ] Build SwapQuote component showing best rate
- [ ] Add to Tools tab as subtab

### Phase 2: Multi-DEX Comparison
- [ ] Implement per-DEX quote fetching
- [ ] Build DEXComparisonTable component
- [ ] Add "Swap on X" external links
- [ ] Rate limiting and caching

### Phase 3: Token Watchlist
- [ ] Create watchlist store (Zustand + persistence)
- [ ] Build TokenWatchlist component
- [ ] Add 24h price change indicators
- [ ] Quick-compare from watchlist

### Phase 4: LP Position Tracking
- [ ] Research LP token policy IDs per DEX
- [ ] Implement LP detection from wallet
- [ ] Build LPPositionCard component
- [ ] Estimate position values

---

## External Links (for actual swaps)

Since we're read-only, provide deep links to DEX UIs:

```typescript
const DEX_SWAP_URLS: Record<DEXProtocol, (tokenIn: string, tokenOut: string) => string> = {
  MinswapV2: (tIn, tOut) => `https://app.minswap.org/swap?currencyA=${tIn}&currencyB=${tOut}`,
  SundaeSwapV3: (tIn, tOut) => `https://app.sundaeswap.finance/swap?from=${tIn}&to=${tOut}`,
  WingRidersV2: (tIn, tOut) => `https://app.wingriders.com/swap/${tIn}/${tOut}`,
  // ... more DEXes
};

// Open in browser
import { Linking } from 'react-native';
Linking.openURL(DEX_SWAP_URLS.MinswapV2('lovelace', 'policyId.assetName'));
```

---

## Rate Limit Considerations

Minswap Aggregator API - limits unknown, be conservative:

### Strategies
1. **Debounce input** - Wait 300ms after user stops typing amount
2. **Cache quotes** - Valid for 30 seconds
3. **Lazy comparison** - Only fetch per-DEX when user expands
4. **Token list cache** - Cache for 5 minutes

### Fallback
If aggregator is rate-limited:
- Show cached data with "stale" indicator
- Queue requests with exponential backoff
- Fall back to Blockfrost for basic token data

---

## Security Considerations

1. **No transaction building** - We never construct or sign transactions
2. **External links only** - Users swap on official DEX UIs
3. **Verify DEX URLs** - Hardcode official URLs, never from API
4. **Input validation** - Sanitize amounts, validate token IDs
5. **No private keys** - Read-only wallet access only

---

## Future Enhancements

1. **Price alerts** - Notify when token hits target price
2. **Yield farming tracker** - Track farming positions and APY
3. **Impermanent loss calculator** - Show IL on LP positions
4. **Historical charts** - Token price over time (needs price history API)
5. **Arbitrage detector** - Show price differences across DEXes
6. **Gas optimization** - Compare network fees for routes

---

## Tab Placement Decision

**Option A: New "DeFi" tab**
- Pros: High visibility, frequently used feature
- Cons: Tab bar getting crowded (Portfolio, Tools, Games, Settings + DeFi)

**Option B: Subtab under "Tools"**
- Pros: Keeps tab bar clean, groups utilities
- Cons: Less prominent

**Recommendation**: Add as **subtab under Tools** initially. The Tools tab can become a "hub" with:
- Export CSV
- DeFi Aggregator
- Staking Optimizer
- (Future: $handle resolver, etc.)

If DeFi becomes the most-used feature, promote to main tab.
