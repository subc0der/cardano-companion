# Staking Rewards Optimizer - Technical Design Document

## Overview

The **Staking Rewards Optimizer** helps users maximize their staking returns by analyzing stake pool performance, suggesting optimal pool switches, and tracking historical ROI. This is a read-only analytics feature - no transactions are built or signed.

### Design Goals
1. **Data-driven decisions** - Show real metrics, not marketing claims
2. **Privacy-preserving** - No tracking, all analysis done client-side
3. **Educational** - Help users understand staking mechanics
4. **Actionable** - Clear recommendations with reasoning

---

## Core Features

### 1. Current Delegation Analysis
Show the user's current staking situation:
- Current pool name, ticker, and metadata
- Pool saturation percentage
- Recent epoch rewards vs expected
- Pool's ROA (Return on ADA) - lifetime and recent
- Pool margin and fixed cost
- Blocks minted vs expected (luck factor)

### 2. Pool Performance Comparison
Compare user's current pool against alternatives:
- Filter by: low saturation, low fees, high ROA, block production consistency
- Sort by projected annual yield
- Show "what-if" scenarios: "If you delegated here instead..."

### 3. Historical Rewards Tracking
- Chart of rewards per epoch
- Compare actual vs expected rewards
- Identify missed blocks or poor performance periods
- Total lifetime staking rewards

### 4. Pool Health Alerts
Notify users of concerning changes:
- Pool approaching saturation (>90%)
- Pool margin increase
- Pool retiring
- Extended period without blocks
- Pool pledge changes

---

## Data Sources

### Blockfrost API Endpoints

| Endpoint | Purpose | Data |
|----------|---------|------|
| `/accounts/{stake_addr}` | User's delegation | pool_id, rewards_sum, withdrawable |
| `/accounts/{stake_addr}/rewards` | Reward history | epoch, amount, pool_id |
| `/pools` | List all pools | Paginated pool IDs |
| `/pools/{pool_id}` | Pool details | live_stake, saturation, margin, fixed_cost |
| `/pools/{pool_id}/metadata` | Pool branding | name, ticker, description, homepage |
| `/pools/{pool_id}/history` | Historical performance | blocks, rewards, active_stake per epoch |
| `/epochs/latest` | Current epoch | epoch number, start/end times |
| `/epochs/{epoch}/parameters` | Protocol params | k parameter, optimal pool size |

### Calculated Metrics

```typescript
// ROA (Return on ADA) - annualized
const epochsPerYear = 73; // ~5 days per epoch
const epochROA = rewardsThisEpoch / activeStakeThisEpoch;
const annualizedROA = epochROA * epochsPerYear * 100; // percentage

// Saturation percentage
const saturation = (liveStake / optimalPoolSize) * 100;

// Luck factor (blocks minted vs expected)
const expectedBlocks = (poolStake / totalStake) * blocksPerEpoch;
const luck = (actualBlocks / expectedBlocks) * 100;

// Effective yield (after fees)
const grossReward = blockReward * blocksProduced;
const poolTake = (grossReward * marginPercent) + fixedCost;
const delegatorReward = grossReward - poolTake;
const effectiveYield = delegatorReward / delegatedAmount;
```

---

## Architecture

### Directory Structure

```
lib/
├── staking/
│   ├── types.ts              # TypeScript interfaces
│   ├── constants.ts          # Magic numbers, thresholds
│   ├── api.ts                # Blockfrost pool API calls
│   ├── calculations.ts       # ROA, saturation, luck calculations
│   ├── recommendations.ts    # Pool recommendation engine
│   └── alerts.ts             # Health alert detection

components/
├── staking/
│   ├── CurrentDelegation.tsx # User's current pool info
│   ├── RewardsChart.tsx      # Historical rewards visualization
│   ├── PoolComparison.tsx    # Side-by-side pool comparison
│   ├── PoolCard.tsx          # Single pool display
│   ├── RecommendationList.tsx# Suggested pools
│   ├── AlertBanner.tsx       # Pool health warnings
│   └── index.ts              # Barrel export

app/
├── (tabs)/
│   └── staking.tsx           # New tab OR subtab under Tools
```

### Type Definitions

```typescript
// lib/staking/types.ts

export interface PoolInfo {
  poolId: string;
  ticker: string;
  name: string;
  description: string;
  homepage: string;
  saturation: number;        // 0-100+ percentage
  margin: number;            // 0-1 (e.g., 0.02 = 2%)
  fixedCost: string;         // lovelace
  pledge: string;            // lovelace
  liveStake: string;         // lovelace
  lifetimeBlocks: number;
  lifetimeROA: number;       // percentage
  recentROA: number;         // last 10 epochs
  retiring: boolean;
  retireEpoch: number | null;
}

export interface DelegationInfo {
  stakeAddress: string;
  poolId: string | null;
  activeStake: string;       // lovelace
  rewards: string;           // withdrawable lovelace
  totalRewardsEarned: string;
}

export interface EpochReward {
  epoch: number;
  amount: string;            // lovelace
  poolId: string;
}

export interface PoolRecommendation {
  pool: PoolInfo;
  reason: RecommendationReason;
  projectedAnnualYield: number;
  improvementVsCurrent: number; // percentage points
}

export type RecommendationReason =
  | 'higher_roa'
  | 'lower_saturation'
  | 'lower_fees'
  | 'more_consistent'
  | 'better_overall';

export interface PoolAlert {
  type: PoolAlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  poolId: string;
}

export type PoolAlertType =
  | 'approaching_saturation'
  | 'oversaturated'
  | 'margin_increase'
  | 'retiring'
  | 'no_recent_blocks'
  | 'pledge_decreased';
```

