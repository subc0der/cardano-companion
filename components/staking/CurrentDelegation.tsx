import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { formatAda } from '../../lib/utils/lovelace';
import { stakingApi, STAKING_CONFIG, getSaturationColor, getPoolStatus } from '../../lib/staking';
import { usePoolAlerts } from '../../lib/hooks/usePoolAlerts';
import { AlertBanner } from './AlertBanner';
import type { DelegationInfo } from '../../lib/staking';

interface CurrentDelegationProps {
  stakeAddress: string;
  /** Optional delegation data passed from parent to avoid duplicate queries */
  delegation?: DelegationInfo;
  /** Loading state when delegation is passed from parent */
  isLoading?: boolean;
  /** Error state when delegation is passed from parent */
  error?: Error | null;
}

export function CurrentDelegation({
  stakeAddress,
  delegation,
  isLoading: delegationLoading = false,
  error: delegationError = null,
}: CurrentDelegationProps) {

  // Dependent query: only runs when delegation has a poolId
  // queryKey includes poolId so it refetches when pool changes
  const poolId = delegation?.poolId;
  const {
    data: pool,
    isLoading: poolLoading,
    error: poolError,
  } = useQuery({
    queryKey: ['pool', poolId],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      if (!id) throw new Error('No pool ID');
      return stakingApi.getPoolDetails(id as string);
    },
    enabled: !!poolId,
    staleTime: STAKING_CONFIG.POOL_DETAILS_CACHE_TTL_MS,
  });

  const isLoading = delegationLoading || poolLoading;
  const error = delegationError || poolError;

  // Hook must be called unconditionally before any early returns
  const { alerts, hasAny: hasAlerts } = usePoolAlerts(pool);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={cyberpunk.neonCyan} />
          <Text style={styles.loadingText}>Loading delegation...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Failed to load delegation'}
        </Text>
      </View>
    );
  }

  if (!delegation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No delegation data available</Text>
      </View>
    );
  }

  if (!delegation.poolId) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>YOUR DELEGATION</Text>
        <View style={styles.notDelegatingContainer}>
          <Text style={styles.notDelegatingText}>NOT DELEGATING</Text>
          <Text style={styles.notDelegatingHint}>
            Delegate your ADA to a stake pool to earn rewards
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Available Balance</Text>
            <Text style={styles.statValue}>{formatAda(delegation.activeStake)} ADA</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!pool) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>YOUR DELEGATION</Text>
        <Text style={styles.errorText}>Loading pool details...</Text>
      </View>
    );
  }

  const status = getPoolStatus(pool);
  const saturationColor = getSaturationColor(pool.saturation);
  const saturationWidth = Math.min(pool.saturation, 100);

  const accessibilityLabel = `Your delegation to pool ${pool.ticker}, saturation ${pool.saturation.toFixed(1)}%, ROA ${pool.isHistoryComplete ? pool.last10EpochsROA.toFixed(2) + '%' : 'unavailable'}${hasAlerts ? `, ${alerts.length} alert${alerts.length > 1 ? 's' : ''}` : ''}`;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.sectionTitle}>YOUR DELEGATION</Text>

      <View style={styles.poolHeader}>
        <View style={styles.poolIdentity}>
          <Text style={styles.poolTicker}>[{pool.ticker}]</Text>
          <Text style={styles.poolName} numberOfLines={1}>
            {pool.name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: status.color }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>
      </View>

      {hasAlerts && (
        <View style={styles.alertsContainer}>
          <AlertBanner alerts={alerts} />
        </View>
      )}

      <View style={styles.saturationContainer}>
        <View style={styles.saturationHeader}>
          <Text style={styles.saturationLabel}>Saturation</Text>
          <Text style={[styles.saturationValue, { color: saturationColor }]}>
            {pool.saturation.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.saturationBarBg}>
          <View
            style={[
              styles.saturationBarFill,
              { width: `${saturationWidth}%`, backgroundColor: saturationColor },
            ]}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Your Stake</Text>
          <Text style={styles.statValue}>{formatAda(delegation.activeStake)} ADA</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Withdrawable</Text>
          <Text style={styles.statValue}>{formatAda(delegation.rewards)} ADA</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>ROA (10 epochs)</Text>
          <Text style={styles.statValue}>
            {pool.isHistoryComplete ? `${pool.last10EpochsROA.toFixed(2)}%` : 'N/A'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Pool Margin</Text>
          <Text style={styles.statValue}>{(pool.margin * 100).toFixed(1)}%</Text>
        </View>
      </View>

      {!pool.isHistoryComplete && (
        <Text style={styles.warningText}>
          ROA data unavailable - history fetch failed
        </Text>
      )}

      <View style={styles.rewardsTotal}>
        <Text style={styles.rewardsTotalLabel}>Total Rewards Earned</Text>
        <Text style={styles.rewardsTotalValue}>
          {formatAda(delegation.totalRewardsEarned)} ADA
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
  },
  errorText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    textAlign: 'center',
    paddingVertical: 16,
  },
  warningText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.warning,
    textAlign: 'center',
    marginBottom: 12,
  },
  notDelegatingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  notDelegatingText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.warning,
    letterSpacing: 2,
    marginBottom: 8,
  },
  notDelegatingHint: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    textAlign: 'center',
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  poolIdentity: {
    flex: 1,
    marginRight: 12,
  },
  poolTicker: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.neonMagenta,
    letterSpacing: 1,
  },
  poolName: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    letterSpacing: 1,
  },
  alertsContainer: {
    marginBottom: 16,
  },
  saturationContainer: {
    marginBottom: 16,
  },
  saturationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  saturationLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
  },
  saturationValue: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
  },
  saturationBarBg: {
    height: 8,
    backgroundColor: cyberpunk.bgTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  saturationBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: cyberpunk.bgTertiary,
    borderRadius: 4,
    padding: 12,
  },
  statLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    color: cyberpunk.textPrimary,
  },
  rewardsTotal: {
    backgroundColor: cyberpunk.bgTertiary,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  rewardsTotalLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginBottom: 4,
  },
  rewardsTotalValue: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.success,
  },
});
