import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { getPoolRecommendations, STAKING_CONFIG } from '../../lib/staking';
import { PoolCard } from './PoolCard';

interface RecommendationListProps {
  currentPoolId: string | null;
}

export function RecommendationList({ currentPoolId }: RecommendationListProps) {
  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['poolRecommendations', currentPoolId],
    queryFn: () => getPoolRecommendations(currentPoolId),
    staleTime: STAKING_CONFIG.POOL_LIST_CACHE_TTL_MS,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>RECOMMENDED POOLS</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={cyberpunk.electricBlue} />
          <Text style={styles.loadingText}>Analyzing pools...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>RECOMMENDED POOLS</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Failed to load recommendations'}
        </Text>
      </View>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>RECOMMENDED POOLS</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {currentPoolId
              ? 'Your current pool is performing well!'
              : 'No recommendations available'}
          </Text>
          <Text style={styles.emptyHint}>
            {currentPoolId
              ? 'No significantly better alternatives found'
              : 'Connect a wallet to see pool recommendations'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RECOMMENDED POOLS</Text>
      <Text style={styles.subtitle}>
        Based on ROA, saturation, and fees
      </Text>
      <View style={styles.list}>
        {recommendations.map((rec) => (
          <PoolCard key={rec.pool.poolId} recommendation={rec} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.electricBlue,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.electricBlue,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
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
    color: cyberpunk.success,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
});
