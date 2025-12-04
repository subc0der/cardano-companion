import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { CyberCard } from '../ui/CyberCard';
import { usePrivacyStore } from '../../lib/stores/privacy';

interface BalanceCardProps {
  ada: number;
  rewardsAda: number;
  isLoading?: boolean;
}

export function BalanceCard({ ada, rewardsAda, isLoading }: BalanceCardProps) {
  const { hideBalances } = usePrivacyStore();

  const formatAda = (amount: number): string => {
    if (hideBalances) return '****';
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatRewards = (rewards: number): string => {
    if (hideBalances) return '(**** unclaimed rewards)';
    const rewardsStr = rewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `(${rewardsStr} unclaimed rewards)`;
  };

  return (
    <CyberCard glowColor="cyan">
      <Text style={styles.label}>TOTAL BALANCE</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.adaSymbol}>₳</Text>
        <Text style={[styles.amount, isLoading && styles.loading]}>
          {isLoading ? '...' : formatAda(ada)}
        </Text>
      </View>
      <Text style={styles.subtitle}>ADA</Text>
      {!isLoading && rewardsAda > 0 && (
        <Text style={styles.breakdown}>{formatRewards(rewardsAda)}</Text>
      )}
    </CyberCard>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  adaSymbol: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: cyberpunk.neonCyan,
    marginRight: 8,
  },
  amount: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes['3xl'],
    color: cyberpunk.textPrimary,
    fontWeight: typography.weights.bold,
  },
  loading: {
    color: cyberpunk.textMuted,
  },
  subtitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  breakdown: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
    marginTop: 8,
  },
});
