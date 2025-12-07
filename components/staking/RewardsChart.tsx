import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { formatAdaShort, sumLovelace, averageLovelace, maxLovelace } from '../../lib/utils/lovelace';
import { stakingApi, STAKING_CONFIG } from '../../lib/staking';
import type { EpochReward } from '../../lib/staking';

interface RewardsChartProps {
  stakeAddress: string;
}

/** Chart dimension constants */
const CHART_HEIGHT = 120;
const BAR_GAP = 4;
const LABEL_HEIGHT = 20;
const Y_AXIS_WIDTH = 50;
const CHART_WIDTH = 300;
const MIN_BAR_WIDTH = 8;

export function RewardsChart({ stakeAddress }: RewardsChartProps) {
  const {
    data: rewards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rewards', stakeAddress],
    queryFn: () => stakingApi.getRewardHistory(stakeAddress, STAKING_CONFIG.REWARDS_CHART_EPOCHS),
    staleTime: STAKING_CONFIG.POOL_DETAILS_CACHE_TTL_MS,
  });

  // Memoize chart data and calculations to prevent re-computation on every render
  const { chartData, stats, barWidth } = useMemo(() => {
    if (!rewards || rewards.length === 0) {
      return { chartData: [], stats: { total: '0', average: '0', max: '0' }, barWidth: MIN_BAR_WIDTH };
    }

    // Reverse to show oldest first (left to right)
    const data = [...rewards].reverse();
    const amounts = data.map((r) => r.amount);

    const calculatedStats = {
      total: sumLovelace(amounts),
      average: averageLovelace(amounts),
      max: maxLovelace(amounts),
    };

    const availableWidth = CHART_WIDTH - Y_AXIS_WIDTH;
    const calculatedBarWidth = Math.max(
      (availableWidth - BAR_GAP * (data.length - 1)) / data.length,
      MIN_BAR_WIDTH
    );

    return { chartData: data, stats: calculatedStats, barWidth: calculatedBarWidth };
  }, [rewards]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>REWARDS HISTORY</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={cyberpunk.neonMagenta} />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>REWARDS HISTORY</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Failed to load rewards'}
        </Text>
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>REWARDS HISTORY</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reward history available</Text>
          <Text style={styles.emptyHint}>
            Rewards appear after your first epoch of delegation
          </Text>
        </View>
      </View>
    );
  }

  const maxAmount = BigInt(stats.max);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>REWARDS HISTORY</Text>

      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT + LABEL_HEIGHT}>
          {/* Y-axis labels */}
          <SvgText
            x={Y_AXIS_WIDTH - 8}
            y={12}
            fill={cyberpunk.textMuted}
            fontSize={10}
            fontFamily={typography.fonts.mono}
            textAnchor="end"
          >
            {formatAdaShort(stats.max)}
          </SvgText>
          <SvgText
            x={Y_AXIS_WIDTH - 8}
            y={CHART_HEIGHT / 2}
            fill={cyberpunk.textMuted}
            fontSize={10}
            fontFamily={typography.fonts.mono}
            textAnchor="end"
          >
            {formatAdaShort((BigInt(stats.max) / 2n).toString())}
          </SvgText>
          <SvgText
            x={Y_AXIS_WIDTH - 8}
            y={CHART_HEIGHT - 4}
            fill={cyberpunk.textMuted}
            fontSize={10}
            fontFamily={typography.fonts.mono}
            textAnchor="end"
          >
            0
          </SvgText>

          {/* Horizontal grid lines */}
          <Line
            x1={Y_AXIS_WIDTH}
            y1={0}
            x2={CHART_WIDTH}
            y2={0}
            stroke={cyberpunk.bgTertiary}
            strokeWidth={1}
          />
          <Line
            x1={Y_AXIS_WIDTH}
            y1={CHART_HEIGHT / 2}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT / 2}
            stroke={cyberpunk.bgTertiary}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <Line
            x1={Y_AXIS_WIDTH}
            y1={CHART_HEIGHT}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT}
            stroke={cyberpunk.bgTertiary}
            strokeWidth={1}
          />

          {/* Bars */}
          {chartData.map((reward, index) => {
            const amount = BigInt(reward.amount || '0');
            const barHeight = maxAmount > 0n
              ? Number((amount * BigInt(CHART_HEIGHT - 4)) / maxAmount)
              : 0;
            const x = Y_AXIS_WIDTH + index * (barWidth + BAR_GAP);
            const y = CHART_HEIGHT - barHeight;

            return (
              <Rect
                key={reward.epoch}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={cyberpunk.neonMagenta}
                rx={2}
                opacity={0.8}
              />
            );
          })}

          {/* Epoch labels (first and last) */}
          {chartData.length > 0 && (
            <>
              <SvgText
                x={Y_AXIS_WIDTH}
                y={CHART_HEIGHT + LABEL_HEIGHT - 4}
                fill={cyberpunk.textMuted}
                fontSize={9}
                fontFamily={typography.fonts.mono}
              >
                E{chartData[0].epoch}
              </SvgText>
              <SvgText
                x={CHART_WIDTH - 24}
                y={CHART_HEIGHT + LABEL_HEIGHT - 4}
                fill={cyberpunk.textMuted}
                fontSize={9}
                fontFamily={typography.fonts.mono}
              >
                E{chartData[chartData.length - 1].epoch}
              </SvgText>
            </>
          )}
        </Svg>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total ({chartData.length} epochs)</Text>
          <Text style={styles.statValue}>
            {formatAdaShort(stats.total)} ADA
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg/Epoch</Text>
          <Text style={styles.statValue}>
            {formatAdaShort(stats.average)} ADA
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonMagenta,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonMagenta,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    marginBottom: 8,
  },
  emptyHint: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
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
});
