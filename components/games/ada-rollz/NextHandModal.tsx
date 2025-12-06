/**
 * NextHandModal - Round Result Popup
 *
 * Centered modal that appears after each hand showing the result.
 * Includes "NEXT HAND" button to continue playing.
 */

import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';
import type { EvaluatedHand } from '../../../lib/games/ada-rollz/types';

interface NextHandModalProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Who won the round */
  winner: 'player' | 'ai' | 'tie';
  /** Chips won (for player wins) */
  potWon: number;
  /** Player's hand */
  playerHand: EvaluatedHand;
  /** AI's hand */
  aiHand: EvaluatedHand;
  /** Whether player can continue (has chips) */
  canContinue: boolean;
  /** Callback for next hand */
  onNextHand: () => void;
  /** Callback for new game (when out of chips) */
  onNewGame: () => void;
}

export function NextHandModal({
  visible,
  winner,
  potWon,
  playerHand,
  aiHand,
  canContinue,
  onNextHand,
  onNewGame,
}: NextHandModalProps) {
  const isWin = winner === 'player';
  const isTie = winner === 'tie';

  const resultText = isWin ? 'YOU WIN!' : isTie ? 'TIE!' : 'YOU LOSE';
  const resultColor = isWin
    ? cyberpunk.success
    : isTie
      ? cyberpunk.warning
      : cyberpunk.error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      accessibilityViewIsModal={true}
      accessibilityLabel="Round result"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Result headline */}
          <Text
            style={[
              styles.resultText,
              { color: resultColor, textShadowColor: resultColor },
            ]}
          >
            {resultText}
          </Text>

          {/* Chips won/lost */}
          {isWin && <Text style={styles.chipsWon}>+{potWon} chips</Text>}
          {!isWin && !isTie && (
            <Text style={styles.chipsLost}>-{Math.floor(potWon / 2)} chips</Text>
          )}

          {/* Hand comparison */}
          <View style={styles.handComparison}>
            <View style={styles.handColumn}>
              <Text style={styles.handLabel}>YOU</Text>
              <Text style={[styles.handName, isWin && styles.winningHand]}>
                {playerHand.displayName}
              </Text>
            </View>

            <Text style={styles.vsText}>vs</Text>

            <View style={styles.handColumn}>
              <Text style={styles.handLabel}>AI</Text>
              <Text
                style={[styles.handName, !isWin && !isTie && styles.winningHand]}
              >
                {aiHand.displayName}
              </Text>
            </View>
          </View>

          {/* Action button */}
          {canContinue ? (
            <Pressable
              onPress={onNextHand}
              accessibilityRole="button"
              accessibilityLabel="Next hand"
              accessibilityHint="Start the next round"
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>NEXT HAND</Text>
            </Pressable>
          ) : (
            <View style={styles.gameOverSection}>
              <Text style={styles.gameOverText}>
                {winner === 'player' ? 'AI is out of chips!' : 'Out of chips!'}
              </Text>
              <Pressable
                onPress={onNewGame}
                accessibilityRole="button"
                accessibilityLabel="New game"
                accessibilityHint="Start a fresh game with reset chips"
                style={({ pressed }) => [
                  styles.button,
                  styles.newGameButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonText}>NEW GAME</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: cyberpunk.bgTertiary,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
  },
  resultText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['3xl'],
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 8,
  },
  chipsWon: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: adaRollz.chipGold,
    textShadowColor: adaRollz.chipGoldGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  chipsLost: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.error,
  },
  handComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  handColumn: {
    alignItems: 'center',
    minWidth: 90,
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
    textAlign: 'center',
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
  button: {
    backgroundColor: cyberpunk.neonCyan,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.bgPrimary,
    letterSpacing: 2,
  },
  gameOverSection: {
    alignItems: 'center',
  },
  gameOverText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.warning,
    marginBottom: 16,
  },
  newGameButton: {
    backgroundColor: cyberpunk.neonMagenta,
  },
});
