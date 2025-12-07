/**
 * AdaSymbol - Cardano ₳ Symbol Component
 *
 * Renders the Cardano/ADA symbol (₳) using SVG paths.
 * The symbol is a capital "A" with two parallel horizontal lines.
 *
 * Color is customizable via props for different visual states:
 * - White (default): Normal state
 * - Cyan: Selected/active state
 * - Magenta: Locked state
 * - Gold: Winning state
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AdaSymbolProps {
  /** Size of the symbol (width and height in dp) */
  size?: number;
  /** Color of the symbol (supports any valid color string) */
  color?: string;
}

/** Default size matches ADA_SYMBOL_SIZE_DP from constants */
const DEFAULT_SIZE_DP = 10;
const DEFAULT_COLOR = '#FFFFFF';

export function AdaSymbol({
  size = DEFAULT_SIZE_DP,
  color = DEFAULT_COLOR,
}: AdaSymbolProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Cardano ADA symbol"
    >
      {/* Main "A" triangle shape */}
      <Path
        d="M12 3L4 21H8L10 16H14L16 21H20L12 3ZM11 13L12 9L13 13H11Z"
        fill={color}
      />
      {/* Upper horizontal bar */}
      <Path
        d="M7.5 18H16.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Lower horizontal bar (distinctive Cardano double-bar) */}
      <Path
        d="M6 20.5H18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
