/**
 * Centralized AsyncStorage Keys
 *
 * All storage keys are defined here to prevent collisions
 * and make it easy to audit what data the app persists.
 */

export const STORAGE_KEYS = {
  /** Wallet address and stake address */
  WALLET: 'wallet-storage',

  /** Privacy settings (hide balances, addresses) */
  PRIVACY: 'privacy-storage',

  /** App settings (currency, haptics, refresh interval) */
  SETTINGS: 'settings-storage',

  /** ADA Rollz game state and points */
  GAME: 'ada-rollz-storage',

  /** DeFi watchlist token pairs */
  DEFI_WATCHLIST: 'defi-watchlist-storage',

  /** Price alerts for watchlist pairs */
  PRICE_ALERTS: 'price-alerts-storage',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
