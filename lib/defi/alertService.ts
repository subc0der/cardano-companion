/**
 * Price Alert Service
 *
 * Checks alerts against current prices and determines triggers.
 */

import type {
  PriceAlert,
  AlertCheckResult,
  PriceAlertNotification,
} from './alertTypes';
import type { TokenPair } from './types';

/**
 * Check if an alert should trigger based on current rate.
 */
export function checkAlert(
  alert: PriceAlert,
  pair: TokenPair
): AlertCheckResult {
  const currentRate = pair.lastRate;

  if (currentRate === null) {
    return {
      alert,
      shouldTrigger: false,
      currentRate: 0,
      message: 'No rate available',
    };
  }

  const { config } = alert;
  let shouldTrigger = false;
  let message = '';

  if (config.type === 'price_target') {
    if (config.condition === 'above' && currentRate >= config.targetRate) {
      shouldTrigger = true;
      message = `${pair.tokenIn.ticker}/${pair.tokenOut.ticker} is now above ${formatAlertRate(config.targetRate)}`;
    } else if (config.condition === 'below' && currentRate <= config.targetRate) {
      shouldTrigger = true;
      message = `${pair.tokenIn.ticker}/${pair.tokenOut.ticker} is now below ${formatAlertRate(config.targetRate)}`;
    }
  } else if (config.type === 'percent_change') {
    // Guard against invalid baseRate (zero, negative, NaN, Infinity)
    if (!isFinite(config.baseRate) || config.baseRate <= 0) {
      return {
        alert,
        shouldTrigger: false,
        currentRate,
        message: 'Invalid base rate',
      };
    }

    const percentChange = ((currentRate - config.baseRate) / config.baseRate) * 100;
    const absChange = Math.abs(percentChange);

    if (absChange >= config.percentThreshold) {
      const isUp = percentChange > 0;
      const shouldTriggerDirection =
        config.direction === 'either' ||
        (config.direction === 'up' && isUp) ||
        (config.direction === 'down' && !isUp);

      if (shouldTriggerDirection) {
        shouldTrigger = true;
        const direction = isUp ? 'up' : 'down';
        message = `${pair.tokenIn.ticker}/${pair.tokenOut.ticker} is ${direction} ${absChange.toFixed(1)}%`;
      }
    }
  }

  return {
    alert,
    shouldTrigger,
    currentRate,
    message,
  };
}

/**
 * Build notification payload for a triggered alert.
 */
export function buildNotification(
  result: AlertCheckResult,
  pair: TokenPair
): PriceAlertNotification {
  const { alert, message, currentRate } = result;

  return {
    alertId: alert.id,
    pairId: alert.pairId,
    title: 'Price Alert',
    body: `${message} (current: ${formatAlertRate(currentRate)})`,
    data: {
      type: 'price_alert',
      pairId: alert.pairId,
      alertId: alert.id,
    },
  };
}

/**
 * Format rate for display.
 */
export function formatAlertRate(rate: number): string {
  if (!isFinite(rate)) return '---';
  if (rate >= 1000) return rate.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (rate >= 1) return rate.toLocaleString('en-US', { maximumFractionDigits: 4 });
  return rate.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

/**
 * Get human-readable description of an alert.
 */
export function getAlertDescription(alert: PriceAlert): string {
  const { config } = alert;

  if (config.type === 'price_target') {
    const condition = config.condition === 'above' ? 'Above' : 'Below';
    return `${condition} ${formatAlertRate(config.targetRate)}`;
  } else {
    const direction =
      config.direction === 'up'
        ? '↑'
        : config.direction === 'down'
          ? '↓'
          : '↕';
    return `${direction} ${config.percentThreshold}%`;
  }
}

/**
 * Get alert type label.
 */
export function getAlertTypeLabel(alert: PriceAlert): string {
  return alert.config.type === 'price_target' ? 'Price Target' : '% Change';
}
