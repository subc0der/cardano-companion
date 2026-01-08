import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ActivityIndicator, Alert } from 'react-native';
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
        } else {
          Alert.alert('Unable to Open', 'Could not open the DEX link. Please try again.');
        }
      } catch {
        Alert.alert('Unable to Open', 'Could not open the DEX link. Please try again.');
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
            {/* Header: DEX Name + Badge */}
            <View style={styles.dexHeader}>
              <View style={styles.dexInfo}>
                <View style={[styles.dexDot, { backgroundColor: dexInfo.color }]} />
                <Text style={styles.dexName}>{dexInfo.shortName}</Text>
              </View>
              {comparison.isBest && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>BEST</Text>
                </View>
              )}
            </View>

            {/* Amount Row */}
            <View style={styles.amountRow}>
              <Text style={[styles.amountText, comparison.isBest && styles.amountTextBest]}>
                {amountOut}
              </Text>
              <Text style={styles.tokenText}>{tokenOut.ticker}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Price Impact</Text>
              {diffPercent ? (
                <Text style={styles.diffText}>{diffPercent} vs best</Text>
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
                  <View style={[styles.dexDot, { backgroundColor: cyberpunk.electricBlue }]} />
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
    borderColor: cyberpunk.neonCyan,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
    letterSpacing: 2,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.electricBlue,
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
    color: cyberpunk.electricBlue,
    textAlign: 'center',
    padding: 20,
  },
  dexRow: {
    backgroundColor: cyberpunk.bgPrimary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  dexRowBest: {
    borderColor: cyberpunk.neonCyan,
  },
  dexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dexInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dexDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dexName: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  bestBadge: {
    backgroundColor: cyberpunk.success,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  bestBadgeText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.bgPrimary,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  amountText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: cyberpunk.textPrimary,
  },
  amountTextBest: {
    color: cyberpunk.neonCyan,
    textShadowColor: cyberpunk.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tokenText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.md,
    color: cyberpunk.electricBlue,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
  },
  diffText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.error,
  },
  impactText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.success,
  },
  unavailableSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: cyberpunk.bgTertiary,
  },
  unavailableTitle: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
    marginBottom: 8,
  },
  unavailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  unavailableName: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
  },
  unavailableReason: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
    fontStyle: 'italic',
    flex: 1,
  },
});
