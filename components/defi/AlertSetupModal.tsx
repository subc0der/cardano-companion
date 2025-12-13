import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import type { AlertConfig, AlertCondition } from '../../lib/defi/alertTypes';
import type { TokenPair } from '../../lib/defi/types';
import { formatAlertRate } from '../../lib/defi/alertService';

/** Validation bounds for alert inputs */
const ALERT_VALIDATION = {
  /** Maximum target rate (prevents overflow issues) */
  MAX_TARGET_RATE: 1e12,
  /** Minimum target rate */
  MIN_TARGET_RATE: 1e-12,
  /** Maximum percent threshold */
  MAX_PERCENT_THRESHOLD: 1000,
  /** Minimum percent threshold */
  MIN_PERCENT_THRESHOLD: 0.01,
} as const;

interface AlertSetupModalProps {
  visible: boolean;
  pair: TokenPair | null;
  onSave: (config: AlertConfig) => void;
  onClose: () => void;
}

type AlertTypeOption = 'price_target' | 'percent_change';
type PercentDirection = 'up' | 'down' | 'either';

export function AlertSetupModal({
  visible,
  pair,
  onSave,
  onClose,
}: AlertSetupModalProps) {
  const [alertType, setAlertType] = useState<AlertTypeOption>('price_target');
  const [targetRate, setTargetRate] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [percentThreshold, setPercentThreshold] = useState('');
  const [direction, setDirection] = useState<PercentDirection>('either');

  const resetForm = useCallback(() => {
    setAlertType('price_target');
    setTargetRate('');
    setCondition('above');
    setPercentThreshold('');
    setDirection('either');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSave = useCallback(() => {
    if (!pair) return;

    let config: AlertConfig;

    if (alertType === 'price_target') {
      const rate = parseFloat(targetRate);
      // Validate rate is within reasonable bounds
      if (
        isNaN(rate) ||
        rate < ALERT_VALIDATION.MIN_TARGET_RATE ||
        rate > ALERT_VALIDATION.MAX_TARGET_RATE
      ) {
        return;
      }

      config = {
        type: 'price_target',
        targetRate: rate,
        condition,
      };
    } else {
      const threshold = parseFloat(percentThreshold);
      // Validate threshold is within reasonable bounds (0.01% to 1000%)
      if (
        isNaN(threshold) ||
        threshold < ALERT_VALIDATION.MIN_PERCENT_THRESHOLD ||
        threshold > ALERT_VALIDATION.MAX_PERCENT_THRESHOLD
      ) {
        return;
      }

      // Require valid lastRate for percent change alerts (prevents division by zero)
      if (pair.lastRate == null || pair.lastRate <= 0) {
        return;
      }

      config = {
        type: 'percent_change',
        percentThreshold: threshold,
        direction,
        baseRate: pair.lastRate,
      };
    }

    onSave(config);
    resetForm();
  }, [alertType, targetRate, condition, percentThreshold, direction, pair, onSave, resetForm]);

  const isValid = useCallback(() => {
    if (alertType === 'price_target') {
      const rate = parseFloat(targetRate);
      return (
        !isNaN(rate) &&
        rate >= ALERT_VALIDATION.MIN_TARGET_RATE &&
        rate <= ALERT_VALIDATION.MAX_TARGET_RATE
      );
    } else {
      const threshold = parseFloat(percentThreshold);
      // Use loose equality to catch both null and undefined; also require positive rate
      return (
        !isNaN(threshold) &&
        threshold >= ALERT_VALIDATION.MIN_PERCENT_THRESHOLD &&
        threshold <= ALERT_VALIDATION.MAX_PERCENT_THRESHOLD &&
        pair?.lastRate != null &&
        pair.lastRate > 0
      );
    }
  }, [alertType, targetRate, percentThreshold, pair]);

  /** Get validation error message for current input, if any */
  const getValidationError = useCallback((): string | null => {
    if (alertType === 'price_target') {
      if (!targetRate) return null; // No error for empty input
      const rate = parseFloat(targetRate);
      if (isNaN(rate)) return 'Please enter a valid number';
      if (rate < ALERT_VALIDATION.MIN_TARGET_RATE) return 'Value is too small';
      if (rate > ALERT_VALIDATION.MAX_TARGET_RATE) return 'Value is too large';
      return null;
    } else {
      if (!percentThreshold) return null; // No error for empty input
      const threshold = parseFloat(percentThreshold);
      if (isNaN(threshold)) return 'Please enter a valid number';
      if (threshold < ALERT_VALIDATION.MIN_PERCENT_THRESHOLD) return 'Minimum is 0.01%';
      if (threshold > ALERT_VALIDATION.MAX_PERCENT_THRESHOLD) return 'Maximum is 1000%';
      // Use loose equality to catch both null and undefined
      if (pair?.lastRate == null || pair.lastRate <= 0) return 'Current rate unavailable';
      return null;
    }
  }, [alertType, targetRate, percentThreshold, pair]);

  if (!pair) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable
          style={styles.overlayBackground}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close alert setup"
        />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>NEW ALERT</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color={cyberpunk.textSecondary} />
            </Pressable>
          </View>

          {/* Pair Info */}
          <View style={styles.pairInfo}>
            <Text style={styles.pairText}>
              {pair.tokenIn.ticker} → {pair.tokenOut.ticker}
            </Text>
            {pair.lastRate !== null && (
              <Text style={styles.currentRate}>
                Current: {formatAlertRate(pair.lastRate)}
              </Text>
            )}
          </View>

          {/* Alert Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ALERT TYPE</Text>
            <View style={styles.typeButtons}>
              <Pressable
                style={[
                  styles.typeButton,
                  alertType === 'price_target' && styles.typeButtonActive,
                ]}
                onPress={() => setAlertType('price_target')}
              >
                <Ionicons
                  name="flag"
                  size={18}
                  color={alertType === 'price_target' ? cyberpunk.neonCyan : cyberpunk.textMuted}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    alertType === 'price_target' && styles.typeButtonTextActive,
                  ]}
                >
                  Price Target
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  alertType === 'percent_change' && styles.typeButtonActive,
                ]}
                onPress={() => setAlertType('percent_change')}
              >
                <Ionicons
                  name="trending-up"
                  size={18}
                  color={alertType === 'percent_change' ? cyberpunk.neonCyan : cyberpunk.textMuted}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    alertType === 'percent_change' && styles.typeButtonTextActive,
                  ]}
                >
                  % Change
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Price Target Options */}
          {alertType === 'price_target' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>CONDITION</Text>
                <View style={styles.conditionButtons}>
                  <Pressable
                    style={[
                      styles.conditionButton,
                      condition === 'above' && styles.conditionButtonActive,
                    ]}
                    onPress={() => setCondition('above')}
                  >
                    <Ionicons
                      name="caret-up"
                      size={16}
                      color={condition === 'above' ? cyberpunk.success : cyberpunk.textMuted}
                    />
                    <Text
                      style={[
                        styles.conditionButtonText,
                        condition === 'above' && styles.conditionButtonTextActive,
                      ]}
                    >
                      Above
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.conditionButton,
                      condition === 'below' && styles.conditionButtonActive,
                    ]}
                    onPress={() => setCondition('below')}
                  >
                    <Ionicons
                      name="caret-down"
                      size={16}
                      color={condition === 'below' ? cyberpunk.error : cyberpunk.textMuted}
                    />
                    <Text
                      style={[
                        styles.conditionButtonText,
                        condition === 'below' && styles.conditionButtonTextActive,
                      ]}
                    >
                      Below
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TARGET RATE</Text>
                <TextInput
                  style={styles.input}
                  value={targetRate}
                  onChangeText={setTargetRate}
                  placeholder="0.00"
                  placeholderTextColor={cyberpunk.textMuted}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Target rate for price alert"
                  accessibilityHint="Enter the exchange rate that will trigger this alert"
                />
                {alertType === 'price_target' && getValidationError() && (
                  <Text style={styles.errorText}>{getValidationError()}</Text>
                )}
              </View>
            </>
          )}

          {/* Percent Change Options */}
          {alertType === 'percent_change' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>DIRECTION</Text>
                <View style={styles.directionButtons}>
                  <Pressable
                    style={[
                      styles.directionButton,
                      direction === 'up' && styles.directionButtonActive,
                    ]}
                    onPress={() => setDirection('up')}
                  >
                    <Text
                      style={[
                        styles.directionButtonText,
                        direction === 'up' && styles.directionButtonTextUp,
                      ]}
                    >
                      ↑ Up
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.directionButton,
                      direction === 'down' && styles.directionButtonActive,
                    ]}
                    onPress={() => setDirection('down')}
                  >
                    <Text
                      style={[
                        styles.directionButtonText,
                        direction === 'down' && styles.directionButtonTextDown,
                      ]}
                    >
                      ↓ Down
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.directionButton,
                      direction === 'either' && styles.directionButtonActive,
                    ]}
                    onPress={() => setDirection('either')}
                  >
                    <Text
                      style={[
                        styles.directionButtonText,
                        direction === 'either' && styles.directionButtonTextActive,
                      ]}
                    >
                      ↕ Either
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>THRESHOLD (%)</Text>
                <TextInput
                  style={styles.input}
                  value={percentThreshold}
                  onChangeText={setPercentThreshold}
                  placeholder="5"
                  placeholderTextColor={cyberpunk.textMuted}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Percent change threshold"
                  accessibilityHint="Enter the percentage change that will trigger this alert"
                />
                {alertType === 'percent_change' && getValidationError() && (
                  <Text style={styles.errorText}>{getValidationError()}</Text>
                )}
                {!getValidationError() && (pair.lastRate == null || pair.lastRate <= 0) && (
                  <Text style={styles.warningText}>
                    No current rate - fetch prices first
                  </Text>
                )}
              </View>
            </>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !isValid() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!isValid()}
            >
              <Ionicons name="notifications" size={18} color={cyberpunk.bgPrimary} />
              <Text style={styles.saveButtonText}>CREATE ALERT</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
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
    fontSize: typography.sizes.lg,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
  },
  pairInfo: {
    backgroundColor: cyberpunk.bgTertiary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  pairText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  currentRate: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    backgroundColor: cyberpunk.bgPrimary,
  },
  typeButtonActive: {
    borderColor: cyberpunk.neonCyan,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  typeButtonText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
  },
  typeButtonTextActive: {
    color: cyberpunk.neonCyan,
  },
  conditionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  conditionButtonActive: {
    borderColor: cyberpunk.neonCyan,
  },
  conditionButtonText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
  },
  conditionButtonTextActive: {
    color: cyberpunk.textPrimary,
  },
  directionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  directionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  directionButtonActive: {
    borderColor: cyberpunk.neonCyan,
  },
  directionButtonText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
  },
  directionButtonTextUp: {
    color: cyberpunk.success,
  },
  directionButtonTextDown: {
    color: cyberpunk.error,
  },
  directionButtonTextActive: {
    color: cyberpunk.neonCyan,
  },
  input: {
    backgroundColor: cyberpunk.bgPrimary,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    borderRadius: 8,
    padding: 12,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.lg,
    color: cyberpunk.textPrimary,
  },
  warningText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.warning,
    marginTop: 8,
  },
  errorText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.error,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.textMuted,
  },
  cancelButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: cyberpunk.neonCyan,
  },
  saveButtonDisabled: {
    backgroundColor: cyberpunk.bgTertiary,
  },
  saveButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.bgPrimary,
    letterSpacing: 1,
  },
});
