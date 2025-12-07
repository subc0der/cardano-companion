/**
 * Staking Optimizer configuration constants.
 * All magic numbers are defined here for maintainability.
 */

/** Lovelace per ADA as BigInt for safe calculations */
export const LOVELACE_PER_ADA = 1_000_000n;

export const STAKING_CONFIG = {
  // Cardano protocol parameters
  /** Approximate number of epochs per year (~5 days per epoch) */
  EPOCHS_PER_YEAR: 73,

  // Analysis thresholds
  /** Saturation level that triggers a warning (percentage) */
  SATURATION_WARNING_PERCENT: 90,
  /** Saturation level that triggers critical alert (percentage) */
  SATURATION_CRITICAL_PERCENT: 100,
  /** Minimum blocks minted for reliable ROA calculation */
  MIN_BLOCKS_FOR_RELIABLE_ROA: 50,
  /** Number of recent epochs to use for ROA calculation */
  RECENT_EPOCHS_FOR_ROA: 10,
  /** Number of recent epochs for short-term ROA calculation */
  SHORT_TERM_EPOCHS_FOR_ROA: 5,
  /** Epochs without blocks before warning */
  EPOCHS_WITHOUT_BLOCKS_WARNING: 5,
  /** Margin increase threshold for warning (1% = 0.01) */
  MARGIN_INCREASE_WARNING: 0.01,

  // Recommendation criteria
  /** Minimum ROA improvement to recommend switching (percentage points) */
  MIN_ROA_IMPROVEMENT_PERCENT: 0.1,
  /** Maximum saturation for pool to be recommended (percentage) */
  MAX_SATURATION_FOR_RECOMMEND: 85,
  /** Minimum lifetime blocks for pool to be considered established */
  MIN_LIFETIME_BLOCKS: 100,
  /** ROA difference threshold to classify as "higher ROA" reason (percentage points) */
  HIGHER_ROA_THRESHOLD: 0.5,
  /** Saturation difference threshold to classify as "lower saturation" reason (percentage points) */
  LOWER_SATURATION_THRESHOLD: 20,
  /** Margin difference threshold to classify as "lower fees" reason (decimal, 0.01 = 1%) */
  LOWER_FEES_THRESHOLD: 0.01,
  /** Number of top candidates to fetch full details for */
  TOP_CANDIDATES_TO_FETCH: 5,

  // UI configuration
  /** Maximum number of pool recommendations to show */
  MAX_RECOMMENDATIONS: 5,
  /** Number of epochs to show in rewards chart */
  REWARDS_CHART_EPOCHS: 20,

  // Cache TTL values
  /** Pool list cache duration (5 minutes) */
  POOL_LIST_CACHE_TTL_MS: 5 * 60 * 1000,
  /** Pool details cache duration (1 minute) */
  POOL_DETAILS_CACHE_TTL_MS: 60 * 1000,

  // API pagination
  /** Maximum pages to fetch when paginating pools */
  MAX_POOL_PAGES: 10,
  /** Pools per page from Blockfrost */
  POOLS_PER_PAGE: 100,
} as const;

export const ALERT_THRESHOLDS = {
  /** Saturation percentage that triggers warning - references STAKING_CONFIG */
  get SATURATION_WARNING() {
    return STAKING_CONFIG.SATURATION_WARNING_PERCENT;
  },
  /** Saturation percentage that triggers critical alert - references STAKING_CONFIG */
  get SATURATION_CRITICAL() {
    return STAKING_CONFIG.SATURATION_CRITICAL_PERCENT;
  },
  /** Epochs without blocks before warning - references STAKING_CONFIG */
  get EPOCHS_WITHOUT_BLOCKS_WARNING() {
    return STAKING_CONFIG.EPOCHS_WITHOUT_BLOCKS_WARNING;
  },
  /** Margin increase threshold for warning - references STAKING_CONFIG */
  get MARGIN_INCREASE_WARNING() {
    return STAKING_CONFIG.MARGIN_INCREASE_WARNING;
  },
} as const;

import type { RecommendationReason, PoolAlertType } from './types';

/**
 * User-friendly labels for recommendation reasons.
 */
export const RECOMMENDATION_REASON_LABELS: Record<RecommendationReason, string> = {
  higher_roa: 'Higher Returns',
  lower_saturation: 'Lower Saturation',
  lower_fees: 'Lower Fees',
  more_consistent: 'More Consistent',
  better_overall: 'Better Overall',
};

/**
 * User-friendly labels for alert types.
 */
export const ALERT_TYPE_LABELS: Record<PoolAlertType, string> = {
  approaching_saturation: 'Pool Approaching Saturation',
  oversaturated: 'Pool Oversaturated',
  margin_increase: 'Pool Fee Increased',
  retiring: 'Pool Retiring',
  no_recent_blocks: 'No Recent Blocks',
  pledge_decreased: 'Pledge Decreased',
};
