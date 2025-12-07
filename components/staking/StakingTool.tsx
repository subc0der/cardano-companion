import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { useWalletStore } from '../../lib/stores/wallet';
import { useUserDelegation } from '../../lib/hooks/useUserDelegation';
import { CyberButton } from '../ui/CyberButton';
import { CurrentDelegation } from './CurrentDelegation';
import { RewardsChart } from './RewardsChart';
import { RecommendationList } from './RecommendationList';

export function StakingTool() {
  const { stakeAddress } = useWalletStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Centralized delegation data - passed to children to avoid duplicate queries
  const {
    data: delegation,
    isLoading: delegationLoading,
    error: delegationError,
  } = useUserDelegation(modalVisible ? stakeAddress : null);

  const hasWallet = !!stakeAddress;

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={handleOpenModal}
        style={[styles.toolCard, !hasWallet && styles.toolCardDisabled]}
        disabled={!hasWallet}
        accessibilityRole="button"
        accessibilityLabel="View staking information"
        accessibilityHint="Opens a modal showing your current delegation and staking rewards"
      >
        <Text style={styles.toolIcon}>%</Text>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>STAKING OPTIMIZER</Text>
          <Text style={styles.toolDescription}>
            {hasWallet
              ? 'View delegation and optimize rewards'
              : 'Connect wallet first'}
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
        accessibilityViewIsModal={true}
        accessibilityLabel="Staking optimizer"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>STAKING OPTIMIZER</Text>
            <Pressable
              onPress={handleCloseModal}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
          >
            {stakeAddress && (
              <>
                <CurrentDelegation
                  stakeAddress={stakeAddress}
                  delegation={delegation}
                  isLoading={delegationLoading}
                  error={delegationError instanceof Error ? delegationError : null}
                />
                <RewardsChart stakeAddress={stakeAddress} />
                <RecommendationList currentPoolId={delegation?.poolId ?? null} />
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <CyberButton title="CLOSE" variant="secondary" onPress={handleCloseModal} />
          </View>
        </View>
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
    color: cyberpunk.neonCyan,
    fontFamily: typography.fonts.primary,
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
  modalContainer: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: cyberpunk.bgTertiary,
  },
  modalTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: cyberpunk.neonCyan,
    letterSpacing: 3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cyberpunk.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textMuted,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    gap: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: cyberpunk.bgTertiary,
  },
});
