/**
 * Blockfrost API calls for staking data.
 * Handles pool information, delegation status, and reward history.
 */

import { fetchBlockfrost } from '../api/blockfrost';
import { STAKING_CONFIG } from './constants';
import type {
  PoolInfo,
  DelegationInfo,
  EpochReward,
  BlockfrostPoolResponse,
  BlockfrostPoolMetadataResponse,
  BlockfrostPoolHistoryItem,
  BlockfrostAccountRewardItem,
} from './types';

/**
 * Get user's current delegation information.
 */
export async function getUserDelegation(stakeAddress: string): Promise<DelegationInfo> {
  interface AccountResponse {
    stake_address: string;
    active: boolean;
    pool_id: string | null;
    controlled_amount: string;
    withdrawable_amount: string;
    rewards_sum: string;
  }

  const account = await fetchBlockfrost<AccountResponse>(`/accounts/${stakeAddress}`);

  return {
    stakeAddress,
    poolId: account.pool_id,
    activeStake: account.controlled_amount,
    rewards: account.withdrawable_amount,
    totalRewardsEarned: account.rewards_sum,
  };
}

/**
 * Calculate ROA from pool history data using BigInt for precision.
 * ROA = (avgRewardsPerEpoch * EPOCHS_PER_YEAR * 100) / avgStake
 *
 * Multiply before dividing to maintain BigInt precision.
 * Uses average values to correctly compute annualized returns.
 */
function calculateROAFromHistory(history: BlockfrostPoolHistoryItem[]): number {
  if (history.length === 0) return 0;

  let totalRewards = 0n;
  let totalStake = 0n;

  for (const epoch of history) {
    totalRewards += BigInt(epoch.rewards || '0');
    totalStake += BigInt(epoch.active_stake || '0');
  }

  if (totalStake === 0n) return 0;

  // Calculate average rewards and stake per epoch
  const epochs = BigInt(history.length);
  const avgRewardsPerEpoch = totalRewards / epochs;
  const avgStake = totalStake / epochs;

  if (avgStake === 0n) return 0;

  // Calculate ROA using BigInt arithmetic to maintain precision
  // ROA = (avgRewardsPerEpoch / avgStake) * EPOCHS_PER_YEAR * 100
  // Rewritten as: (avgRewardsPerEpoch * EPOCHS_PER_YEAR * 100 * PRECISION) / avgStake
  const PRECISION = 10000n; // For 2 decimal places
  const scaledROA = (avgRewardsPerEpoch * BigInt(STAKING_CONFIG.EPOCHS_PER_YEAR) * 100n * PRECISION) / avgStake;

  return Number(scaledROA) / Number(PRECISION);
}

/**
 * Get detailed information about a specific pool.
 * Uses Promise.allSettled to handle partial failures gracefully.
 */
export async function getPoolDetails(poolId: string): Promise<PoolInfo> {
  const results = await Promise.allSettled([
    fetchBlockfrost<BlockfrostPoolResponse>(`/pools/${poolId}`),
    fetchBlockfrost<BlockfrostPoolMetadataResponse>(`/pools/${poolId}/metadata`),
    fetchBlockfrost<BlockfrostPoolHistoryItem[]>(
      `/pools/${poolId}/history?count=${STAKING_CONFIG.RECENT_EPOCHS_FOR_ROA}&order=desc`
    ),
  ]);

  // Pool data is required - throw if it failed
  if (results[0].status === 'rejected') {
    throw new Error(`Failed to fetch pool ${poolId}: ${results[0].reason}`);
  }

  const pool = results[0].value;

  // Metadata and history are optional - use defaults if failed
  const metadata = results[1].status === 'fulfilled' ? results[1].value : null;
  const history = results[2].status === 'fulfilled' ? results[2].value : [];
  const isHistoryComplete = results[2].status === 'fulfilled';

  // Log warnings for partial failures (visible in dev)
  if (results[1].status === 'rejected') {
    console.warn(`Failed to fetch metadata for pool ${poolId}`);
  }
  if (results[2].status === 'rejected') {
    console.warn(`Failed to fetch history for pool ${poolId}`);
  }

  const lifetimeROA = calculateROAFromHistory(history);
  const recentROA = calculateROAFromHistory(
    history.slice(0, STAKING_CONFIG.SHORT_TERM_EPOCHS_FOR_ROA)
  );

  return {
    poolId,
    ticker: metadata?.ticker || 'UNKN',
    name: metadata?.name || 'Unknown Pool',
    description: metadata?.description || '',
    homepage: metadata?.homepage || '',
    saturation: pool.live_saturation * 100,
    margin: pool.margin_cost,
    fixedCost: pool.fixed_cost,
    pledge: pool.declared_pledge,
    liveStake: pool.live_stake,
    lifetimeBlocks: pool.blocks_minted,
    lifetimeROA,
    recentROA,
    retiring: pool.retirement.length > 0,
    retireEpoch: pool.retirement.length > 0 ? (parseInt(pool.retirement[0], 10) || null) : null,
    isHistoryComplete,
  };
}

/**
 * Get user's reward history for recent epochs.
 */
export async function getRewardHistory(
  stakeAddress: string,
  count: number = STAKING_CONFIG.REWARDS_CHART_EPOCHS
): Promise<EpochReward[]> {
  const rewards = await fetchBlockfrost<BlockfrostAccountRewardItem[]>(
    `/accounts/${stakeAddress}/rewards?count=${count}&order=desc`
  );

  return rewards.map((r) => ({
    epoch: r.epoch,
    amount: r.amount,
    poolId: r.pool_id,
  }));
}

/**
 * Get current epoch information.
 */
export async function getCurrentEpoch(): Promise<number> {
  interface EpochResponse {
    epoch: number;
  }

  const epoch = await fetchBlockfrost<EpochResponse>('/epochs/latest');
  return epoch.epoch;
}

/**
 * Barrel export for staking API functions.
 */
export const stakingApi = {
  getUserDelegation,
  getPoolDetails,
  getRewardHistory,
  getCurrentEpoch,
};
