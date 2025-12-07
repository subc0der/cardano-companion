/**
 * Hook for generating pool health alerts.
 * Analyzes the user's current pool and generates actionable alerts.
 */

import { useMemo } from 'react';
import type { PoolInfo, PoolAlert } from '../staking';
import { generatePoolAlerts, hasCriticalAlerts, hasAlerts } from '../staking';

interface UsePoolAlertsResult {
  alerts: PoolAlert[];
  hasCritical: boolean;
  hasAny: boolean;
}

/**
 * Generate alerts for a pool.
 * Memoized to avoid recalculation on every render.
 *
 * @param pool - Pool info to analyze (null if not loaded)
 * @returns Alert analysis results
 */
export function usePoolAlerts(pool: PoolInfo | null | undefined): UsePoolAlertsResult {
  return useMemo(() => {
    if (!pool) {
      return {
        alerts: [],
        hasCritical: false,
        hasAny: false,
      };
    }

    const alerts = generatePoolAlerts(pool);

    return {
      alerts,
      hasCritical: hasCriticalAlerts(alerts),
      hasAny: hasAlerts(alerts),
    };
  }, [pool]);
}
