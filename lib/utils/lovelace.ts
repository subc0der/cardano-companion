/**
 * Lovelace utility functions using BigInt for precision.
 * Cardano amounts can exceed Number.MAX_SAFE_INTEGER, so we use BigInt.
 */

import { LOVELACE_PER_ADA } from '../staking/constants';

/**
 * Convert lovelace string to ADA number for display.
 * Uses BigInt division to maintain precision for large values.
 * Only use for display purposes - calculations should use BigInt directly.
 */
export function lovelaceToAda(lovelace: string): number {
  const value = BigInt(lovelace || '0');
  // Split into whole ADA and remainder to avoid precision loss
  const wholeAda = value / LOVELACE_PER_ADA;
  const remainder = value % LOVELACE_PER_ADA;
  // Combine: whole part is safe, remainder is always < 1M so safe to convert
  return Number(wholeAda) + Number(remainder) / Number(LOVELACE_PER_ADA);
}

/**
 * Format lovelace as ADA with thousand separators.
 */
export function formatAda(lovelace: string, decimals: number = 2): string {
  const ada = lovelaceToAda(lovelace);
  return ada.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format lovelace as ADA with short notation (k, M).
 */
export function formatAdaShort(lovelace: string): string {
  const ada = lovelaceToAda(lovelace);
  if (ada >= 1_000_000) {
    return `${(ada / 1_000_000).toFixed(1)}M`;
  }
  if (ada >= 1_000) {
    return `${(ada / 1_000).toFixed(1)}k`;
  }
  if (ada >= 100) {
    return ada.toFixed(0);
  }
  if (ada >= 10) {
    return ada.toFixed(1);
  }
  return ada.toFixed(2);
}

/**
 * Sum lovelace amounts using BigInt for precision.
 */
export function sumLovelace(amounts: string[]): string {
  const total = amounts.reduce((sum, amt) => sum + BigInt(amt || '0'), 0n);
  return total.toString();
}

/**
 * Calculate average lovelace amount.
 */
export function averageLovelace(amounts: string[]): string {
  if (amounts.length === 0) return '0';
  const total = amounts.reduce((sum, amt) => sum + BigInt(amt || '0'), 0n);
  const avg = total / BigInt(amounts.length);
  return avg.toString();
}

/**
 * Find maximum lovelace amount.
 */
export function maxLovelace(amounts: string[]): string {
  if (amounts.length === 0) return '0';
  let max = BigInt(amounts[0] || '0');
  for (const amt of amounts) {
    const value = BigInt(amt || '0');
    if (value > max) max = value;
  }
  return max.toString();
}
