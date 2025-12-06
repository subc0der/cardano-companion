/**
 * Games Screen - ADA Rollz
 *
 * Main game screen for the dice poker game.
 * Manages game flow and coordinates component rendering.
 *
 * ENTERTAINMENT ONLY: Points have no monetary value.
 * This is NOT gambling.
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { useGameStore } from '../../lib/stores/gameStore';
import {
  GameHeader,
  DiceHand,
  BetControls,
  PotDisplay,
  GameActions,
  NextHandModal,
} from '../../components/games/ada-rollz';
import {
  AI_THINK_DELAY_MS,
  RESULT_DELAY_MS,
} from '../../lib/games/ada-rollz/constants';

export default function GamesScreen() {
  const {
    game,
    initGame,
    incrementBet,
    decrementBet,
    rollDice,
    toggleHold,
    reroll,
    stand,
    executeAiTurn,
    revealResult,
    startNewRound,
    startFreshGame,
  } = useGameStore();

  // Initialize game on mount if not already initialized
  useEffect(() => {
    if (!game) {
      initGame();
    }
  }, [game, initGame]);

  // Handle AI turn automatically
  useEffect(() => {
    if (game?.phase === 'ai_turn') {
      const timer = setTimeout(() => {
        executeAiTurn();
      }, AI_THINK_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [game?.phase, executeAiTurn]);

  // Handle reveal phase automatically
  useEffect(() => {
    if (game?.phase === 'reveal') {
      const timer = setTimeout(() => {
        revealResult();
      }, RESULT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [game?.phase, revealResult]);

  // Memoized callbacks
  const handleDiePress = useCallback(
    (dieId: string) => {
      toggleHold(dieId);
    },
    [toggleHold]
  );

  // Loading state
  if (!game) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const maxBet = Math.min(game.playerChips, game.aiChips);
  const canPlay = game.playerChips > 0 && game.aiChips > 0;
  const isPlayerTurn = game.phase === 'player_turn';
  const showResultModal =
    game.phase === 'result' &&
    game.winner !== null &&
    game.playerHand !== null &&
    game.aiHand !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header with title and both chip balances */}
        <GameHeader
          playerChips={game.playerChips}
          aiChips={game.aiChips}
          onNewGame={startFreshGame}
        />

        {/* Opponent's hand (hidden until reveal) */}
        <DiceHand
          dice={game.aiDice}
          hand={game.aiHand}
          label="OPPONENT"
          interactive={false}
          hidden={game.phase !== 'reveal' && game.phase !== 'result'}
        />

        {/* Central pot display */}
        <View style={styles.potContainer}>
          <PotDisplay pot={game.pot} />
        </View>

        {/* Player's hand */}
        <DiceHand
          dice={game.playerDice}
          hand={game.playerHand}
          label="YOUR HAND"
          interactive={isPlayerTurn}
          hidden={false}
          onDiePress={handleDiePress}
        />

        {/* Betting controls (only during betting phase) */}
        {game.phase === 'betting' && (
          <View style={styles.betContainer}>
            <BetControls
              currentBet={game.currentBet}
              maxBet={maxBet}
              onIncrement={incrementBet}
              onDecrement={decrementBet}
            />
          </View>
        )}

        {/* Action buttons */}
        <GameActions
          phase={game.phase}
          rerollsRemaining={game.rerollsRemaining}
          onRoll={rollDice}
          onReroll={reroll}
          onStand={stand}
          onNewRound={startNewRound}
          canPlay={canPlay}
        />

        {/* Legal disclaimer */}
        <Text style={styles.disclaimer}>
          Entertainment only. No monetary value.
        </Text>
      </View>

      {/* Result Modal (appears after each hand) */}
      {showResultModal && game.winner && game.playerHand && game.aiHand && (
        <NextHandModal
          visible={showResultModal}
          winner={game.winner}
          potWon={game.pot}
          playerHand={game.playerHand}
          aiHand={game.aiHand}
          canContinue={canPlay}
          onNextHand={startNewRound}
          onNewGame={startFreshGame}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textSecondary,
  },
  potContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  betContainer: {
    marginTop: 8,
  },
  disclaimer: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
