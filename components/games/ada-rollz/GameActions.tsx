/**
 * GameActions - Action Buttons Component
 *
 * Displays the available action buttons based on current game phase.
 * Supports: Roll, Reroll, Stand, New Round
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { cyberpunk } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';
import type { GamePhase } from '../../../lib/games/ada-rollz/types';

interface GameActionsProps {
  /** Current game phase */
  phase: GamePhase;
  /** Rerolls remaining for player */
  rerollsRemaining: number;
  /** Callback for roll action */
  onRoll: () => void;
  /** Callback for reroll action */
  onReroll: () => void;
  /** Callback for stand action */
  onStand: () => void;
  /** Callback for new round action */
  onNewRound: () => void;
  /** Whether player can afford to play */
  canPlay: boolean;
}

export function GameActions({
  phase,
  rerollsRemaining,
  onRoll,
  onReroll,
  onStand,
  onNewRound,
  canPlay,
}: GameActionsProps) {
  // Betting phase: show Roll button
  if (phase === 'betting') {
    return (
      <View style={styles.container}>
        <ActionButton
          label="ROLL"
          onPress={onRoll}
          disabled={!canPlay}
          primary
          accessibilityHint="Roll all dice to start the round"
        />
      </View>
    );
  }

  // Player turn: show Reroll and Stand buttons
  if (phase === 'player_turn') {
    const canReroll = rerollsRemaining > 0;

    return (
      <View style={styles.container}>
        <View style={styles.buttonRow}>
          <ActionButton
            label={`REROLL (${rerollsRemaining})`}
            onPress={onReroll}
            disabled={!canReroll}
            primary
            accessibilityHint={
              canReroll
                ? `Reroll unheld dice. ${rerollsRemaining} rerolls remaining`
                : 'No rerolls remaining'
            }
          />
          <ActionButton
            label="STAND"
            onPress={onStand}
            secondary
            accessibilityHint="Keep current hand and end your turn"
          />
        </View>
        <Text style={styles.hintText}>
          Tap dice to hold, then reroll or stand
        </Text>
      </View>
    );
  }

  // Result phase: show New Round button
  if (phase === 'result') {
    return (
      <View style={styles.container}>
        <ActionButton
          label="NEW ROUND"
          onPress={onNewRound}
          disabled={!canPlay}
          primary
          accessibilityHint="Start a new round of ADA Rollz"
        />
      </View>
    );
  }

  // Other phases (rolling, ai_turn, reveal): no actions
  return (
    <View style={styles.container}>
      <Text style={styles.waitingText}>
        {phase === 'ai_turn' && 'Opponent is thinking...'}
        {phase === 'reveal' && 'Revealing hands...'}
        {phase === 'rolling' && 'Rolling...'}
      </Text>
    </View>
  );
}

// =============================================================================
// ActionButton subcomponent
// =============================================================================

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
  secondary?: boolean;
  accessibilityHint?: string;
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  primary = false,
  secondary = false,
  accessibilityHint,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        primary && styles.buttonPrimary,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          primary && styles.buttonTextPrimary,
          secondary && styles.buttonTextSecondary,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: cyberpunk.neonCyan,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: cyberpunk.neonCyan,
  },
  buttonDisabled: {
    backgroundColor: cyberpunk.bgTertiary,
    borderColor: cyberpunk.textMuted,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    letterSpacing: 2,
  },
  buttonTextPrimary: {
    color: cyberpunk.bgPrimary,
  },
  buttonTextSecondary: {
    color: cyberpunk.neonCyan,
  },
  buttonTextDisabled: {
    color: cyberpunk.textMuted,
  },
  hintText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginTop: 8,
  },
  waitingText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
    fontStyle: 'italic',
  },
});
