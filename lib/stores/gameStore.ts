/**
 * Game Store - State Management for ADA Rollz
 *
 * Manages game state including:
 * - Points/chips balance (persisted)
 * - Current game state (not persisted)
 * - Game actions and flow
 *
 * IMPORTANT: Points have NO monetary value. This is entertainment only.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GameState,
  GamePhase,
  PointsBalance,
  Die,
  RoundResult,
} from '../games/ada-rollz/types';
import {
  INITIAL_CHIPS,
  POINTS_PER_CHIP,
  MAX_REROLLS,
  MIN_BET_CHIPS,
} from '../games/ada-rollz/constants';
import {
  createHand,
  rerollDice,
  toggleDieHold,
  getHeldDiceIds,
  resetDiceHolds,
} from '../games/shared/dice';
import { evaluateHand, compareHands } from '../games/ada-rollz/hands';
import { aiDecideHold, aiShouldReroll } from '../games/ada-rollz/ai';

interface GameStore {
  // Points balance (persisted across sessions)
  points: PointsBalance;

  // Current game state (not persisted - resets on app restart)
  game: GameState | null;

  // Game initialization
  initGame: () => void;
  resetGame: () => void;
  startFreshGame: () => void;

  // Betting phase
  setBet: (chips: number) => void;
  incrementBet: () => void;
  decrementBet: () => void;

  // Rolling phase
  rollDice: () => void;

  // Player turn
  toggleHold: (dieId: string) => void;
  reroll: () => void;
  stand: () => void;

  // AI turn
  executeAiTurn: () => void;

  // Phase transitions
  transitionToPlayerTurn: () => void;

  // Result phase
  revealResult: () => void;
  startNewRound: () => void;

  // Points management (for future Prediction Market)
  addChips: (amount: number) => void;
  deductChips: (amount: number) => boolean;
  resetPoints: () => void;
}

/** Initial points balance */
const INITIAL_POINTS_BALANCE: PointsBalance = {
  chips: INITIAL_CHIPS,
  totalPoints: INITIAL_CHIPS * POINTS_PER_CHIP,
  lifetimeEarned: 0,
  lifetimeLost: 0,
};

