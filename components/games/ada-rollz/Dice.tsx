/**
 * Dice - Single Die Component
 *
 * Renders a single die with dots arranged in traditional patterns.
 * Supports multiple visual states: idle, rolling, selected, locked.
 * Tap to toggle hold/release for reroll.
 */

import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import {
  DICE_SIZE_DP,
  DICE_BORDER_RADIUS_DP,
  DICE_BORDER_WIDTH_DP,
  DOT_SIZE_DP,
  DICE_DOT_COLOR,
  DICE_FACE_LAYOUTS,
} from '../../../lib/games/ada-rollz/constants';
import type { Die as DieType, DieValue } from '../../../lib/games/ada-rollz/types';

interface DiceProps {
  /** Die data including value and state */
  die: DieType;
  /** Callback when die is pressed (for hold/release toggle) */
  onPress?: () => void;
  /** Whether the die can be interacted with */
  disabled?: boolean;
  /** Override the default size */
  size?: number;
}

/** Get border color based on die state */
function getBorderColor(state: DieType['state'], isHeld: boolean): string {
  if (isHeld || state === 'selected') {
    return adaRollz.diceSelected;
  }
  if (state === 'locked') {
    return adaRollz.diceLocked;
  }
  return adaRollz.diceBorder;
}

/** Grid cell size for dot positioning (3x3 grid) */
const GRID_CELLS = 3;

export function Dice({
  die,
  onPress,
  disabled = false,
  size = DICE_SIZE_DP,
}: DiceProps) {
  const { value, state, isHeld } = die;

  // Calculate positions for dots based on die value
  const dotPositions = useMemo(() => {
    const layout = DICE_FACE_LAYOUTS[value];
    const cellSize = (size - DICE_BORDER_WIDTH_DP * 2) / GRID_CELLS;
    const dotOffset = (cellSize - DOT_SIZE_DP) / 2;

    return layout.map((pos) => ({
      top: pos.row * cellSize + dotOffset + DICE_BORDER_WIDTH_DP,
      left: pos.col * cellSize + dotOffset + DICE_BORDER_WIDTH_DP,
    }));
  }, [value, size]);

  const borderColor = getBorderColor(state, isHeld);

  // Accessibility: describe the die state
  const accessibilityLabel = `Die showing ${value}${isHeld ? ', held for reroll' : ''}`;
  const accessibilityHint = disabled
    ? undefined
    : isHeld
      ? 'Double tap to release and include in reroll'
      : 'Double tap to hold and keep this die';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected: isHeld, disabled }}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: DICE_BORDER_RADIUS_DP,
            borderWidth: DICE_BORDER_WIDTH_DP,
            borderColor,
          },
        ]}
      >
        <LinearGradient
          colors={[adaRollz.diceBackground, cyberpunk.bgElevated]}
          style={[
            styles.gradient,
            { borderRadius: DICE_BORDER_RADIUS_DP - DICE_BORDER_WIDTH_DP },
          ]}
        >
          {/* Render dots at calculated positions */}
          {dotPositions.map((pos, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  top: pos.top,
                  left: pos.left,
                  width: DOT_SIZE_DP,
                  height: DOT_SIZE_DP,
                  borderRadius: DOT_SIZE_DP / 2,
                  backgroundColor: DICE_DOT_COLOR,
                },
              ]}
            />
          ))}
        </LinearGradient>

        {/* Glow overlay when selected/held */}
        {(isHeld || state === 'selected') && (
          <View
            style={[
              styles.glowOverlay,
              {
                borderRadius: DICE_BORDER_RADIUS_DP,
                backgroundColor: cyberpunk.glowCyan,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    // Pressable wrapper for touch handling
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    pointerEvents: 'none',
  },
});
