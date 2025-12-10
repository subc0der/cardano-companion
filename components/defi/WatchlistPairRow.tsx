import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import type { TokenPair } from '../../lib/defi/types';

interface WatchlistPairRowProps {
  pair: TokenPair;
  onPress: (pair: TokenPair) => void;
  onRemove: (pairId: string) => void;
  isLoading?: boolean;
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function WatchlistPairRow({ pair, onPress, onRemove, isLoading = false }: WatchlistPairRowProps) {
  const isStale = pair.lastUpdated
    ? Date.now() - pair.lastUpdated > STALE_THRESHOLD_MS
    : false;

  const formatRate = (rate: number | null): string => {
    if (rate === null || !isFinite(rate)) return '---';
    if (rate >= 1000) return rate.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (rate >= 1) return rate.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return rate.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  const formatChange = (change: number | null): string => {
    if (change === null || !isFinite(change)) return 'N/A';
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number | null): string => {
    if (change === null || !isFinite(change)) return cyberpunk.textMuted;
    if (change > 0) return cyberpunk.success;
    if (change < 0) return cyberpunk.error;
    return cyberpunk.textSecondary;
  };

  const getChangeIcon = (change: number | null): 'caret-up' | 'caret-down' | 'remove' => {
    if (change === null || !isFinite(change)) return 'remove';
    if (change > 0) return 'caret-up';
    if (change < 0) return 'caret-down';
    return 'remove';
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(pair)}
      accessibilityRole="button"
      accessibilityLabel={`${pair.tokenIn.ticker} to ${pair.tokenOut.ticker} pair`}
    >
      {/* Token Pair Info */}
      <View style={styles.pairInfo}>
        <View style={styles.pairHeader}>
          <Text style={styles.pairTickers}>
            {pair.tokenIn.ticker} <Text style={styles.arrow}>→</Text> {pair.tokenOut.ticker}
          </Text>
          {isStale && (
            <View style={styles.staleBadge}>
              <Text style={styles.staleText}>STALE</Text>
            </View>
          )}
        </View>
        <Text style={styles.rateText}>
          1 {pair.tokenIn.ticker} = {formatRate(pair.lastRate)} {pair.tokenOut.ticker}
        </Text>
      </View>

      {/* Price Change */}
      <View style={styles.changeContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={cyberpunk.neonCyan} />
        ) : (
          <>
            <Ionicons
              name={getChangeIcon(pair.priceChange24h)}
              size={14}
              color={getChangeColor(pair.priceChange24h)}
            />
            <Text style={[styles.changeText, { color: getChangeColor(pair.priceChange24h) }]}>
              {formatChange(pair.priceChange24h)}
            </Text>
          </>
        )}
      </View>

      {/* Remove Button */}
      <Pressable
        style={styles.removeButton}
        onPress={(e: GestureResponderEvent) => {
          e.stopPropagation();
          onRemove(pair.id);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${pair.tokenIn.ticker} to ${pair.tokenOut.ticker} pair`}
      >
        <Ionicons name="trash-outline" size={18} color={cyberpunk.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    padding: 12,
    gap: 12,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: cyberpunk.bgTertiary,
  },
  pairInfo: {
    flex: 1,
    gap: 4,
  },
  pairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pairTickers: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  arrow: {
    color: cyberpunk.neonCyan,
  },
  staleBadge: {
    backgroundColor: cyberpunk.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  staleText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.bgPrimary,
    letterSpacing: 1,
  },
  rateText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
    justifyContent: 'flex-end',
  },
  changeText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
  },
  removeButton: {
    padding: 4,
  },
});
