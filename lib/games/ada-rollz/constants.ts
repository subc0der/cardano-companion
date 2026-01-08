/**
 * ADA Rollz - Game Constants
 *
 * All magic numbers are defined here with descriptive names.
 * Units are included in constant names where applicable.
 */

import type { HandRank, DieValue } from './types';
import { cyberpunk } from '../../theme/colors';

// Re-export shared dice constant for convenience
export { DICE_COUNT } from '../shared/dice';

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

/** Number of chips each player starts with */
export const INITIAL_CHIPS = 100;

/** Points value per chip (chips × this = total points) */
export const POINTS_PER_CHIP = 100;

/** Initial total points (INITIAL_CHIPS × POINTS_PER_CHIP) */
export const INITIAL_POINTS = 10_000;

/** Minimum bet in chips */
export const MIN_BET_CHIPS = 1;

/** Maximum rerolls allowed per round */
export const MAX_REROLLS = 2;

// =============================================================================
// TIMING (in milliseconds)
// =============================================================================

/** Delay for AI "thinking" before making decisions */
export const AI_THINK_DELAY_MS = 800;

/** Duration of dice roll animation */
export const ROLL_ANIMATION_DURATION_MS = 600;

/** Delay between AI reroll decision and execution */
export const AI_REROLL_DELAY_MS = 500;

/** Delay before showing result after reveal */
export const RESULT_DELAY_MS = 1000;

/** Brief delay for rolling phase transition animation */
export const ROLL_PHASE_TRANSITION_MS = 100;

// =============================================================================
// AI CONFIGURATION
// =============================================================================

/**
 * Probability that AI makes a suboptimal decision.
 * Range: 0.0 (never) to 1.0 (always), where 0.05 = 5% chance.
 * Makes the game more fair and less frustrating.
 * At 5%, AI occasionally releases one held die (only when holding 2+ dice).
 * Value tuned to provide challenging but beatable gameplay.
 */
export const AI_MISTAKE_RATE = 0.05;

// =============================================================================
// VISUAL DIMENSIONS (in density-independent pixels)
// =============================================================================

/** Size of each die (width and height) */
export const DICE_SIZE_DP = 56;

/** Corner radius for dice */
export const DICE_BORDER_RADIUS_DP = 8;

/** Border width for dice */
export const DICE_BORDER_WIDTH_DP = 2;

/** Size of dots on each die */
export const DOT_SIZE_DP = 10;

/** Color of dots on dice face */
export const DICE_DOT_COLOR = cyberpunk.success;

/** Spacing between dice in a hand */
export const DICE_SPACING_DP = 8;

// =============================================================================
// HAND RANKINGS
// =============================================================================

/**
 * Hand rankings with numeric values for comparison.
 * Higher value = better hand.
 */
export const HAND_RANKINGS: Record<HandRank, { value: number; name: string }> = {
  high_card: { value: 1, name: 'High Card' },
  one_pair: { value: 2, name: 'One Pair' },
  two_pair: { value: 3, name: 'Two Pair' },
  three_of_a_kind: { value: 4, name: 'Three of a Kind' },
  small_straight: { value: 5, name: 'Small Straight' },
  full_house: { value: 6, name: 'Full House' },
  large_straight: { value: 7, name: 'Large Straight' },
  four_of_a_kind: { value: 8, name: 'Four of a Kind' },
  five_of_a_kind: { value: 9, name: 'FIVE OF A KIND!' },
} as const;

// =============================================================================
// DICE FACE LAYOUTS
// =============================================================================

/**
 * Positions of ADA symbols on each die face.
 * Uses a 3x3 grid (rows 0-2, cols 0-2).
 * Matches traditional dice dot patterns.
 */
export const DICE_FACE_LAYOUTS: Record<DieValue, { row: number; col: number }[]> = {
  1: [
    { row: 1, col: 1 }, // Center
  ],
  2: [
    { row: 0, col: 0 }, // Top-left
    { row: 2, col: 2 }, // Bottom-right
  ],
  3: [
    { row: 0, col: 0 }, // Top-left
    { row: 1, col: 1 }, // Center
    { row: 2, col: 2 }, // Bottom-right
  ],
  4: [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: 2 }, // Top-right
    { row: 2, col: 0 }, // Bottom-left
    { row: 2, col: 2 }, // Bottom-right
  ],
  5: [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: 2 }, // Top-right
    { row: 1, col: 1 }, // Center
    { row: 2, col: 0 }, // Bottom-left
    { row: 2, col: 2 }, // Bottom-right
  ],
  6: [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: 2 }, // Top-right
    { row: 1, col: 0 }, // Middle-left
    { row: 1, col: 2 }, // Middle-right
    { row: 2, col: 0 }, // Bottom-left
    { row: 2, col: 2 }, // Bottom-right
  ],
} as const;

// =============================================================================
// STRAIGHT DETECTION
// =============================================================================

/**
 * Valid small straight combinations (4 sequential dice).
 * Used for hand evaluation.
 */
export const SMALL_STRAIGHT_PATTERNS: DieValue[][] = [
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6],
] as const;

/**
 * Valid large straight combinations (5 sequential dice).
 * Used for hand evaluation.
 */
export const LARGE_STRAIGHT_PATTERNS: DieValue[][] = [
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 6],
] as const;
