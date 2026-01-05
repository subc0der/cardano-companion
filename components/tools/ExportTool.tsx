import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { useExportTransactions } from '../../lib/hooks/useExportTransactions';
import { useWalletStore } from '../../lib/stores/wallet';
import { CyberButton } from '../ui/CyberButton';
import { AssetFilter } from '../../lib/types/transaction';

export function ExportTool() {
  const { address, stakeAddress } = useWalletStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [includeRewards, setIncludeRewards] = useState(true);
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('all');

  const { exportData, isLoading, progress, error, warning, result, reset } =
    useExportTransactions();

  const hasWallet = !!(address || stakeAddress);

  const handleOpenModal = () => {
    reset();
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setModalVisible(false);
    }
  };

  const handleExport = async () => {
    if (!address) return;
    await exportData(address, stakeAddress, {
      includeStakingRewards: includeRewards,
      assetFilter,
    });
  };

  const progressText = useMemo(() => {
    switch (progress.phase) {
      case 'fetching':
        return `Fetching transactions... ${progress.current}`;
      case 'processing':
        return `Processing ${progress.current}/${progress.total}`;
      case 'exporting':
        return 'Generating CSV...';
      default:
        return '';
    }
  }, [progress.phase, progress.current, progress.total]);

  return (
    <>
      <Pressable
        onPress={handleOpenModal}
        style={[styles.toolCard, !hasWallet && styles.toolCardDisabled]}
        disabled={!hasWallet}
        accessibilityRole="button"
        accessibilityLabel="Export transaction history to CSV"
        accessibilityHint="Opens a modal to configure and export your transaction history as a CSV file"
      >
        <Text style={styles.toolIcon}>📊</Text>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>EXPORT CSV</Text>
          <Text style={styles.toolDescription}>
            {hasWallet
              ? 'Export transaction history to CSV'
              : 'Connect wallet first'}
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
        accessibilityViewIsModal={true}
        accessibilityLabel="Export transactions dialog"
      >
        <Pressable
          style={styles.overlay}
          onPress={handleCloseModal}
          accessibilityRole="button"
          accessibilityLabel="Close export dialog"
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>EXPORT TRANSACTIONS</Text>

            {!isLoading && !result && (
              <>
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Include Staking Rewards</Text>
                  <Switch
                    value={includeRewards}
                    onValueChange={setIncludeRewards}
                    accessibilityRole="switch"
                    accessibilityLabel="Include staking rewards"
                    accessibilityHint="Toggle to include or exclude staking rewards from the export"
                    trackColor={{
                      false: cyberpunk.bgTertiary,
                      true: cyberpunk.neonCyan,
                    }}
                    thumbColor={cyberpunk.textPrimary}
                  />
                </View>

                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Assets</Text>
                  <View style={styles.filterButtons} accessibilityRole="radiogroup">
                    <Pressable
                      onPress={() => setAssetFilter('all')}
                      style={[
                        styles.filterButton,
                        assetFilter === 'all' && styles.filterButtonActive,
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel="All assets"
                      accessibilityState={{ selected: assetFilter === 'all' }}
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          assetFilter === 'all' && styles.filterButtonTextActive,
                        ]}
                      >
                        ALL
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setAssetFilter('ada_only')}
                      style={[
                        styles.filterButton,
                        assetFilter === 'ada_only' && styles.filterButtonActive,
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel="ADA only"
                      accessibilityState={{ selected: assetFilter === 'ada_only' }}
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          assetFilter === 'ada_only' && styles.filterButtonTextActive,
                        ]}
                      >
                        ADA
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.actions}>
                  <CyberButton
                    title="CANCEL"
                    variant="ghost"
                    onPress={handleCloseModal}
                  />
                  <CyberButton title="EXPORT CSV" onPress={handleExport} />
                </View>
              </>
            )}

            {isLoading && (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color={cyberpunk.neonCyan} />
                <Text style={styles.progressText}>{progressText}</Text>
              </View>
            )}

            {error && !isLoading && (
              <View style={styles.resultContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {warning && (
                  <Text style={styles.warningText}>{warning}</Text>
                )}
                <View style={styles.actions}>
                  <CyberButton
                    title="CLOSE"
                    variant="secondary"
                    onPress={handleCloseModal}
                  />
                </View>
              </View>
            )}

            {result && result.success && (
              <View style={styles.resultContainer}>
                <Text style={styles.successText}>EXPORT COMPLETE</Text>
                <Text style={styles.resultDetail}>
                  {result.transactionCount} transactions exported
                </Text>
                <Text style={styles.resultDetail}>File: {result.filename}</Text>
                {warning && (
                  <Text style={styles.warningText}>{warning}</Text>
                )}
                <View style={styles.actions}>
                  <CyberButton
                    title="DONE"
                    variant="primary"
                    onPress={handleCloseModal}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    padding: 16,
    gap: 16,
  },
  toolCardDisabled: {
    borderColor: cyberpunk.bgTertiary,
    opacity: 0.5,
  },
  toolIcon: {
    fontSize: 32,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
    marginBottom: 4,
  },
  toolDescription: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.neonCyan,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: cyberpunk.textMuted,
    borderRadius: 4,
  },
  filterButtonActive: {
    borderColor: cyberpunk.neonCyan,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  filterButtonText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  filterButtonTextActive: {
    color: cyberpunk.neonCyan,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  progressText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    marginTop: 16,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.success,
    marginBottom: 12,
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultDetail: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    marginBottom: 4,
  },
  warningText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.warning,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
});
