/**
 * Staking Optimizer type definitions.
 * Used for analyzing stake pool performance and generating recommendations.
 */

/**
 * Stake pool information from Blockfrost API.
 */
export interface PoolInfo {
  poolId: string;
  ticker: string;
  name: string;
  description: string;
  homepage: string;
  /** Saturation percentage (0-100+, can exceed 100 if oversaturated) */
  saturation: number;
  /** Pool margin as decimal (e.g., 0.02 = 2%) */
  margin: number;
  /** Fixed cost per epoch in lovelace */
  fixedCost: string;
  /** Pool pledge in lovelace */
  pledge: string;
  /** Current live stake in lovelace */
  liveStake: string;
  /** Total blocks minted over pool lifetime */
  lifetimeBlocks: number;
  /** Lifetime return on ADA as percentage */
  lifetimeROA: number;
  /** Recent ROA (last 10 epochs) as percentage */
  recentROA: number;
  /** Whether pool has announced retirement */
  retiring: boolean;
  /** Epoch number when pool will retire, null if not retiring */
  retireEpoch: number | null;
  /** Whether pool history was successfully fetched (false = ROA data unavailable) */
  isHistoryComplete: boolean;
}

/**
 * User's current delegation status.
 */
export interface DelegationInfo {
  stakeAddress: string;
  /** Pool ID user is delegated to, null if not delegating */
  poolId: string | null;
  /** Active stake amount in lovelace */
  activeStake: string;
  /** Withdrawable rewards in lovelace */
  rewards: string;
  /** Total rewards earned over lifetime in lovelace */
  totalRewardsEarned: string;
}

/**
 * Single epoch reward record.
 */
export interface EpochReward {
  epoch: number;
  /** Reward amount in lovelace */
  amount: string;
  poolId: string;
}

/**
 * Reasons for recommending a pool over the user's current pool.
 */
export type RecommendationReason =
  | 'higher_roa'
  | 'lower_saturation'
  | 'lower_fees'
  | 'better_overall';

/**
 * Pool recommendation with comparison to user's current pool.
 */
export interface PoolRecommendation {
  pool: PoolInfo;
  reason: RecommendationReason;
  /** Projected annual yield as percentage */
  projectedAnnualYield: number;
  /** Improvement over current pool in percentage points */
  improvementVsCurrent: number;
}

/**
 * Types of alerts that can be raised about a user's current pool.
 */
export type PoolAlertType =
  | 'approaching_saturation'
  | 'oversaturated'
  | 'margin_increase'
  | 'retiring'
  | 'no_recent_blocks'
  | 'pledge_decreased';

/**
 * Alert severity levels.
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Pool health alert for user notification.
 */
export interface PoolAlert {
  type: PoolAlertType;
  severity: AlertSeverity;
  message: string;
  poolId: string;
}

/**
 * Blockfrost pool response shape.
 */
export interface BlockfrostPoolResponse {
  pool_id: string;
  hex: string;
  vrf_key: string;
  blocks_minted: number;
  blocks_epoch: number;
  live_stake: string;
  live_size: number;
  live_saturation: number;
  live_delegators: number;
  active_stake: string;
  active_size: number;
  declared_pledge: string;
  live_pledge: string;
  margin_cost: number;
  fixed_cost: string;
  reward_account: string;
  owners: string[];
  registration: string[];
  retirement: string[];
}

/**
 * Blockfrost pool metadata response shape.
 */
export interface BlockfrostPoolMetadataResponse {
  pool_id: string;
  hex: string;
  url: string | null;
  hash: string | null;
  ticker: string | null;
  name: string | null;
  description: string | null;
  homepage: string | null;
}

/**
 * Blockfrost pool history item.
 */
export interface BlockfrostPoolHistoryItem {
  epoch: number;
  blocks: number;
  active_stake: string;
  active_size: number;
  delegators_count: number;
  rewards: string;
  fees: string;
}

/**
 * Blockfrost account rewards item.
 */
export interface BlockfrostAccountRewardItem {
  epoch: number;
  amount: string;
  pool_id: string;
  type: string;
}
