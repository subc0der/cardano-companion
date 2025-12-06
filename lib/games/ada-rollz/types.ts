/**
 * ADA Rollz - Type Definitions
 *
 * Core types for the dice poker game.
 * Designed to be extensible for future games (Liar's Dice, etc.)
 */

/** Valid die face values (1-6) */
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

/** Visual and interaction states for a die */
export type DieState = 'idle' | 'rolling' | 'selected' | 'locked';

/** Represents a single die in the game */
export interface Die {
  /** Unique identifier for React keys and state management */
  id: string;
  /** Current face value shown on the die */
  value: DieValue;
  /** Visual/interaction state */
  state: DieState;
  /** Whether to keep this die during reroll */
  isHeld: boolean;
}

/** Poker-style hand rankings from lowest to highest */
export type HandRank =
  | 'high_card'
  | 'one_pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'small_straight'
  | 'full_house'
  | 'large_straight'
  | 'four_of_a_kind'
  | 'five_of_a_kind';

/** Result of evaluating a hand of dice */
export interface EvaluatedHand {
  /** The type of hand */
  rank: HandRank;
  /** Numeric rank for comparison (1-9, higher is better) */
  rankValue: number;
  /** Sorted die values for tie-breaking (highest first) */
  highDice: DieValue[];
  /** User-friendly display name (e.g., "Full House") */
  displayName: string;
}

/** Phases of a game round */
export type GamePhase =
  | 'betting'
  | 'rolling'
  | 'player_turn'
  | 'ai_turn'
  | 'reveal'
  | 'result';

/** Complete state of an ADA Rollz game */
export interface GameState {
  /** Current phase of the round */
  phase: GamePhase;
  /** Player's 5 dice */
  playerDice: Die[];
  /** AI opponent's 5 dice */
  aiDice: Die[];
  /** Player's chip balance */
  playerChips: number;
  /** AI's chip balance */
  aiChips: number;
  /** Total chips in the current pot */
  pot: number;
  /** Current bet amount for this round */
  currentBet: number;
  /** Rerolls remaining for player (max 2) */
  rerollsRemaining: number;
  /** Player's evaluated hand (null until rolled) */
  playerHand: EvaluatedHand | null;
  /** AI's evaluated hand (null until revealed) */
  aiHand: EvaluatedHand | null;
  /** Winner of the round (null until determined) */
  winner: 'player' | 'ai' | 'tie' | null;
  /** History of completed rounds */
  roundHistory: RoundResult[];
}

/** Result of a completed round */
export interface RoundResult {
  /** Player's final hand */
  playerHand: EvaluatedHand;
  /** AI's final hand */
  aiHand: EvaluatedHand;
  /** Who won the round */
  winner: 'player' | 'ai' | 'tie';
  /** Chips won (or 0 for tie) */
  potWon: number;
  /** When the round ended */
  timestamp: number;
}

/**
 * Points balance for gaming features.
 * Designed for future expansion (Prediction Market, etc.)
 *
 * IMPORTANT: Points have NO monetary value and cannot be
 * exchanged for cryptocurrency, cash, or goods/services.
 * This is entertainment only - NOT gambling.
 */
export interface PointsBalance {
  /** Gaming chips (each worth POINTS_PER_CHIP) */
  chips: number;
  /** Total points (chips × POINTS_PER_CHIP) */
  totalPoints: number;
  /** Lifetime points earned across all games */
  lifetimeEarned: number;
  /** Lifetime points lost across all games */
  lifetimeLost: number;
}
