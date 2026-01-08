import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { useWalletStore } from '../../lib/stores/wallet';
import { useWalletData } from '../../lib/hooks/useWalletData';
import { WalletInput } from '../../components/portfolio/WalletInput';
import { BalanceCard } from '../../components/portfolio/BalanceCard';
import { TokenList } from '../../components/portfolio/TokenList';

function formatAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return addr.slice(0, 12) + '...' + addr.slice(-8);
}

export default function PortfolioScreen() {
  const { address, stakeAddress, clearWallet } = useWalletStore();
  const { data, isLoading, isError, error, refetch, isRefetching } = useWalletData();

  const hasWallet = !!(address || stakeAddress);
  const displayAddress = address || stakeAddress || '';

  if (!hasWallet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>PORTFOLIO</Text>
          <WalletInput />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={cyberpunk.neonCyan}
            colors={[cyberpunk.neonCyan]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>PORTFOLIO</Text>
          <Pressable onPress={clearWallet} style={styles.disconnectButton}>
            <Text style={styles.disconnectText}>DISCONNECT</Text>
          </Pressable>
        </View>

        <Text style={styles.addressLabel}>CONNECTED WALLET</Text>
        <Text style={styles.address}>{formatAddress(displayAddress)}</Text>

        {isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error?.message || 'Failed to fetch wallet data'}
            </Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>RETRY</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.dataContainer}>
            <BalanceCard
              ada={data?.ada || 0}
              rewardsAda={data?.rewardsAda || 0}
              isLoading={isLoading}
            />
            <View style={styles.spacer} />
            <TokenList tokens={data?.tokens || []} isLoading={isLoading} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: cyberpunk.neonCyan,
    textShadowColor: cyberpunk.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 4,
  },
  disconnectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  disconnectText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.error,
    letterSpacing: 1,
  },
  addressLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
    letterSpacing: 2,
    marginBottom: 4,
  },
  address: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    marginBottom: 24,
  },
  dataContainer: {
    gap: 16,
  },
  spacer: {
    height: 16,
  },
  errorContainer: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.error,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
  },
});
