import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { getSaturationColor, getReasonLabel } from '../../lib/staking';
import type { PoolRecommendation } from '../../lib/staking';

interface PoolCardProps {
  recommendation: PoolRecommendation;
}

function PoolCardComponent({ recommendation }: PoolCardProps) {
  const { pool, reason, projectedAnnualYield, improvementVsCurrent } = recommendation;
  const saturationColor = getSaturationColor(pool.saturation);

  const improvementText =
    improvementVsCurrent > 0
      ? `+${improvementVsCurrent.toFixed(2)}%`
      : improvementVsCurrent.toFixed(2) + '%';

  const accessibilityLabel = `Pool ${pool.ticker}, ${pool.name}. ROA ${projectedAnnualYield.toFixed(2)}%, Saturation ${pool.saturation.toFixed(0)}%, Margin ${(pool.margin * 100).toFixed(1)}%, ${pool.lifetimeBlocks.toLocaleString()} blocks. ${getReasonLabel(reason)}, ${improvementText} vs current`;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.header}>
        <View style={styles.poolIdentity}>
          <Text style={styles.ticker}>[{pool.ticker}]</Text>
          <Text style={styles.name} numberOfLines={1}>
            {pool.name}
          </Text>
        </View>
        <View style={styles.roaContainer}>
          <Text style={styles.roaLabel}>ROA</Text>
          <Text style={styles.roaValue}>{projectedAnnualYield.toFixed(2)}%</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Saturation</Text>
          <Text style={[styles.statValue, { color: saturationColor }]}>
            {pool.saturation.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Margin</Text>
          <Text style={styles.statValue}>{(pool.margin * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Blocks</Text>
          <Text style={styles.statValue}>{pool.lifetimeBlocks.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.reasonBadge}>
          <Text style={styles.reasonText}>{getReasonLabel(reason)}</Text>
        </View>
        <Text
          style={[
            styles.improvement,
            { color: improvementVsCurrent > 0 ? cyberpunk.success : cyberpunk.textMuted },
          ]}
        >
          {improvementText} vs current
        </Text>
      </View>
    </View>
  );
}

/** Memoized PoolCard to optimize list rendering performance */
export const PoolCard = memo(PoolCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgElevated,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  poolIdentity: {
    flex: 1,
    marginRight: 12,
  },
  ticker: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.neonCyan,
    letterSpacing: 1,
  },
  name: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    marginTop: 2,
  },
  roaContainer: {
    alignItems: 'flex-end',
  },
  roaLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  roaValue: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.success,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reasonText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
    letterSpacing: 1,
  },
  improvement: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
  },
});
