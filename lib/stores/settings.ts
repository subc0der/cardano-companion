/**
 * Application settings store.
 * Centralized settings management with persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

/** Available currency display options */
export type CurrencyDisplay = 'ADA' | 'USD' | 'EUR' | 'GBP';

/** Available refresh interval options in milliseconds */
export const REFRESH_INTERVALS = {
  '30s': 30_000,
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
} as const;

export type RefreshIntervalKey = keyof typeof REFRESH_INTERVALS;

interface SettingsState {
  // Display settings
  /** Whether to show balances in compact format */
  compactBalances: boolean;
  /** Preferred currency display */
  currencyDisplay: CurrencyDisplay;

  // Game settings
  /** Whether haptic feedback is enabled */
  hapticsEnabled: boolean;

  // Data settings
  /** Auto-refresh interval for portfolio data */
  refreshInterval: RefreshIntervalKey;

  // Actions
  toggleCompactBalances: () => void;
  setCurrencyDisplay: (currency: CurrencyDisplay) => void;
  toggleHapticsEnabled: () => void;
  setRefreshInterval: (interval: RefreshIntervalKey) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  compactBalances: false,
  currencyDisplay: 'ADA' as CurrencyDisplay,
  hapticsEnabled: true,
  refreshInterval: '1m' as RefreshIntervalKey,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      toggleCompactBalances: () =>
        set((state) => ({ compactBalances: !state.compactBalances })),

      setCurrencyDisplay: (currency) =>
        set({ currencyDisplay: currency }),

      toggleHapticsEnabled: () =>
        set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),

      setRefreshInterval: (interval) =>
        set({ refreshInterval: interval }),

      resetToDefaults: () =>
        set(DEFAULT_SETTINGS),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
