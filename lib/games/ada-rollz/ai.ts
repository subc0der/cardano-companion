/**
 * AI Decision Logic for ADA Rollz
 *
 * Provides "smart but beatable" AI opponent behavior.
 * The AI uses optimal strategy with occasional mistakes for fairness.
 */

import type { Die, DieValue } from './types';
import { evaluateHand } from './hands';
import { AI_MISTAKE_RATE } from './constants';

/**
 * Count occurrences of each die value.
 */
function countValues(values: DieValue[]): Map<DieValue, number> {
  const counts = new Map<DieValue, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/**
 * Find the value that appears a specific number of times.
 */
function findValueWithCount(
  counts: Map<DieValue, number>,
  targetCount: number
): DieValue | null {
  for (const [value, count] of counts) {
    if (count === targetCount) {
      return value;
    }
  }
  return null;
}

/**
 * Find all values that appear a specific number of times.
 */
function findAllValuesWithCount(
  counts: Map<DieValue, number>,
  targetCount: number
): DieValue[] {
  const result: DieValue[] = [];
  for (const [value, count] of counts) {
    if (count === targetCount) {
      result.push(value);
    }
  }
  return result;
}

/**
 * Determine which dice the AI should hold (keep) for optimal play.
 * Returns array of die IDs to hold.
 *
 * Strategy:
 * - Keep completed strong hands (straights, full house, etc.)
 * - Keep matching dice (pairs, three of a kind, etc.)
 * - For high card, keep the highest value die
 *
 * @param dice - Current dice
 * @param rerollsLeft - Number of rerolls remaining
 * @returns Array of die IDs to hold
 */
function getOptimalHold(dice: Die[], rerollsLeft: number): string[] {
  const hand = evaluateHand(dice);
  const values = dice.map((d) => d.value);
  const counts = countValues(values);

  // Strong hands: keep everything
  if (
    hand.rank === 'five_of_a_kind' ||
    hand.rank === 'large_straight' ||
    hand.rank === 'full_house'
  ) {
    return dice.map((d) => d.id);
  }

  // Four of a kind: keep the four matching dice
  if (hand.rank === 'four_of_a_kind') {
    const fourValue = findValueWithCount(counts, 4);
    if (fourValue !== null) {
      return dice.filter((d) => d.value === fourValue).map((d) => d.id);
    }
  }

  // Small straight: keep all (try to complete large straight)
  if (hand.rank === 'small_straight') {
    return dice.map((d) => d.id);
  }

  // Three of a kind: keep the three matching dice
  if (hand.rank === 'three_of_a_kind') {
    const threeValue = findValueWithCount(counts, 3);
    if (threeValue !== null) {
      return dice.filter((d) => d.value === threeValue).map((d) => d.id);
    }
  }

  // Two pair or one pair: keep all pairs
  if (hand.rank === 'two_pair' || hand.rank === 'one_pair') {
    const pairValues = findAllValuesWithCount(counts, 2);
    return dice.filter((d) => pairValues.includes(d.value)).map((d) => d.id);
  }

  // High card: keep the single highest die
  const sortedDice = [...dice].sort((a, b) => b.value - a.value);
  return [sortedDice[0].id];
}

/**
 * AI decision with occasional "mistakes" for fairness.
 * Makes the AI challenging but beatable.
 *
 * @param dice - Current dice
 * @param rerollsLeft - Number of rerolls remaining
 * @returns Array of die IDs to hold
 */
export function aiDecideHold(dice: Die[], rerollsLeft: number): string[] {
  const optimalHold = getOptimalHold(dice, rerollsLeft);

  // Small chance to make a suboptimal decision
  if (Math.random() < AI_MISTAKE_RATE && optimalHold.length > 1) {
    // "Accidentally" release one die that should be held
    return optimalHold.slice(0, -1);
  }

  return optimalHold;
}

/**
 * Determine if the AI should reroll.
 * AI always rerolls if it can improve (has dice not held).
 *
 * @param dice - Current dice
 * @param heldDiceIds - IDs of dice being held
 * @param rerollsLeft - Number of rerolls remaining
 * @returns Whether the AI should reroll
 */
export function aiShouldReroll(
  dice: Die[],
  heldDiceIds: string[],
  rerollsLeft: number
): boolean {
  // Can't reroll without rerolls left
  if (rerollsLeft <= 0) {
    return false;
  }

  // Check if there are dice to reroll
  const unheldCount = dice.filter((d) => !heldDiceIds.includes(d.id)).length;

  // Reroll if there are unheld dice
  return unheldCount > 0;
}
