/**
 * Staking utility functions shared across components.
 */

import { cyberpunk } from '../theme/colors';
import { STAKING_CONFIG } from './constants';
import type { PoolInfo } from './types';

/**
 * Get color for saturation percentage.
 */
export function getSaturationColor(saturation: number): string {
  if (saturation >= STAKING_CONFIG.SATURATION_CRITICAL_PERCENT) {
    return cyberpunk.error;
  }
  if (saturation >= STAKING_CONFIG.SATURATION_WARNING_PERCENT) {
    return cyberpunk.warning;
  }
  return cyberpunk.success;
}

/**
 * Get status text and color for pool health.
 */
export function getPoolStatus(pool: PoolInfo): { text: string; color: string } {
  if (pool.retiring) {
    return { text: 'RETIRING', color: cyberpunk.error };
  }
  if (pool.saturation >= STAKING_CONFIG.SATURATION_CRITICAL_PERCENT) {
    return { text: 'OVERSATURATED', color: cyberpunk.error };
  }
  if (pool.saturation >= STAKING_CONFIG.SATURATION_WARNING_PERCENT) {
    return { text: 'HIGH SATURATION', color: cyberpunk.warning };
  }
  return { text: 'HEALTHY', color: cyberpunk.success };
}
