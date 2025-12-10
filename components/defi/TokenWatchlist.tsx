import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { useWatchlistStore } from '../../lib/stores/defiWatchlistStore';
import { getSwapEstimate } from '../../lib/defi/aggregator-api';
import { DEFI_CONFIG } from '../../lib/defi/constants';
import type { Token, TokenPair } from '../../lib/defi/types';
import { WatchlistPairRow } from './WatchlistPairRow';
import { TokenSelector } from './TokenSelector';

interface TokenWatchlistProps {
  onSelectPair: (tokenIn: Token, tokenOut: Token) => void;
}

type AddStep = 'idle' | 'selectFrom' | 'selectTo';

export function TokenWatchlist({ onSelectPair }: TokenWatchlistProps) {
  const { pairs, addPair, removePair, updatePairRate, hasPair } = useWatchlistStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingPairId, setRefreshingPairId] = useState<string | null>(null);
  const [addStep, setAddStep] = useState<AddStep>('idle');
  const [pendingTokenIn, setPendingTokenIn] = useState<Token | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if component is mounted for async cleanup
  const isMounted = useRef(true);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        setToastMessage(null);
      }
    }, 3000);
  }, []);

  // Refresh prices on mount (only once)
  const hasInitialRefresh = useRef(false);
  useEffect(() => {
    if (pairs.length > 0 && !hasInitialRefresh.current) {
      hasInitialRefresh.current = true;
      refreshPrices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.length]);

  const refreshPrices = useCallback(async () => {
    // Prevent overlapping refresh calls
    if (isRefreshingRef.current) return;
    if (pairs.length === 0) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    // Queue price updates with rate limiting (2s minimum between requests)
    for (const pair of pairs) {
      if (!isMounted.current) break;

      setRefreshingPairId(pair.id);

      try {
        // Use 1 whole unit of tokenIn (not 1 lovelace) to get a meaningful rate
        // For ADA this is 1 ADA, for other tokens it's 1 token
        const oneUnit = Math.pow(10, pair.tokenIn.decimals).toString();
        const quote = await getSwapEstimate({
          tokenIn: pair.tokenIn.id,
          tokenOut: pair.tokenOut.id,
          amountIn: oneUnit,
        });

        if (!isMounted.current) break;

        // Calculate rate: amountOut per 1 tokenIn (adjusted for decimals)
        const amountOutNum = Number(quote.amountOut) / Math.pow(10, pair.tokenOut.decimals);
        const rate = amountOutNum;

        // Calculate price change since last update.
        // NOTE: This is NOT a true 24h change - it measures change since last update,
        // which may be any interval. Field is named priceChange24h for UI consistency.
        let priceChange24h: number | null = null;
        if (pair.lastRate !== null && pair.lastRate !== 0 && pair.lastUpdated !== null) {
          const hoursSinceUpdate = (Date.now() - pair.lastUpdated) / (1000 * 60 * 60);
          // Only calculate change if we have data from at least 1 hour ago
          if (hoursSinceUpdate >= 1) {
            priceChange24h = ((rate - pair.lastRate) / pair.lastRate) * 100;
          } else {
            // Preserve existing change if we're updating frequently
            priceChange24h = pair.priceChange24h;
          }
        }

        updatePairRate(pair.id, rate, priceChange24h);
      } catch (error) {
        // Silently fail for pairs without liquidity - just skip them
        // This is expected for non-ADA pairs without direct pools
      }
    }

    if (isMounted.current) {
      setRefreshingPairId(null);
    }

    if (isMounted.current) {
      setIsRefreshing(false);
    }
    isRefreshingRef.current = false;
  }, [pairs, updatePairRate]);

  const handlePairPress = useCallback((pair: TokenPair) => {
    onSelectPair(pair.tokenIn, pair.tokenOut);
  }, [onSelectPair]);

  const handleRemovePair = useCallback((pairId: string) => {
    removePair(pairId);
  }, [removePair]);

  const handleAddPress = useCallback(() => {
    setAddStep('selectFrom');
  }, []);

  const handleSelectFromToken = useCallback((token: Token) => {
    setPendingTokenIn(token);
    setAddStep('selectTo');
  }, []);

  const handleSelectToToken = useCallback((token: Token) => {
    if (pendingTokenIn) {
      // Check if pair already exists
      if (hasPair(pendingTokenIn.id, token.id)) {
        showToast(`${pendingTokenIn.ticker}/${token.ticker} is already in your watchlist`);
        setAddStep('idle');
        setPendingTokenIn(null);
        return;
      }

      const success = addPair(pendingTokenIn, token);
      if (success) {
        // Immediately fetch price for new pair
        refreshPrices();
      } else {
        // addPair returns false when capacity limit is reached
        showToast(`Watchlist is full (max ${DEFI_CONFIG.MAX_WATCHLIST_PAIRS} pairs)`);
      }
    }
    setAddStep('idle');
    setPendingTokenIn(null);
  }, [pendingTokenIn, addPair, hasPair, refreshPrices, showToast]);

  const handleCloseFromSelector = useCallback(() => {
    setAddStep('idle');
    setPendingTokenIn(null);
  }, []);

  const handleCloseToSelector = useCallback(() => {
    setAddStep('idle');
    setPendingTokenIn(null);
  }, []);

  const canAddMore = pairs.length < DEFI_CONFIG.MAX_WATCHLIST_PAIRS;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>WATCHLIST</Text>
          <Text style={styles.headerCount}>
            ({pairs.length}/{DEFI_CONFIG.MAX_WATCHLIST_PAIRS})
          </Text>
        </View>
        {pairs.length > 0 && (
          <Pressable
            style={styles.refreshButton}
            onPress={refreshPrices}
            disabled={isRefreshing}
            accessibilityRole="button"
            accessibilityLabel="Refresh prices"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={cyberpunk.neonCyan} />
            ) : (
              <Ionicons name="refresh" size={18} color={cyberpunk.neonCyan} />
            )}
          </Pressable>
        )}
      </View>

      {/* Pair List */}
      {pairs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="eye-outline" size={48} color={cyberpunk.textMuted} />
          <Text style={styles.emptyTitle}>No pairs saved</Text>
          <Text style={styles.emptySubtitle}>
            Add token pairs to track their exchange rates
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {pairs.map((pair) => (
            <WatchlistPairRow
              key={pair.id}
              pair={pair}
              onPress={handlePairPress}
              onRemove={handleRemovePair}
              isLoading={refreshingPairId === pair.id}
            />
          ))}
        </ScrollView>
      )}

      {/* Add Pair Button */}
      {canAddMore && (
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={handleAddPress}
          accessibilityRole="button"
          accessibilityLabel="Add token pair"
        >
          <Ionicons name="add" size={20} color={cyberpunk.neonCyan} />
          <Text style={styles.addButtonText}>ADD PAIR</Text>
        </Pressable>
      )}

      {!canAddMore && (
        <View style={styles.maxReachedBanner}>
          <Ionicons name="information-circle" size={16} color={cyberpunk.warning} />
          <Text style={styles.maxReachedText}>
            Maximum {DEFI_CONFIG.MAX_WATCHLIST_PAIRS} pairs reached
          </Text>
        </View>
      )}

      {/* Token Selector for FROM token */}
      <TokenSelector
        visible={addStep === 'selectFrom'}
        onSelect={handleSelectFromToken}
        onClose={handleCloseFromSelector}
        title="SELECT FROM TOKEN"
      />

      {/* Token Selector for TO token */}
      <TokenSelector
        visible={addStep === 'selectTo'}
        onSelect={handleSelectToToken}
        onClose={handleCloseToSelector}
        title="SELECT TO TOKEN"
        excludeTokenId={pendingTokenIn?.id}
      />

      {/* Toast notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="information-circle" size={16} color={cyberpunk.textPrimary} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: cyberpunk.bgTertiary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    color: cyberpunk.textPrimary,
    letterSpacing: 2,
  },
  headerCount: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
  },
  refreshButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.textSecondary,
    letterSpacing: 1,
  },
  emptySubtitle: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cyberpunk.bgSecondary,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  addButtonPressed: {
    backgroundColor: cyberpunk.bgTertiary,
    opacity: 0.8,
  },
  addButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
  },
  maxReachedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  maxReachedText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.warning,
  },
  toast: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cyberpunk.bgTertiary,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    borderRadius: 8,
    padding: 12,
  },
  toastText: {
    flex: 1,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
  },
});
