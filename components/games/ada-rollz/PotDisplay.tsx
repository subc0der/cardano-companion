/**
 * PotDisplay - Central Pot Indicator
 *
 * Shows the current pot (total chips at stake) in the center of the game board.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';

interface PotDisplayProps {
  /** Number of chips in the pot */
  pot: number;
}

export function PotDisplay({ pot }: PotDisplayProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Pot: ${pot} chips`}
    >
      <Text style={styles.label}>POT</Text>
      <Text style={styles.amount}>{pot}</Text>
      <Text style={styles.unit}>chips</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cyberpunk.success,
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: cyberpunk.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    letterSpacing: 2,
  },
  amount: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: adaRollz.chipGold,
    textShadowColor: adaRollz.chipGoldGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  unit: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
});
