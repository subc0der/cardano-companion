/**
 * Hand Evaluation Logic for ADA Rollz
 *
 * Evaluates a set of 5 dice to determine the poker-style hand ranking.
 * Used for both player and AI hands.
 */

import type { Die, DieValue, EvaluatedHand, HandRank } from './types';
import {
  HAND_RANKINGS,
  SMALL_STRAIGHT_PATTERNS,
  LARGE_STRAIGHT_PATTERNS,
} from './constants';

/**
 * Count occurrences of each die value.
 * @param values - Array of die values
 * @returns Map of value to count
 */
function countValues(values: DieValue[]): Map<DieValue, number> {
  const counts = new Map<DieValue, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/**
 * Get array of counts (e.g., [3, 2] for full house).
 */
function getCountArray(counts: Map<DieValue, number>): number[] {
  return Array.from(counts.values()).sort((a, b) => b - a);
}

/**
 * Check if hand contains five of a kind (all same value).
 */
function isFiveOfAKind(countArray: number[]): boolean {
  return countArray[0] === 5;
}

/**
 * Check if hand contains four of a kind.
 */
function isFourOfAKind(countArray: number[]): boolean {
  return countArray[0] === 4;
}

/**
 * Check if hand is a full house (three of a kind + pair).
 */
function isFullHouse(countArray: number[]): boolean {
  return countArray[0] === 3 && countArray[1] === 2;
}

/**
 * Check if hand contains three of a kind (but not full house).
 */
function isThreeOfAKind(countArray: number[]): boolean {
  return countArray[0] === 3 && countArray[1] !== 2;
}

/**
 * Check if hand contains two pairs.
 */
function isTwoPair(countArray: number[]): boolean {
  return countArray[0] === 2 && countArray[1] === 2;
}

/**
 * Check if hand contains one pair.
 */
function isOnePair(countArray: number[]): boolean {
  return countArray[0] === 2 && countArray[1] !== 2;
}

/**
 * Check if hand is a large straight (5 sequential values).
 * Valid: 1-2-3-4-5 or 2-3-4-5-6
 */
function isLargeStraight(values: DieValue[]): boolean {
  const sorted = [...new Set(values)].sort((a, b) => a - b);

  // Must have exactly 5 unique values
  if (sorted.length !== 5) {
    return false;
  }

  // Check against valid patterns
  return LARGE_STRAIGHT_PATTERNS.some(
    (pattern) =>
      pattern.length === sorted.length &&
      pattern.every((val, idx) => val === sorted[idx])
  );
}

/**
 * Check if hand is a small straight (4 sequential values).
 * Valid: 1-2-3-4, 2-3-4-5, or 3-4-5-6
 */
function isSmallStraight(values: DieValue[]): boolean {
  const unique = new Set(values);

  // Need at least 4 unique values
  if (unique.size < 4) {
    return false;
  }

  // Check if any small straight pattern is present
  return SMALL_STRAIGHT_PATTERNS.some((pattern) =>
    pattern.every((val) => unique.has(val))
  );
}

/**
 * Create an evaluated hand result.
 */
function makeHand(rank: HandRank, values: DieValue[]): EvaluatedHand {
  const ranking = HAND_RANKINGS[rank];
  return {
    rank,
    rankValue: ranking.value,
    highDice: [...values].sort((a, b) => b - a),
    displayName: ranking.name,
  };
}

/**
 * Evaluate a hand of 5 dice and return the ranking.
 * Checks from highest to lowest ranking for first match.
 *
 * @param dice - Array of 5 Die objects
 * @returns Evaluated hand with rank and comparison values
 */
export function evaluateHand(dice: Die[]): EvaluatedHand {
  const values = dice.map((d) => d.value);
  const counts = countValues(values);
  const countArray = getCountArray(counts);

  // Check hands from highest to lowest rank
  if (isFiveOfAKind(countArray)) {
    return makeHand('five_of_a_kind', values);
  }

  if (isFourOfAKind(countArray)) {
    return makeHand('four_of_a_kind', values);
  }

  if (isLargeStraight(values)) {
    return makeHand('large_straight', values);
  }

  if (isFullHouse(countArray)) {
    return makeHand('full_house', values);
  }

  if (isSmallStraight(values)) {
    return makeHand('small_straight', values);
  }

  if (isThreeOfAKind(countArray)) {
    return makeHand('three_of_a_kind', values);
  }

  if (isTwoPair(countArray)) {
    return makeHand('two_pair', values);
  }

  if (isOnePair(countArray)) {
    return makeHand('one_pair', values);
  }

  return makeHand('high_card', values);
}

/**
 * Compare two hands to determine the winner.
 *
 * @param handA - First hand
 * @param handB - Second hand
 * @returns 1 if A wins, -1 if B wins, 0 if tie
 */
export function compareHands(
  handA: EvaluatedHand,
  handB: EvaluatedHand
): -1 | 0 | 1 {
  // Compare rank values first
  if (handA.rankValue !== handB.rankValue) {
    return handA.rankValue > handB.rankValue ? 1 : -1;
  }

  // Tie-break by comparing highest dice
  for (let i = 0; i < handA.highDice.length; i++) {
    if (handA.highDice[i] !== handB.highDice[i]) {
      return handA.highDice[i] > handB.highDice[i] ? 1 : -1;
    }
  }

  // Complete tie
  return 0;
}
