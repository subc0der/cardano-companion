import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { CyberCard } from '../ui/CyberCard';
import { usePrivacyStore } from '../../lib/stores/privacy';
import { useSettingsStore } from '../../lib/stores/settings';
import { useFiatPrice, formatFiatValue } from '../../lib/hooks/useFiatPrice';

interface BalanceCardProps {
  ada: number;
  rewardsAda: number;
  isLoading?: boolean;
}

export function BalanceCard({ ada, rewardsAda, isLoading }: BalanceCardProps) {
  const { hideBalances } = usePrivacyStore();
  const currencyDisplay = useSettingsStore((state) => state.currencyDisplay);
  const { prices, isLoading: pricesLoading } = useFiatPrice();

  const formatAda = (amount: number): string => {
    if (hideBalances) return '****';
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatRewards = (rewards: number): string => {
    if (hideBalances) return '(**** unclaimed rewards)';
    const rewardsStr = rewards.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `(${rewardsStr} unclaimed rewards)`;
  };

  const showFiat = currencyDisplay !== 'ADA';
  const fiatValue = showFiat
    ? formatFiatValue(ada, currencyDisplay, prices, hideBalances)
    : null;

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
      {showFiat && !isLoading && (
        <Text style={styles.fiatValue}>
          {pricesLoading ? '...' : fiatValue}
        </Text>
      )}
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
  fiatValue: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.lg,
    color: cyberpunk.textSecondary,
    marginTop: 4,
  },
  breakdown: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
    marginTop: 8,
  },
});
