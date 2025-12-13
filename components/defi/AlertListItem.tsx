import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import type { PriceAlert } from '../../lib/defi/alertTypes';
import { getAlertDescription, getAlertTypeLabel } from '../../lib/defi/alertService';

interface AlertListItemProps {
  alert: PriceAlert;
  onRemove: (alertId: string) => void;
  onReactivate?: (alertId: string) => void;
}

export function AlertListItem({ alert, onRemove, onReactivate }: AlertListItemProps) {
  const isTriggered = alert.status === 'triggered';
  const isActive = alert.status === 'active';

  const getStatusColor = () => {
    switch (alert.status) {
      case 'active':
        return cyberpunk.neonCyan;
      case 'triggered':
        return cyberpunk.warning;
      case 'dismissed':
        return cyberpunk.textMuted;
    }
  };

  const getStatusIcon = (): 'notifications' | 'notifications-off' | 'checkmark-circle' => {
    switch (alert.status) {
      case 'active':
        return 'notifications';
      case 'triggered':
        return 'checkmark-circle';
      case 'dismissed':
        return 'notifications-off';
    }
  };

  return (
    <View style={[styles.container, isTriggered && styles.containerTriggered]}>
      {/* Status Icon */}
      <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor()}20` }]}>
        <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
      </View>

      {/* Alert Info */}
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.typeLabel}>{getAlertTypeLabel(alert)}</Text>
          <Text style={[styles.statusBadge, { color: getStatusColor() }]}>
            {alert.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.description}>{getAlertDescription(alert)}</Text>
        {isTriggered && alert.triggeredRate !== null && (
          <Text style={styles.triggeredInfo}>
            Triggered at {alert.triggeredRate.toFixed(6)}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isTriggered && onReactivate && (
          <Pressable
            style={styles.actionButton}
            onPress={() => onReactivate(alert.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Reactivate alert"
          >
            <Ionicons name="refresh" size={18} color={cyberpunk.neonCyan} />
          </Pressable>
        )}
        <Pressable
          style={styles.actionButton}
          onPress={() => onRemove(alert.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Remove alert"
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={isActive ? cyberpunk.error : cyberpunk.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cyberpunk.bgTertiary,
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  containerTriggered: {
    borderWidth: 1,
    borderColor: cyberpunk.warning,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    fontFamily: typography.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
  },
  triggeredInfo: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.warning,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
});
