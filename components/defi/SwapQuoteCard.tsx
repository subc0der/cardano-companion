import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import {
  type SwapQuote,
  DEX_INFO,
  DEX_SWAP_URLS,
  formatTokenAmount,
} from '../../lib/defi';

interface SwapQuoteCardProps {
  quote: SwapQuote | null;
  loading?: boolean;
  error?: string | null;
}

export function SwapQuoteCard({ quote, loading, error }: SwapQuoteCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>FETCHING BEST RATE...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Enter an amount to see quotes</Text>
        </View>
      </View>
    );
  }

  const dexInfo = DEX_INFO[quote.bestProtocol];
  const amountOutFormatted = formatTokenAmount(quote.amountOut, quote.tokenOut.decimals);
  const feeFormatted = formatTokenAmount(quote.totalFee, 6); // Fees in lovelace
  const priceImpactPercent = (quote.priceImpact * 100).toFixed(2);

  // Determine price impact severity
  const getPriceImpactColor = () => {
    if (quote.priceImpact < 0.01) return cyberpunk.success;
    if (quote.priceImpact < 0.03) return cyberpunk.warning;
    return cyberpunk.error;
  };

  const handleSwapPress = async () => {
    const getUrl = DEX_SWAP_URLS[quote.bestProtocol];
    if (getUrl) {
      const url = getUrl(quote.tokenIn.id, quote.tokenOut.id);
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch {
        // Silently fail - user can manually navigate
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Best Rate Badge */}
      <View style={[styles.dexBadge, { backgroundColor: dexInfo.color }]}>
        <Text style={styles.dexBadgeText}>BEST: {dexInfo.shortName}</Text>
      </View>

      {/* Output Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>YOU RECEIVE</Text>
        <Text style={styles.amountValue}>
          {amountOutFormatted} <Text style={styles.tokenTicker}>{quote.tokenOut.ticker}</Text>
        </Text>
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price Impact</Text>
          <Text style={[styles.detailValue, { color: getPriceImpactColor() }]}>
            {priceImpactPercent}%
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network Fee</Text>
          <Text style={styles.detailValue}>{feeFormatted} ADA</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Route</Text>
          <Text style={styles.detailValue}>
            {quote.routes.length === 1 ? 'Direct' : `${quote.routes.length} hops`}
          </Text>
        </View>
      </View>

      {/* Swap Button */}
      <Pressable
        style={styles.swapButton}
        onPress={handleSwapPress}
        accessibilityRole="button"
        accessibilityLabel={`Swap on ${dexInfo.name}`}
      >
        <Text style={styles.swapButtonText}>SWAP ON {dexInfo.shortName} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    letterSpacing: 2,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    textAlign: 'center',
  },
  dexBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    margin: 12,
    borderRadius: 4,
  },
  dexBadgeText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  amountContainer: {
    padding: 16,
    paddingTop: 0,
  },
  amountLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  amountValue: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: cyberpunk.neonCyan,
    textShadowColor: cyberpunk.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tokenTicker: {
    fontSize: typography.sizes.lg,
    color: cyberpunk.textSecondary,
  },
  detailsContainer: {
    backgroundColor: cyberpunk.bgPrimary,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  detailValue: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textPrimary,
  },
  swapButton: {
    backgroundColor: cyberpunk.bgTertiary,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: cyberpunk.bgTertiary,
  },
  swapButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
  },
});
