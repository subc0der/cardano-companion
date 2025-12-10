/**
 * DeFi Watchlist Store - Persist Saved Token Pairs
 *
 * Manages user's saved token pairs for quick price monitoring.
 * Uses Zustand with AsyncStorage persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Token, TokenPair } from '../defi/types';
import { DEFI_CONFIG } from '../defi/constants';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface WatchlistState {
  /** Saved token pairs (max 10) */
  pairs: TokenPair[];

  /** Add a new token pair to watchlist */
  addPair: (tokenIn: Token, tokenOut: Token) => boolean;

  /** Remove a pair by ID */
  removePair: (pairId: string) => void;

  /** Update price data for a pair */
  updatePairRate: (
    pairId: string,
    rate: number,
    priceChange24h: number | null
  ) => void;

  /** Check if a pair exists in watchlist */
  hasPair: (tokenInId: string, tokenOutId: string) => boolean;

  /** Clear all pairs */
  clearWatchlist: () => void;
}

/**
 * Generate unique ID for a token pair.
 */
function generatePairId(tokenInId: string, tokenOutId: string): string {
  return `${tokenInId}::${tokenOutId}`;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      pairs: [],

      addPair: (tokenIn: Token, tokenOut: Token) => {
        const { pairs, hasPair } = get();

        // Check max limit
        if (pairs.length >= DEFI_CONFIG.MAX_WATCHLIST_PAIRS) {
          return false;
        }

        // Check for duplicate
        if (hasPair(tokenIn.id, tokenOut.id)) {
          return false;
        }

        const newPair: TokenPair = {
          id: generatePairId(tokenIn.id, tokenOut.id),
          tokenIn,
          tokenOut,
          lastRate: null,
          lastUpdated: null,
          priceChange24h: null,
        };

        set({ pairs: [...pairs, newPair] });
        return true;
      },

      removePair: (pairId: string) => {
        const { pairs } = get();
        set({ pairs: pairs.filter((p) => p.id !== pairId) });
      },

      updatePairRate: (
        pairId: string,
        rate: number,
        priceChange24h: number | null
      ) => {
        const { pairs } = get();
        set({
          pairs: pairs.map((p) =>
            p.id === pairId
              ? {
                  ...p,
                  lastRate: rate,
                  lastUpdated: Date.now(),
                  priceChange24h,
                }
              : p
          ),
        });
      },

      hasPair: (tokenInId: string, tokenOutId: string) => {
        const { pairs } = get();
        const pairId = generatePairId(tokenInId, tokenOutId);
        return pairs.some((p) => p.id === pairId);
      },

      clearWatchlist: () => {
        set({ pairs: [] });
      },
    }),
    {
      name: STORAGE_KEYS.DEFI_WATCHLIST,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
