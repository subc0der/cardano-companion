/**
 * BetControls - Betting Interface Component
 *
 * Allows players to adjust their bet before rolling.
 * Includes increment/decrement buttons and current bet display.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';
import { MIN_BET_CHIPS } from '../../../lib/games/ada-rollz/constants';

/** Delay before press-and-hold repeat starts (ms) */
const PRESS_HOLD_DELAY_MS = 400;
/** Interval between repeats while holding (ms) */
const PRESS_HOLD_INTERVAL_MS = 80;

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

  // Refs for press-and-hold timers
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearHoldTimers = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  const handlePressIn = useCallback((action: () => void) => {
    // Fire immediately on press
    action();
    // Start hold timer
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(action, PRESS_HOLD_INTERVAL_MS);
    }, PRESS_HOLD_DELAY_MS);
  }, []);

  const handlePressOut = useCallback(() => {
    clearHoldTimers();
  }, [clearHoldTimers]);

  // Cleanup timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      clearHoldTimers();
    };
  }, [clearHoldTimers]);

  // Stop interval when bet limits are reached (prevents unnecessary firing)
  // Clear timers if either limit is reached while holding
  useEffect(() => {
    // If we're at min bet and can't decrement, or at max bet and can't increment,
    // the interval would fire uselessly - so clear it
    if (holdIntervalRef.current && (!canIncrement || !canDecrement)) {
      clearHoldTimers();
    }
  }, [canIncrement, canDecrement, clearHoldTimers]);

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
          onPressIn={() => canDecrement && handlePressIn(onDecrement)}
          onPressOut={handlePressOut}
          disabled={!canDecrement}
          accessibilityRole="button"
          accessibilityLabel="Decrease bet"
          accessibilityHint={`Decrease bet by 1 chip. Minimum is ${MIN_BET_CHIPS}. Hold to repeat.`}
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
          onPressIn={() => canIncrement && handlePressIn(onIncrement)}
          onPressOut={handlePressOut}
          disabled={!canIncrement}
          accessibilityRole="button"
          accessibilityLabel="Increase bet"
          accessibilityHint={`Increase bet by 1 chip. Maximum is ${maxBet}. Hold to repeat.`}
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
    color: cyberpunk.electricBlue,
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
    color: cyberpunk.electricBlue,
  },
});
