/**
 * DiceHand - Container for 5 Dice
 *
 * Displays a row of 5 dice representing a player's hand.
 * Supports both player (interactive) and opponent (display only) modes.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dice } from './Dice';
import { cyberpunk } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';
import { DICE_SPACING_DP } from '../../../lib/games/ada-rollz/constants';
import type { Die, EvaluatedHand } from '../../../lib/games/ada-rollz/types';

interface DiceHandProps {
  /** Array of 5 dice */
  dice: Die[];
  /** Evaluated hand result (optional, shown when available) */
  hand?: EvaluatedHand | null;
  /** Label for this hand (e.g., "YOUR HAND" or "OPPONENT") */
  label: string;
  /** Whether dice can be interacted with */
  interactive?: boolean;
  /** Whether to hide dice values (show backs) */
  hidden?: boolean;
  /** Callback when a die is pressed */
  onDiePress?: (dieId: string) => void;
}

export function DiceHand({
  dice,
  hand,
  label,
  interactive = false,
  hidden = false,
  onDiePress,
}: DiceHandProps) {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={`${label}: ${hand?.displayName ?? 'No hand yet'}`}
    >
      {/* Hand label */}
      <Text style={styles.label}>{label}</Text>

      {/* Dice row */}
      <View style={styles.diceRow}>
        {dice.map((die) => (
          <View key={die.id} style={styles.diceWrapper}>
            {hidden ? (
              <View style={styles.hiddenDie}>
                <Text style={styles.hiddenText}>?</Text>
              </View>
            ) : (
              <Dice
                die={die}
                disabled={!interactive}
                onPress={
                  interactive && onDiePress
                    ? () => onDiePress(die.id)
                    : undefined
                }
              />
            )}
          </View>
        ))}
      </View>

      {/* Hand rank display */}
      <View style={styles.handRankContainer}>
        {hand && !hidden ? (
          <Text style={styles.handRank}>{hand.displayName}</Text>
        ) : (
          <Text style={styles.handRankPlaceholder}>
            {hidden ? '???' : 'Roll to see hand'}
          </Text>
        )}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DICE_SPACING_DP,
  },
  diceWrapper: {
    // Individual die wrapper for consistent spacing
  },
  hiddenDie: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: cyberpunk.bgTertiary,
    borderWidth: 2,
    borderColor: cyberpunk.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: cyberpunk.textMuted,
  },
  handRankContainer: {
    marginTop: 6,
    minHeight: 18,
  },
  handRank: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    textShadowColor: cyberpunk.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  handRankPlaceholder: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
});
