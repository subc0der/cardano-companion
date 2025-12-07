/**
 * Alert banner component for displaying pool health warnings.
 * Shows critical and warning alerts with appropriate styling.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import type { PoolAlert, AlertSeverity } from '../../lib/staking';

interface AlertBannerProps {
  alerts: PoolAlert[];
}

/** Get background color based on alert severity */
function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return cyberpunk.error;
    case 'warning':
      return cyberpunk.warning;
    case 'info':
      return cyberpunk.neonCyan;
  }
}

/** Get background color with transparency for alert container */
function getSeverityBackgroundColor(severity: AlertSeverity): string {
  // RGBA values match theme colors: error=#FF3366, warning=#FFB800, neonCyan=#00FFFF
  switch (severity) {
    case 'critical':
      return 'rgba(255, 51, 102, 0.15)';
    case 'warning':
      return 'rgba(255, 184, 0, 0.15)';
    case 'info':
      return 'rgba(0, 255, 255, 0.1)';
  }
}

function AlertBannerComponent({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) {
    return null;
  }

  const accessibilityLabel = alerts
    .map((alert) => `${alert.severity} alert: ${alert.message}`)
    .join('. ');

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.title}>ALERTS</Text>
      {alerts.map((alert, index) => {
        const color = getSeverityColor(alert.severity);
        const backgroundColor = getSeverityBackgroundColor(alert.severity);

        return (
          <View
            key={`${alert.type}-${index}`}
            style={[styles.alertItem, { backgroundColor, borderColor: color }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
              <Text style={styles.iconText}>!</Text>
            </View>
            <Text style={[styles.alertMessage, { color }]}>{alert.message}</Text>
          </View>
        );
      })}
    </View>
  );
}

export const AlertBanner = memo(AlertBannerComponent);

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    letterSpacing: 2,
    marginBottom: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.bgPrimary,
    fontWeight: 'bold',
  },
  alertMessage: {
    flex: 1,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
