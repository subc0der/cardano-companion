/**
 * Hook for fetching user delegation data.
 * Provides a single source of truth for delegation queries across components.
 */

import { useQuery } from '@tanstack/react-query';
import { stakingApi, STAKING_CONFIG } from '../staking';

/**
 * Fetch user's current delegation information.
 * Uses React Query for caching and deduplication.
 *
 * @param stakeAddress - User's stake address (stake1...)
 * @returns Query result with delegation data
 */
export function useUserDelegation(stakeAddress: string | null) {
  return useQuery({
    queryKey: ['delegation', stakeAddress],
    queryFn: () => stakingApi.getUserDelegation(stakeAddress!),
    enabled: !!stakeAddress,
    staleTime: STAKING_CONFIG.POOL_DETAILS_CACHE_TTL_MS,
  });
}
