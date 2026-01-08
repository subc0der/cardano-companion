import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { CyberCard } from '../ui/CyberCard';
import { TokenBalance } from '../../lib/hooks/useWalletData';
import { usePrivacyStore } from '../../lib/stores/privacy';

interface TokenListProps {
  tokens: TokenBalance[];
  isLoading?: boolean;
}

function TokenItem({ token }: { token: TokenBalance }) {
  const { hideBalances } = usePrivacyStore();

  const formatQuantity = (qty: string): string => {
    if (hideBalances) return '****';
    const num = BigInt(qty);
    if (num >= BigInt(1_000_000)) {
      return (Number(num) / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= BigInt(1_000)) {
      return (Number(num) / 1_000).toFixed(2) + 'K';
    }
    return qty;
  };

  return (
    <View style={styles.tokenItem}>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenName} numberOfLines={1}>
          {token.displayName}
        </Text>
        <Text style={styles.policyId} numberOfLines={1}>
          {token.policyId.slice(0, 8)}...{token.policyId.slice(-8)}
        </Text>
      </View>
      <Text style={styles.tokenQuantity}>{formatQuantity(token.quantity)}</Text>
    </View>
  );
}

export function TokenList({ tokens, isLoading }: TokenListProps) {
  if (isLoading) {
    return (
      <CyberCard>
        <Text style={styles.label}>TOKENS</Text>
        <Text style={styles.emptyText}>Loading...</Text>
      </CyberCard>
    );
  }

  if (tokens.length === 0) {
    return (
      <CyberCard>
        <Text style={styles.label}>TOKENS</Text>
        <Text style={styles.emptyText}>No tokens found</Text>
      </CyberCard>
    );
  }

  return (
    <CyberCard>
      <Text style={styles.label}>TOKENS ({tokens.length})</Text>
      <FlatList
        data={tokens}
        keyExtractor={(item) => item.unit}
        renderItem={({ item }) => <TokenItem token={item} />}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </CyberCard>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
    letterSpacing: 2,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tokenInfo: {
    flex: 1,
    marginRight: 16,
  },
  tokenName: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    color: cyberpunk.textPrimary,
    marginBottom: 2,
  },
  policyId: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
  },
  tokenQuantity: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.base,
    color: cyberpunk.neonCyan,
    fontWeight: typography.weights.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: cyberpunk.bgTertiary,
  },
});
