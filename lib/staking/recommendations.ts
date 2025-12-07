/**
 * Pool recommendation engine.
 * Analyzes pools and suggests alternatives based on ROA, saturation, and fees.
 */

import { fetchBlockfrost } from '../api/blockfrost';
import { STAKING_CONFIG, RECOMMENDATION_REASON_LABELS } from './constants';
import { getPoolDetails } from './api';
import type { PoolInfo, PoolRecommendation, RecommendationReason } from './types';

/**
 * Blockfrost pool list item (extended info endpoint).
 */
interface BlockfrostPoolExtended {
  pool_id: string;
  hex: string;
  active_stake: string;
  live_stake: string;
  live_saturation: number;
  live_delegators: number;
  blocks_minted: number;
  blocks_epoch: number;
  margin_cost: number;
  fixed_cost: string;
  declared_pledge: string;
  retirement: string[] | null;
}

/**
 * Fetch top pools by stake, pre-filtered for active pools.
 */
async function getTopPools(count: number): Promise<BlockfrostPoolExtended[]> {
  return fetchBlockfrost<BlockfrostPoolExtended[]>(
    `/pools/extended?count=${count}&order=desc`
  );
}

/**
 * Determine the primary reason for recommending a pool.
 * Uses constants for thresholds.
 */
function determineReason(
  candidate: PoolInfo,
  current: PoolInfo | null
): RecommendationReason {
  if (!current) return 'better_overall';

  const roaDiff = candidate.recentROA - current.recentROA;
  const satDiff = current.saturation - candidate.saturation;
  const marginDiff = current.margin - candidate.margin;

  // Prioritize by magnitude of improvement using configured thresholds
  if (roaDiff >= STAKING_CONFIG.HIGHER_ROA_THRESHOLD) return 'higher_roa';
  if (satDiff >= STAKING_CONFIG.LOWER_SATURATION_THRESHOLD) return 'lower_saturation';
  if (marginDiff >= STAKING_CONFIG.LOWER_FEES_THRESHOLD) return 'lower_fees';

  return 'better_overall';
}

/**
 * Get human-readable label for recommendation reason.
 */
export function getReasonLabel(reason: RecommendationReason): string {
  return RECOMMENDATION_REASON_LABELS[reason];
}

/**
 * Generate pool recommendations based on user's current delegation.
 * Optimized to reduce API calls by pre-filtering from extended pool list.
 */
export async function getPoolRecommendations(
  currentPoolId: string | null
): Promise<PoolRecommendation[]> {
  // Fetch top pools by stake (good proxy for established pools)
  const topPools = await getTopPools(STAKING_CONFIG.POOLS_PER_PAGE);

  // Get current pool details if delegating
  const currentPool = currentPoolId ? await getPoolDetails(currentPoolId) : null;

  // Pre-filter candidates using data from extended endpoint (no extra API calls)
  const candidates = topPools
    .filter((pool) => {
      // Exclude current pool
      if (pool.pool_id === currentPoolId) return false;
      // Exclude oversaturated pools
      if (pool.live_saturation * 100 > STAKING_CONFIG.MAX_SATURATION_FOR_RECOMMEND) return false;
      // Exclude retiring pools
      if (pool.retirement && pool.retirement.length > 0) return false;
      // Require minimum track record
      if (pool.blocks_minted < STAKING_CONFIG.MIN_LIFETIME_BLOCKS) return false;
      return true;
    })
    // Sort by blocks minted as proxy for reliability (more blocks = more established)
    .sort((a, b) => b.blocks_minted - a.blocks_minted);

  // Only fetch full details for top N candidates to minimize API calls
  const topCandidates = candidates.slice(0, STAKING_CONFIG.TOP_CANDIDATES_TO_FETCH);

  // Fetch full details using Promise.allSettled to handle partial failures
  const poolDetailsResults = await Promise.allSettled(
    topCandidates.map((p) => getPoolDetails(p.pool_id))
  );

  // Build recommendations from successful fetches
  const recommendations: PoolRecommendation[] = [];

  for (const result of poolDetailsResults) {
    if (result.status === 'rejected') {
      console.warn('Failed to fetch pool details for recommendation:', result.reason);
      continue;
    }

    const pool = result.value;
    const improvementVsCurrent = currentPool
      ? pool.recentROA - currentPool.recentROA
      : pool.recentROA;

    // Only recommend if there's meaningful improvement (or no current pool)
    if (currentPool && improvementVsCurrent < STAKING_CONFIG.MIN_ROA_IMPROVEMENT_PERCENT) {
      continue;
    }

    recommendations.push({
      pool,
      reason: determineReason(pool, currentPool),
      projectedAnnualYield: pool.recentROA,
      improvementVsCurrent,
    });
  }

  // Sort by improvement and limit results
  return recommendations
    .sort((a, b) => b.improvementVsCurrent - a.improvementVsCurrent)
    .slice(0, STAKING_CONFIG.MAX_RECOMMENDATIONS);
}
