/**
 * Shared Dice Utilities
 *
 * Common functions for dice operations, shared across games.
 * Used by ADA Rollz and future games like Liar's Dice.
 */

import type { Die, DieValue } from '../ada-rollz/types';

// =============================================================================
// SHARED DICE CONSTANTS
// =============================================================================

/** Number of dice per player (shared across dice games) */
export const DICE_COUNT = 5;

/** Minimum die face value */
const MIN_DIE_VALUE = 1;

/** Maximum die face value */
const MAX_DIE_VALUE = 6;

/**
 * Generate a random die value (1-6).
 * Uses Math.random() for fair, unbiased rolls.
 */
export function rollDieValue(): DieValue {
  return (Math.floor(Math.random() * MAX_DIE_VALUE) + MIN_DIE_VALUE) as DieValue;
}

/**
 * Create a new die with a random value.
 *
 * @param id - Optional ID (generates UUID if not provided)
 * @returns New Die object in idle state
 */
export function createDie(id?: string): Die {
  return {
    id: id ?? generateDieId(),
    value: rollDieValue(),
    state: 'idle',
    isHeld: false,
  };
}

/**
 * Generate a unique ID for a die.
 */
function generateDieId(): string {
  return `die-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a hand of 5 dice with random values.
 *
 * @returns Array of 5 new Die objects
 */
export function createHand(): Die[] {
  return Array.from({ length: DICE_COUNT }, (_, index) =>
    createDie(`die-${index}`)
  );
}

/**
 * Reroll specific dice in a hand (those not held).
 *
 * @param dice - Current dice array
 * @param heldIds - IDs of dice to keep (not reroll)
 * @returns New dice array with unheld dice rerolled
 */
export function rerollDice(dice: Die[], heldIds: string[]): Die[] {
  return dice.map((die) => {
    if (heldIds.includes(die.id)) {
      // Keep held dice unchanged
      return { ...die, state: 'idle' as const };
    }
    // Reroll unheld dice
    return {
      ...die,
      value: rollDieValue(),
      state: 'idle' as const,
      isHeld: false,
    };
  });
}

/**
 * Toggle the held state of a specific die.
 *
 * @param dice - Current dice array
 * @param dieId - ID of the die to toggle
 * @returns New dice array with toggled die
 */
export function toggleDieHold(dice: Die[], dieId: string): Die[] {
  return dice.map((die) => {
    if (die.id !== dieId) {
      return die;
    }
    return {
      ...die,
      isHeld: !die.isHeld,
      state: die.isHeld ? 'idle' : 'selected',
    };
  });
}

/**
 * Get IDs of all held dice.
 *
 * @param dice - Current dice array
 * @returns Array of held die IDs
 */
export function getHeldDiceIds(dice: Die[]): string[] {
  return dice.filter((d) => d.isHeld).map((d) => d.id);
}

/**
 * Reset all dice to unheld state.
 *
 * @param dice - Current dice array
 * @returns New dice array with all dice unheld
 */
export function resetDiceHolds(dice: Die[]): Die[] {
  return dice.map((die) => ({
    ...die,
    isHeld: false,
    state: 'idle' as const,
  }));
}