### Constants

```typescript
// lib/staking/constants.ts

export const STAKING_CONFIG = {
  // Cardano protocol
  EPOCHS_PER_YEAR: 73,
  LOVELACE_PER_ADA: 1_000_000,

  // Analysis thresholds
  SATURATION_WARNING_PERCENT: 90,
  SATURATION_CRITICAL_PERCENT: 100,
  MIN_BLOCKS_FOR_RELIABLE_ROA: 50,
  RECENT_EPOCHS_FOR_ROA: 10,

  // Recommendation criteria
  MIN_ROA_IMPROVEMENT_PERCENT: 0.1,  // Worth switching for 0.1% better
  MAX_SATURATION_FOR_RECOMMEND: 85,
  MIN_LIFETIME_BLOCKS: 100,          // Established pools only

  // UI
  MAX_RECOMMENDATIONS: 5,
  REWARDS_CHART_EPOCHS: 20,

  // Cache
  POOL_LIST_CACHE_TTL_MS: 5 * 60 * 1000,  // 5 minutes
  POOL_DETAILS_CACHE_TTL_MS: 60 * 1000,   // 1 minute
} as const;

export const ALERT_THRESHOLDS = {
  SATURATION_WARNING: 90,
  SATURATION_CRITICAL: 100,
  EPOCHS_WITHOUT_BLOCKS_WARNING: 5,
  MARGIN_INCREASE_WARNING: 0.01, // 1% increase
} as const;
```

---

## UI Design

### Staking Tab Layout

```
┌──────────────────────────────────────┐
│  STAKING OPTIMIZER                   │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ YOUR DELEGATION                │  │
│  │ Pool: [TICKER] Pool Name       │  │
│  │ Saturation: ████████░░ 82%     │  │
│  │ Your Stake: 5,000 ADA          │  │
│  │ Lifetime ROA: 4.2%             │  │
│  │ Status: ● Healthy              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ REWARDS HISTORY                │  │
│  │ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅ (chart)   │  │
│  │ Total Earned: 125.5 ADA        │  │
│  │ Avg/Epoch: 1.2 ADA             │  │
│  └────────────────────────────────┘  │
│                                      │
│  ⚠️ ALERT: Pool approaching 90%     │
│                                      │
│  RECOMMENDED POOLS                   │
│  ┌────────────────────────────────┐  │
│  │ [ABC] Alpha Pool    ROA: 4.5%  │  │
│  │ Sat: 45%  Margin: 1%           │  │
│  │ +0.3% vs current               │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ [XYZ] Zeta Pool     ROA: 4.4%  │  │
│  │ Sat: 62%  Margin: 2%           │  │
│  │ +0.2% vs current               │  │
│  └────────────────────────────────┘  │
│                                      │
│  [VIEW ALL POOLS]                    │
│                                      │
└──────────────────────────────────────┘
```

### Color Coding

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Saturation | <80% (green) | 80-99% (yellow) | 100%+ (red) |
| ROA | >4% (green) | 3-4% (yellow) | <3% (red) |
| Blocks/Expected | >80% (green) | 50-80% (yellow) | <50% (red) |

---

## API Implementation

### Pool Data Fetching

```typescript
// lib/staking/api.ts

import { blockfrost } from '../api/blockfrost';

export async function getUserDelegation(stakeAddress: string): Promise<DelegationInfo> {
  const account = await blockfrost.getAccountInfo(stakeAddress);
  return {
    stakeAddress,
    poolId: account.pool_id,
    activeStake: account.controlled_amount,
    rewards: account.withdrawable_amount,
    totalRewardsEarned: account.rewards_sum,
  };
}

export async function getPoolDetails(poolId: string): Promise<PoolInfo> {
  const [pool, metadata, history] = await Promise.all([
    fetchBlockfrost(`/pools/${poolId}`),
    fetchBlockfrost(`/pools/${poolId}/metadata`),
    fetchBlockfrost(`/pools/${poolId}/history?count=10&order=desc`),
  ]);

  // Calculate ROA from history
  const lifetimeROA = calculateLifetimeROA(history);
  const recentROA = calculateRecentROA(history.slice(0, 10));

  return {
    poolId,
    ticker: metadata.ticker || 'UNKN',
    name: metadata.name || 'Unknown Pool',
    description: metadata.description || '',
    homepage: metadata.homepage || '',
    saturation: pool.live_saturation * 100,
    margin: pool.margin_cost,
    fixedCost: pool.fixed_cost,
    pledge: pool.declared_pledge,
    liveStake: pool.live_stake,
    lifetimeBlocks: pool.blocks_minted,
    lifetimeROA,
    recentROA,
    retiring: !!pool.retirement,
    retireEpoch: pool.retirement?.[0]?.retiring_epoch || null,
  };
}

export async function getRewardHistory(
  stakeAddress: string,
  count = 20
): Promise<EpochReward[]> {
  const rewards = await fetchBlockfrost(
    `/accounts/${stakeAddress}/rewards?count=${count}&order=desc`
  );
  return rewards.map((r: any) => ({
    epoch: r.epoch,
    amount: r.amount,
    poolId: r.pool_id,
  }));
}
```

