/**
 * Pool alert detection logic.
 * Analyzes pool health and generates actionable alerts for users.
 */

import { STAKING_CONFIG } from './constants';
import type { PoolInfo, PoolAlert, PoolAlertType, AlertSeverity } from './types';

/**
 * Generate alerts based on current pool state.
 * Returns array of alerts sorted by severity (critical first).
 */
export function generatePoolAlerts(pool: PoolInfo): PoolAlert[] {
  const alerts: PoolAlert[] = [];

  // Check for retiring pool (critical)
  if (pool.retiring) {
    alerts.push({
      type: 'retiring',
      severity: 'critical',
      message: pool.retireEpoch
        ? `Pool retiring in epoch ${pool.retireEpoch}. Re-delegate to continue earning rewards.`
        : 'Pool has announced retirement. Re-delegate to continue earning rewards.',
      poolId: pool.poolId,
    });
  }

  // Check for oversaturation (critical)
  if (pool.saturation >= STAKING_CONFIG.SATURATION_CRITICAL_PERCENT) {
    alerts.push({
      type: 'oversaturated',
      severity: 'critical',
      message: `Pool is ${pool.saturation.toFixed(1)}% saturated. Rewards are reduced. Consider re-delegating.`,
      poolId: pool.poolId,
    });
  }
  // Check for approaching saturation (warning) - only if not already oversaturated
  else if (pool.saturation >= STAKING_CONFIG.SATURATION_WARNING_PERCENT) {
    alerts.push({
      type: 'approaching_saturation',
      severity: 'warning',
      message: `Pool is ${pool.saturation.toFixed(1)}% saturated. Monitor for further increases.`,
      poolId: pool.poolId,
    });
  }

  // Sort by severity: critical first, then warning, then info
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Check if pool has any critical alerts.
 */
export function hasCriticalAlerts(alerts: PoolAlert[]): boolean {
  return alerts.some((alert) => alert.severity === 'critical');
}

/**
 * Check if pool has any alerts at all.
 */
export function hasAlerts(alerts: PoolAlert[]): boolean {
  return alerts.length > 0;
}

/**
 * Get the most severe alert from a list.
 */
export function getMostSevereAlert(alerts: PoolAlert[]): PoolAlert | null {
  if (alerts.length === 0) return null;
  // Already sorted by severity, so first is most severe
  return alerts[0];
}
