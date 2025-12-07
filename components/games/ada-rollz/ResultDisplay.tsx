/**
 * ResultDisplay - Round Result Overlay
 *
 * Shows the outcome of a round (win/lose/tie) with appropriate styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';
import type { EvaluatedHand } from '../../../lib/games/ada-rollz/types';

interface ResultDisplayProps {
  /** Who won the round */
  winner: 'player' | 'ai' | 'tie';
  /** Chips won (for player wins) */
  potWon: number;
  /** Player's hand */
  playerHand: EvaluatedHand;
  /** AI's hand */
  aiHand: EvaluatedHand;
}

export function ResultDisplay({
  winner,
  potWon,
  playerHand,
  aiHand,
}: ResultDisplayProps) {
  const isWin = winner === 'player';
  const isTie = winner === 'tie';

  const resultText = isWin ? 'YOU WIN!' : isTie ? 'TIE!' : 'YOU LOSE';
  const resultColor = isWin
    ? cyberpunk.success
    : isTie
      ? cyberpunk.warning
      : cyberpunk.error;

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={`Result: ${resultText}. Your hand: ${playerHand.displayName}. Opponent hand: ${aiHand.displayName}`}
    >
      <Text style={[styles.resultText, { color: resultColor }]}>
        {resultText}
      </Text>

      {isWin && (
        <Text style={styles.chipsWon}>+{potWon} chips</Text>
      )}

      <View style={styles.handComparison}>
        <View style={styles.handColumn}>
          <Text style={styles.handLabel}>YOUR HAND</Text>
          <Text style={[styles.handName, isWin && styles.winningHand]}>
            {playerHand.displayName}
          </Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.handColumn}>
          <Text style={styles.handLabel}>OPPONENT</Text>
          <Text style={[styles.handName, !isWin && !isTie && styles.winningHand]}>
            {aiHand.displayName}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: cyberpunk.bgTertiary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  resultText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['3xl'],
    letterSpacing: 4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  chipsWon: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: adaRollz.chipGold,
    textShadowColor: adaRollz.chipGoldGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginTop: 8,
  },
  handComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  handColumn: {
    alignItems: 'center',
    minWidth: 100,
  },
  handLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  handName: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
  },
  winningHand: {
    color: cyberpunk.neonCyan,
    textShadowColor: cyberpunk.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  vsText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
  },
});