### Recommendation Engine

```typescript
// lib/staking/recommendations.ts

export async function getPoolRecommendations(
  currentPoolId: string | null,
  stakeAmount: string
): Promise<PoolRecommendation[]> {
  // Fetch top pools by ROA (pre-filtered server-side if possible)
  const allPools = await getTopPools(100);

  const currentPool = currentPoolId
    ? await getPoolDetails(currentPoolId)
    : null;

  const recommendations = allPools
    .filter(pool => {
      // Exclude current pool
      if (pool.poolId === currentPoolId) return false;
      // Exclude oversaturated pools
      if (pool.saturation > STAKING_CONFIG.MAX_SATURATION_FOR_RECOMMEND) return false;
      // Exclude retiring pools
      if (pool.retiring) return false;
      // Require minimum track record
      if (pool.lifetimeBlocks < STAKING_CONFIG.MIN_LIFETIME_BLOCKS) return false;
      return true;
    })
    .map(pool => ({
      pool,
      reason: determineReason(pool, currentPool),
      projectedAnnualYield: pool.recentROA,
      improvementVsCurrent: currentPool
        ? pool.recentROA - currentPool.recentROA
        : pool.recentROA,
    }))
    .filter(rec => rec.improvementVsCurrent >= STAKING_CONFIG.MIN_ROA_IMPROVEMENT_PERCENT)
    .sort((a, b) => b.improvementVsCurrent - a.improvementVsCurrent)
    .slice(0, STAKING_CONFIG.MAX_RECOMMENDATIONS);

  return recommendations;
}

function determineReason(
  candidate: PoolInfo,
  current: PoolInfo | null
): RecommendationReason {
  if (!current) return 'better_overall';

  if (candidate.recentROA > current.recentROA + 0.5) return 'higher_roa';
  if (candidate.saturation < current.saturation - 20) return 'lower_saturation';
  if (candidate.margin < current.margin - 0.01) return 'lower_fees';

  return 'better_overall';
}
```

---

## Implementation Phases

### Phase 1: Core Delegation View
- [ ] Create staking types and constants
- [ ] Implement Blockfrost pool API calls
- [ ] Build CurrentDelegation component
- [ ] Add to Tools tab as subtab or new main tab

### Phase 2: Rewards History
- [ ] Fetch reward history from API
- [ ] Build RewardsChart component (simple bar chart)
- [ ] Calculate and display totals/averages

### Phase 3: Recommendations
- [ ] Implement pool comparison logic
- [ ] Build recommendation engine
- [ ] Create PoolCard and RecommendationList components
- [ ] Add "View All Pools" screen

### Phase 4: Alerts
- [ ] Implement alert detection logic
- [ ] Build AlertBanner component
- [ ] Add push notification support (optional)

---

## Rate Limit Considerations

Blockfrost free tier: 50,000 requests/day, 10 requests/second

### Optimization Strategies
1. **Aggressive caching** - Pool list changes rarely
2. **Lazy loading** - Only fetch details when pool card is visible
3. **Batch requests** - Use Promise.all for parallel fetching
4. **Pagination** - Don't fetch all 3000+ pools at once
5. **Pre-filtered queries** - Use order/count params to get top pools

### Estimated API Calls Per Session
- Initial load: ~5 calls (account, current pool, rewards, top pools list)
- View recommendation: ~1 call per pool detail
- Refresh: ~3 calls
- **Budget**: ~20-50 calls per user session (well within limits)

---

## Future Enhancements

1. **Multi-pool tracking** - For users with multiple wallets
2. **Pool notifications** - Push alerts for pool changes
3. **Reward projections** - "At this rate, you'll earn X ADA this year"
4. **Pool comparison tool** - Side-by-side detailed comparison
5. **Export rewards** - CSV for tax purposes (integrates with existing CSV export)
6. **Epoch countdown** - Timer to next reward distribution

---

## Dependencies

**Already installed:**
- React Query (for caching/fetching)
- Zustand (if we need staking-specific state)

**May need:**
- Victory Native or react-native-chart-kit (for rewards chart)
- Or build simple chart with react-native-svg

---

## Tab Placement Decision

**Option A: New "Staking" tab**
- Pros: Prominent, easy to find
- Cons: Tab bar getting crowded

**Option B: Subtab under "Tools"**
- Pros: Keeps tab bar clean
- Cons: Less discoverable

**Recommendation**: Start as subtab under Tools, promote to main tab if usage warrants.
