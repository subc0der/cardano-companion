import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ActivityIndicator } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import {
  type DEXComparison,
  type Token,
  DEX_INFO,
  DEX_SWAP_URLS,
  DEFI_CONFIG,
  formatTokenAmount,
} from '../../lib/defi';

interface DEXComparisonTableProps {
  comparisons: DEXComparison[];
  tokenOut: Token;
  tokenIn: Token;
  loading?: boolean;
  error?: string | null;
}

export function DEXComparisonTable({
  comparisons,
  tokenOut,
  tokenIn,
  loading,
  error,
}: DEXComparisonTableProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>COMPARING DEXES</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={cyberpunk.neonCyan} />
          <Text style={styles.loadingText}>Fetching rates from all DEXes...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>DEX COMPARISON</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (comparisons.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>DEX COMPARISON</Text>
        <Text style={styles.emptyText}>No quotes available for this pair</Text>
      </View>
    );
  }

  // Sort by amount out (best first)
  const sortedComparisons = [...comparisons]
    .filter((c) => c.available)
    .sort((a, b) => {
      const aAmount = BigInt(a.amountOut);
      const bAmount = BigInt(b.amountOut);
      return bAmount > aAmount ? 1 : bAmount < aAmount ? -1 : 0;
    });

  // Mark best rate
  if (sortedComparisons.length > 0) {
    sortedComparisons[0].isBest = true;
  }

  const handleDexPress = async (dex: DEXComparison) => {
    const getUrl = DEX_SWAP_URLS[dex.protocol];
    if (getUrl) {
      const url = getUrl(tokenIn.id, tokenOut.id);
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.error('[DeFi] Failed to open DEX link:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DEX COMPARISON</Text>

      {sortedComparisons.map((comparison, index) => {
        const dexInfo = DEX_INFO[comparison.protocol];
        const amountOut = formatTokenAmount(comparison.amountOut, tokenOut.decimals);
        const priceImpact = (comparison.priceImpact * 100).toFixed(2);

        // Calculate difference from best
        let diffPercent = '';
        if (index > 0 && sortedComparisons[0]) {
          const bestAmount = BigInt(sortedComparisons[0].amountOut);
          const thisAmount = BigInt(comparison.amountOut);
          if (bestAmount > 0) {
            const diff = ((bestAmount - thisAmount) * DEFI_CONFIG.PERCENT_BIGINT_MULTIPLIER) / bestAmount;
            diffPercent = `-${(Number(diff) / 100).toFixed(2)}%`;
          }
        }

        return (
          <Pressable
            key={comparison.protocol}
            style={[
              styles.dexRow,
              comparison.isBest && styles.dexRowBest,
            ]}
            onPress={() => handleDexPress(comparison)}
            accessibilityRole="button"
            accessibilityLabel={`${dexInfo.name}: ${amountOut} ${tokenOut.ticker}`}
          >
            {/* DEX Name */}
            <View style={styles.dexInfo}>
              <View style={[styles.dexDot, { backgroundColor: dexInfo.color }]} />
              <Text style={styles.dexName}>{dexInfo.shortName}</Text>
              {comparison.isBest && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>BEST</Text>
                </View>
              )}
            </View>

            {/* Amount Out */}
            <View style={styles.amountContainer}>
              <Text style={[styles.amountText, comparison.isBest && styles.amountTextBest]}>
                {amountOut}
              </Text>
              <Text style={styles.tokenText}>{tokenOut.ticker}</Text>
            </View>

            {/* Difference / Impact */}
            <View style={styles.statsContainer}>
              {diffPercent ? (
                <Text style={styles.diffText}>{diffPercent}</Text>
              ) : (
                <Text style={styles.impactText}>{priceImpact}%</Text>
              )}
            </View>
          </Pressable>
        );
      })}

      {/* Unavailable DEXes */}
      {comparisons.filter((c) => !c.available).length > 0 && (
        <View style={styles.unavailableSection}>
          <Text style={styles.unavailableTitle}>Unavailable</Text>
          {comparisons
            .filter((c) => !c.available)
            .map((comparison) => {
              const dexInfo = DEX_INFO[comparison.protocol];
              return (
                <View key={comparison.protocol} style={styles.unavailableRow}>
                  <View style={[styles.dexDot, { backgroundColor: cyberpunk.textMuted }]} />
                  <Text style={styles.unavailableName}>{dexInfo.shortName}</Text>
                  <Text style={styles.unavailableReason}>
                    {comparison.reason || 'No liquidity'}
                  </Text>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  errorText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    textAlign: 'center',
    padding: 20,
  },
  dexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cyberpunk.bgPrimary,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  dexRowBest: {
    borderColor: cyberpunk.neonCyan,
  },
  dexInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dexDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dexName: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  bestBadge: {
    backgroundColor: cyberpunk.success,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  bestBadgeText: {
    fontFamily: typography.fonts.primary,
    fontSize: 8,
    color: cyberpunk.bgPrimary,
    letterSpacing: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  amountText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textPrimary,
  },
  amountTextBest: {
    color: cyberpunk.neonCyan,
  },
  tokenText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  statsContainer: {
    alignItems: 'flex-end',
    minWidth: 50,
  },
  diffText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.error,
  },
  impactText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  unavailableSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: cyberpunk.bgTertiary,
  },
  unavailableTitle: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginBottom: 8,
  },
  unavailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  unavailableName: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  unavailableReason: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
});
