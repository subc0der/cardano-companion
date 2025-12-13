/**
 * Background Alert Task
 *
 * Hourly background task to check price alerts when app is closed.
 * Note: Requires a development build - does not work in Expo Go.
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { usePriceAlertStore } from '../stores/priceAlertStore';
import { useWatchlistStore } from '../stores/defiWatchlistStore';
import { getSwapEstimate } from '../defi/aggregator-api';
import { checkAlert, buildNotification } from '../defi/alertService';
import { sendPriceAlertNotification } from './notificationService';
import type { TokenPair } from '../defi/types';

/** Task name for background fetch */
export const BACKGROUND_ALERT_TASK = 'background-price-alert-check';

/** Minimum interval between background checks (1 hour in seconds) */
const BACKGROUND_CHECK_INTERVAL_SECONDS = 60 * 60;

/**
 * Check if TaskManager native module is available.
 * Returns false in Expo Go where native modules aren't available.
 */
const isTaskManagerAvailable = (): boolean => {
  try {
    // Check that the function exists and is callable
    return typeof TaskManager.isAvailableAsync === 'function';
  } catch {
    return false;
  }
};

/**
 * Define the background task.
 * This runs approximately every hour when app is closed.
 * Note: The interval is a minimum - actual execution timing depends on system
 * resources, device state (battery, power mode), and OS scheduling. The task
 * may be delayed or skipped by the system to conserve battery.
 * Only define if TaskManager is available (not in Expo Go).
 */
if (isTaskManagerAvailable()) {
  TaskManager.defineTask(BACKGROUND_ALERT_TASK, async () => {
  try {
    const alertStore = usePriceAlertStore.getState();
    const watchlistStore = useWatchlistStore.getState();

    // Skip if notifications are disabled
    if (!alertStore.notificationsEnabled) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const activeAlerts = alertStore.getActiveAlerts();
    if (activeAlerts.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get unique pair IDs from active alerts
    const pairIds = [...new Set(activeAlerts.map((a) => a.pairId))];

    // Build list of pairs to fetch
    const pairsToFetch = pairIds
      .map((pairId) => watchlistStore.pairs.find((p) => p.id === pairId))
      .filter((pair): pair is TokenPair => pair !== undefined);

    if (pairsToFetch.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Fetch current prices in parallel for faster execution
    // Background tasks have time limits, so parallel fetching is preferred
    const fetchResults = await Promise.allSettled(
      pairsToFetch.map(async (pair) => {
        const oneUnit = Math.pow(10, pair.tokenIn.decimals).toString();
        const quote = await getSwapEstimate({
          tokenIn: pair.tokenIn.id,
          tokenOut: pair.tokenOut.id,
          amountIn: oneUnit,
        });
        const rate = Number(quote.amountOut) / Math.pow(10, pair.tokenOut.decimals);
        return { pair, rate };
      })
    );

    // Process results and build updated pairs map
    const updatedPairs: Map<string, TokenPair> = new Map();
    let fetchFailCount = 0;

    fetchResults.forEach((result, index) => {
      const pair = pairsToFetch[index];
      if (result.status === 'fulfilled') {
        const updatedPair: TokenPair = {
          ...pair,
          lastRate: result.value.rate,
          lastUpdated: Date.now(),
        };
        updatedPairs.set(pair.id, updatedPair);
        // Note: Not updating watchlist store from background task to avoid race conditions
        // The rate is only used locally for alert checking
      } else {
        console.warn(`[BackgroundAlert] Failed to fetch price for pair ${pair.id}:`, result.reason);
        fetchFailCount++;
      }
    });

    // If all fetches failed, report failure
    if (fetchFailCount === pairsToFetch.length) {
      console.error('[BackgroundAlert] All price fetches failed - possible network issue');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Check each active alert
    // Note: Alert store mutations here are acceptable because:
    // 1. Zustand handles concurrent updates atomically
    // 2. Worst case: user removes alert while we trigger it = no-op (alert already gone)
    // 3. The triggered state is idempotent - triggering twice has same result
    let triggeredCount = 0;

    for (const alert of activeAlerts) {
      const pair = updatedPairs.get(alert.pairId);
      if (!pair) continue;

      const result = checkAlert(alert, pair);

      if (result.shouldTrigger) {
        // Update alert status (idempotent - safe if alert was modified)
        alertStore.updateAlertStatus(alert.id, 'triggered', result.currentRate);

        // Send notification
        const notification = buildNotification(result, pair);
        await sendPriceAlertNotification(notification);
        alertStore.markNotificationSent(alert.id);

        triggeredCount++;
      }
    }

    // Update last check timestamp
    alertStore.setLastBackgroundCheck(Date.now());

    return triggeredCount > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundAlert] Task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  });
}

/**
 * Register the background task.
 * Call this once when app initializes.
 * Returns false in Expo Go where background fetch is not available.
 */
export async function registerBackgroundAlertTask(): Promise<boolean> {
  if (!isTaskManagerAvailable()) {
    return false;
  }

  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return false;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_ALERT_TASK, {
      minimumInterval: BACKGROUND_CHECK_INTERVAL_SECONDS,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return true;
  } catch (error) {
    console.warn('[BackgroundAlert] Failed to register task:', error);
    return false;
  }
}

/**
 * Unregister the background task.
 */
export async function unregisterBackgroundAlertTask(): Promise<void> {
  if (!isTaskManagerAvailable()) {
    return;
  }

  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_ALERT_TASK);
  } catch (error) {
    // Log but don't fail - unregistration errors are non-critical
    console.warn('[BackgroundAlert] Failed to unregister task:', error);
  }
}

/**
 * Check if background task is registered.
 */
export async function isBackgroundTaskRegistered(): Promise<boolean> {
  if (!isTaskManagerAvailable()) {
    return false;
  }
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_ALERT_TASK);
}
