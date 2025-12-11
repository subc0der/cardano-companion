import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { usePriceAlertStore, ALERT_LIMITS } from '../../lib/stores/priceAlertStore';
import type { TokenPair } from '../../lib/defi/types';
import type { AlertConfig } from '../../lib/defi/alertTypes';
import { AlertListItem } from './AlertListItem';
import { AlertSetupModal } from './AlertSetupModal';

interface PairAlertSectionProps {
  pair: TokenPair;
}

export function PairAlertSection({ pair }: PairAlertSectionProps) {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { alerts, addAlert, removeAlert, reactivateAlert, getAlertsForPair } =
    usePriceAlertStore();

  const pairAlerts = getAlertsForPair(pair.id);
  const canAddMore = pairAlerts.length < ALERT_LIMITS.MAX_PER_PAIR;
  const totalAlerts = alerts.length;
  const canAddTotal = totalAlerts < ALERT_LIMITS.MAX_TOTAL;

  const handleAddPress = useCallback(async () => {
    const isExpoGo = Constants.appOwnership === 'expo';

    // Skip permission check in Expo Go (notifications not supported)
    if (!isExpoGo) {
      try {
        const { requestPermissions } = await import('../../lib/notifications');
        const granted = await requestPermissions();
        if (!granted) {
          return;
        }
      } catch {
        // Notification module not available
      }
    }
    setShowSetupModal(true);
  }, []);

  const handleSaveAlert = useCallback(
    (config: AlertConfig) => {
      const success = addAlert(pair.id, config);
      if (success) {
        setShowSetupModal(false);
      }
    },
    [pair.id, addAlert]
  );

  const handleRemoveAlert = useCallback(
    (alertId: string) => {
      removeAlert(alertId);
    },
    [removeAlert]
  );

  const handleReactivateAlert = useCallback(
    (alertId: string) => {
      reactivateAlert(alertId);
    },
    [reactivateAlert]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={16} color={cyberpunk.textSecondary} />
          <Text style={styles.headerTitle}>ALERTS</Text>
          <Text style={styles.headerCount}>
            ({pairAlerts.length}/{ALERT_LIMITS.MAX_PER_PAIR})
          </Text>
        </View>
        {canAddMore && canAddTotal && (
          <Pressable
            style={styles.addButton}
            onPress={handleAddPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add new alert"
          >
            <Ionicons name="add" size={18} color={cyberpunk.neonCyan} />
          </Pressable>
        )}
      </View>

      {/* Alert List */}
      {pairAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No alerts set</Text>
          {canAddMore && canAddTotal && (
            <Pressable style={styles.emptyAddButton} onPress={handleAddPress}>
              <Ionicons name="add" size={16} color={cyberpunk.neonCyan} />
              <Text style={styles.emptyAddText}>Add Alert</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.alertList}>
          {pairAlerts.map((alert) => (
            <AlertListItem
              key={alert.id}
              alert={alert}
              onRemove={handleRemoveAlert}
              onReactivate={handleReactivateAlert}
            />
          ))}
        </View>
      )}

      {/* Capacity Warning */}
      {(!canAddMore || !canAddTotal) && (
        <View style={styles.capacityWarning}>
          <Ionicons name="information-circle" size={14} color={cyberpunk.warning} />
          <Text style={styles.capacityText}>
            {!canAddMore
              ? `Max ${ALERT_LIMITS.MAX_PER_PAIR} alerts per pair`
              : `Max ${ALERT_LIMITS.MAX_TOTAL} total alerts reached`}
          </Text>
        </View>
      )}

      {/* Setup Modal */}
      <AlertSetupModal
        visible={showSetupModal}
        pair={pair}
        onSave={handleSaveAlert}
        onClose={() => setShowSetupModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: cyberpunk.bgTertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    letterSpacing: 1,
  },
  headerCount: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  addButton: {
    padding: 4,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  emptyText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    borderStyle: 'dashed',
  },
  emptyAddText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
  },
  alertList: {
    gap: 8,
  },
  capacityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
  },
  capacityText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.warning,
  },
});
