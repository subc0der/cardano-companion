/**
 * BetControls - Betting Interface Component
 *
 * Allows players to adjust their bet before rolling.
 * Includes increment/decrement buttons and current bet display.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';
import { MIN_BET_CHIPS } from '../../../lib/games/ada-rollz/constants';

interface BetControlsProps {
  /** Current bet amount in chips */
  currentBet: number;
  /** Maximum possible bet (min of player and AI chips) */
  maxBet: number;
  /** Callback to increment bet */
  onIncrement: () => void;
  /** Callback to decrement bet */
  onDecrement: () => void;
  /** Whether controls are disabled */
  disabled?: boolean;
}

export function BetControls({
  currentBet,
  maxBet,
  onIncrement,
  onDecrement,
  disabled = false,
}: BetControlsProps) {
  const canDecrement = currentBet > MIN_BET_CHIPS && !disabled;
  const canIncrement = currentBet < maxBet && !disabled;

  return (
    <View
      style={styles.container}
      accessibilityRole="adjustable"
      accessibilityLabel={`Bet amount: ${currentBet} chips`}
      accessibilityHint="Adjust bet with plus and minus buttons"
    >
      <Text style={styles.label}>BET</Text>

      <View style={styles.controlsRow}>
        {/* Decrement button */}
        <Pressable
          onPress={onDecrement}
          disabled={!canDecrement}
          accessibilityRole="button"
          accessibilityLabel="Decrease bet"
          accessibilityHint={`Decrease bet by 1 chip. Minimum is ${MIN_BET_CHIPS}`}
          style={({ pressed }) => [
            styles.button,
            !canDecrement && styles.buttonDisabled,
            pressed && canDecrement && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="remove"
            size={24}
            color={canDecrement ? cyberpunk.neonCyan : cyberpunk.textMuted}
          />
        </Pressable>

        {/* Current bet display */}
        <View style={styles.betDisplay}>
          <Text style={styles.betAmount}>{currentBet}</Text>
          <Text style={styles.betUnit}>chips</Text>
        </View>

        {/* Increment button */}
        <Pressable
          onPress={onIncrement}
          disabled={!canIncrement}
          accessibilityRole="button"
          accessibilityLabel="Increase bet"
          accessibilityHint={`Increase bet by 1 chip. Maximum is ${maxBet}`}
          style={({ pressed }) => [
            styles.button,
            !canIncrement && styles.buttonDisabled,
            pressed && canIncrement && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="add"
            size={24}
            color={canIncrement ? cyberpunk.neonCyan : cyberpunk.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cyberpunk.bgTertiary,
    borderWidth: 2,
    borderColor: cyberpunk.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: cyberpunk.textMuted,
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: cyberpunk.neonCyan,
    opacity: 0.9,
  },
  betDisplay: {
    minWidth: 70,
    alignItems: 'center',
  },
  betAmount: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: adaRollz.chipGold,
    textShadowColor: adaRollz.chipGoldGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  betUnit: {
    fontFamily: typography.fonts.primary,
    fontSize: 9,
    color: cyberpunk.textMuted,
  },
});