/** Create initial game state */
function createInitialGameState(playerChips: number): GameState {
  return {
    phase: 'betting',
    playerDice: createHand(),
    aiDice: createHand(),
    playerChips,
    aiChips: INITIAL_CHIPS,
    pot: 0,
    currentBet: MIN_BET_CHIPS,
    rerollsRemaining: MAX_REROLLS,
    playerHand: null,
    aiHand: null,
    winner: null,
    roundHistory: [],
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      points: INITIAL_POINTS_BALANCE,
      game: null,

      // Initialize a new game
      initGame: () => {
        const { points } = get();
        set({ game: createInitialGameState(points.chips) });
      },

      // Reset game state (keeps points)
      resetGame: () => {
        set({ game: null });
      },

      // Start a completely fresh game (reset all chips)
      startFreshGame: () => {
        set({
          points: INITIAL_POINTS_BALANCE,
          game: createInitialGameState(INITIAL_CHIPS),
        });
      },

      // Set bet amount
      setBet: (chips: number) => {
        const { game } = get();
        if (!game || game.phase !== 'betting') return;

        const maxBet = Math.min(game.playerChips, game.aiChips);
        const validBet = Math.max(MIN_BET_CHIPS, Math.min(chips, maxBet));

        set({
          game: { ...game, currentBet: validBet },
        });
      },

      // Increment bet by 1
      incrementBet: () => {
        const { game, setBet } = get();
        if (!game) return;
        setBet(game.currentBet + 1);
      },

      // Decrement bet by 1
      decrementBet: () => {
        const { game, setBet } = get();
        if (!game) return;
        setBet(game.currentBet - 1);
      },

      // Roll all dice (initial roll)
      // Sets phase to 'rolling'. The component handles the timed transition
      // to 'player_turn' via useEffect with proper cleanup.
      rollDice: () => {
        const { game } = get();
        if (!game || game.phase !== 'betting') return;

        const playerDice = createHand();
        const aiDice = createHand();

        set({
          game: {
            ...game,
            phase: 'rolling',
            playerDice,
            aiDice,
            playerHand: evaluateHand(playerDice),
            aiHand: evaluateHand(aiDice),
            pot: game.currentBet * 2,
            playerChips: game.playerChips - game.currentBet,
            aiChips: game.aiChips - game.currentBet,
            rerollsRemaining: MAX_REROLLS,
          },
        });
      },

      // Transition from rolling phase to player turn
      // Called by component after animation delay with proper cleanup
      transitionToPlayerTurn: () => {
        const { game } = get();
        if (!game || game.phase !== 'rolling') return;

        set({ game: { ...game, phase: 'player_turn' } });
      },

      // Toggle hold on a specific die
      toggleHold: (dieId: string) => {
        const { game } = get();
        if (!game || game.phase !== 'player_turn') return;

        const playerDice = toggleDieHold(game.playerDice, dieId);

        set({
          game: { ...game, playerDice },
        });
      },

      // Reroll unheld dice
      reroll: () => {
        const { game } = get();
        if (!game || game.phase !== 'player_turn' || game.rerollsRemaining <= 0) {
          return;
        }

        const heldIds = getHeldDiceIds(game.playerDice);
        const playerDice = rerollDice(game.playerDice, heldIds);

        set({
          game: {
            ...game,
            playerDice,
            playerHand: evaluateHand(playerDice),
            rerollsRemaining: game.rerollsRemaining - 1,
          },
        });
      },

      // Player stands (ends turn)
      stand: () => {
        const { game } = get();
        if (!game || game.phase !== 'player_turn') return;

        // Reset holds before AI turn
        const playerDice = resetDiceHolds(game.playerDice);

        set({
          game: {
            ...game,
            phase: 'ai_turn',
            playerDice,
          },
        });
      },

      // Execute AI's turn
      executeAiTurn: () => {
        const { game } = get();
        if (!game || game.phase !== 'ai_turn') return;

        let aiDice = [...game.aiDice];
        let rerollsLeft = MAX_REROLLS;

        // AI decision loop (simulated)
        while (rerollsLeft > 0) {
          const heldIds = aiDecideHold(aiDice, rerollsLeft);

          if (!aiShouldReroll(aiDice, heldIds, rerollsLeft)) {
            break;
          }

          aiDice = rerollDice(aiDice, heldIds);
          rerollsLeft--;
        }

        set({
          game: {
            ...game,
            phase: 'reveal',
            aiDice,
            aiHand: evaluateHand(aiDice),
          },
        });
      },

      // Reveal result and determine winner
      revealResult: () => {
        const { game, points } = get();
        if (!game || game.phase !== 'reveal') return;
        if (!game.playerHand || !game.aiHand) return;

        const comparison = compareHands(game.playerHand, game.aiHand);

        let winner: 'player' | 'ai' | 'tie';
        let playerChips = game.playerChips;
        let aiChips = game.aiChips;
        let lifetimeEarned = points.lifetimeEarned;
        let lifetimeLost = points.lifetimeLost;

        if (comparison === 1) {
          winner = 'player';
          playerChips += game.pot;
          lifetimeEarned += game.pot;
        } else if (comparison === -1) {
          winner = 'ai';
          aiChips += game.pot;
          lifetimeLost += game.currentBet;
        } else {
          winner = 'tie';
          // Split pot on tie
          const halfPot = Math.floor(game.pot / 2);
          playerChips += halfPot;
          aiChips += game.pot - halfPot;
        }

        const roundResult: RoundResult = {
          playerHand: game.playerHand,
          aiHand: game.aiHand,
          winner,
          potWon: winner === 'player' ? game.pot : 0,
          timestamp: Date.now(),
        };

        set({
          game: {
            ...game,
            phase: 'result',
            winner,
            playerChips,
            aiChips,
            roundHistory: [...game.roundHistory, roundResult],
          },
          points: {
            chips: playerChips,
            totalPoints: playerChips * POINTS_PER_CHIP,
            lifetimeEarned,
            lifetimeLost,
          },
        });
      },

      // Start a new round
      startNewRound: () => {
        const { game } = get();
        if (!game || game.phase !== 'result') return;

        // Check if either player is out of chips
        if (game.playerChips <= 0 || game.aiChips <= 0) {
          // Game over - reset needed
          return;
        }

        set({
          game: {
            ...game,
            phase: 'betting',
            playerDice: createHand(),
            aiDice: createHand(),
            pot: 0,
            currentBet: Math.min(MIN_BET_CHIPS, game.playerChips, game.aiChips),
            rerollsRemaining: MAX_REROLLS,
            playerHand: null,
            aiHand: null,
            winner: null,
          },
        });
      },

      // Add chips to balance
      addChips: (amount: number) => {
        const { points } = get();
        set({
          points: {
            ...points,
            chips: points.chips + amount,
            totalPoints: (points.chips + amount) * POINTS_PER_CHIP,
            lifetimeEarned: points.lifetimeEarned + amount * POINTS_PER_CHIP,
          },
        });
      },

      // Deduct chips from balance (returns false if insufficient)
      deductChips: (amount: number) => {
        const { points } = get();
        if (points.chips < amount) {
          return false;
        }
        set({
          points: {
            ...points,
            chips: points.chips - amount,
            totalPoints: (points.chips - amount) * POINTS_PER_CHIP,
          },
        });
        return true;
      },

      // Reset points to initial values
      resetPoints: () => {
        set({ points: INITIAL_POINTS_BALANCE });
      },
    }),
    {
      name: 'ada-rollz-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist points, not game state
      partialize: (state) => ({ points: state.points }),
    }
  )
);
