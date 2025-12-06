# ADA Rollz - Technical Design Document

## Overview

**ADA Rollz** is a dice poker game that replaces the planned "Flip" feature. Players roll 5 dice, choose which to keep, and reroll to build poker-style hands. Points-based betting with no monetary value - purely for entertainment.

### Design Goals
1. **Performance first** - 60fps animations, efficient renders
2. **Stunning visuals** - Cyberpunk aesthetic with glowing dice
3. **Future-proof** - Architecture supports Liar's Dice and Prediction Market
4. **Legal clarity** - No gambling, points have no cash value

---

## Game Rules

### Basic Flow
1. Player places a bet (chips)
2. Both player and AI roll 5 dice
3. Player chooses dice to keep (0-5)
4. Player rerolls remaining dice (up to 2 rerolls total)
5. AI makes its decisions
6. Best hand wins the pot

### Hand Rankings (Lowest to Highest)

| Rank | Hand | Description | Example |
|------|------|-------------|---------|
| 1 | High Card | No matching dice | ₳1, ₳2, ₳3, ₳4, ₳6 |
| 2 | One Pair | Two matching | ₳3, ₳3, ₳1, ₳4, ₳6 |
| 3 | Two Pair | Two different pairs | ₳2, ₳2, ₳5, ₳5, ₳1 |
| 4 | Three of a Kind | Three matching | ₳4, ₳4, ₳4, ₳1, ₳6 |
| 5 | Small Straight | 4 sequential (1-4 or 2-5 or 3-6) | ₳1, ₳2, ₳3, ₳4, ₳6 |
| 6 | Full House | Three + Pair | ₳3, ₳3, ₳3, ₳5, ₳5 |
| 7 | Large Straight | 5 sequential (1-5 or 2-6) | ₳1, ₳2, ₳3, ₳4, ₳5 |
| 8 | Four of a Kind | Four matching | ₳2, ₳2, ₳2, ₳2, ₳5 |
| 9 | Five of a Kind | All matching (Jackpot!) | ₳6, ₳6, ₳6, ₳6, ₳6 |

### Tie Breaker
- Higher hand rank wins
- If same rank, compare highest die values
- If still tied, pot splits

### Starting State
- Each player: 100 chips × 100 points = **10,000 points**
- Minimum bet: 1 chip (100 points)
- Maximum bet: Player's total chips

---

## Visual Design

### Dice Design

**Custom Cardano Dice** featuring the ADA/Lovelace symbol (₳):
- Instead of dots (1-6), dice show 1-6 Cardano symbols
- Each symbol is the iconic "₳" (A with double horizontal lines)

#### Asset Requirements

**You need to create:** A single SVG or PNG of the Cardano ₳ symbol

| Specification | Value |
|---------------|-------|
| Format | SVG (preferred) or PNG |
| Size | 64×64px (will be scaled) |
| Color | White (#FFFFFF) - we'll apply glow via code |
| Background | Transparent |
| File location | `assets/images/ada-symbol.svg` |
| Style | Clean, minimal, matches Cardano brand |

The symbol looks like:
```
   /\
  /  \
 /----\
/  ——  \
```
(Capital A with two parallel horizontal lines instead of one)

**Alternative:** I can create this programmatically using react-native-svg Path elements if you prefer not to create an image file.

### Dice Visual Specifications

```
┌─────────────────┐
│                 │
│   ₳   ₳   ₳     │  ← 3 symbols for value "3"
│                 │
│   ₳   ₳   ₳     │  ← Arranged in grid pattern
│                 │
└─────────────────┘
```

| Property | Value |
|----------|-------|
| Dice size | 56×56dp (responsive) |
| Corner radius | 8dp |
| Background | Gradient: `#1A1A2E` → `#252538` |
| Border | 2px, color based on state |
| Glow | Cyan when selected, subtle white otherwise |
| Symbol color | White with cyan/magenta glow |
| Animation | 3D rotation on roll, bounce on land |

### Dice States

| State | Border Color | Glow | Animation |
|-------|--------------|------|-----------|
| Idle | `#1A1A2E` | None | None |
| Rolling | Cyan pulse | Intense cyan | 3D spin |
| Selected (keep) | `#00FFFF` | Cyan glow | Pulse |
| Locked | `#FF00FF` | Magenta | None |
| Winning | `#00FF88` | Green pulse | Celebration |

### Color Scheme (Extends Existing Theme)

```typescript
// New additions to colors.ts
export const adaRollz = {
  diceGradientStart: '#1A1A2E',
  diceGradientEnd: '#252538',
  diceBorder: '#2A2A3E',
  diceSelected: '#00FFFF',
  diceLocked: '#FF00FF',
  chipGold: '#FFD700',
  chipGoldGlow: 'rgba(255, 215, 0, 0.4)',
  potGlow: 'rgba(0, 255, 136, 0.3)',
  tableGreen: '#0A1A0F',
  tableBorder: '#00FF88',
};
```

### UI Layout

```
┌──────────────────────────────────────┐
│  ADA ROLLZ              💰 85 chips  │  ← Header
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │     OPPONENT (AI)              │  │
│  │   [?] [?] [?] [?] [?]          │  │  ← Hidden until reveal
│  │     Hand: ???                  │  │
│  └────────────────────────────────┘  │
│                                      │
│          ┌─────────────┐             │
│          │   POT: 20   │             │  ← Central pot display
│          │   chips     │             │
│          └─────────────┘             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     YOUR HAND                  │  │
│  │   [₳₳] [₳₳₳] [₳] [₳₳₳₳] [₳₳]  │  │  ← Tap to select
│  │     Hand: Two Pair             │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  BET: [-] 10 chips [+]         │  │  ← Betting controls
│  └────────────────────────────────┘  │
│                                      │
│  ┌──────────┐     ┌──────────────┐   │
│  │  ROLL    │     │  STAND       │   │  ← Action buttons
│  └──────────┘     └──────────────┘   │
│                                      │
│  Rerolls remaining: 2                │  ← Status
└──────────────────────────────────────┘
```

---

## Architecture

### Directory Structure

```
cardano-companion/
├── app/
│   └── (tabs)/
│       └── games.tsx              # Renamed from flip.tsx (games hub)
│
├── components/
│   └── games/                     # NEW: Games components
│       ├── ada-rollz/             # ADA Rollz specific
│       │   ├── Dice.tsx           # Single die component
│       │   ├── DiceHand.tsx       # 5 dice container
│       │   ├── DiceSymbol.tsx     # ₳ symbol renderer
│       │   ├── BetControls.tsx    # Bet adjustment UI
│       │   ├── PotDisplay.tsx     # Central pot
│       │   ├── HandRank.tsx       # Shows current hand name
│       │   ├── GameBoard.tsx      # Main game layout
│       │   ├── OpponentHand.tsx   # AI's dice (hidden/revealed)
│       │   ├── GameOverModal.tsx  # Win/lose result
│       │   └── ChipCounter.tsx    # Animated chip display
│       │
│       └── shared/                # Shared across games (Liar's Dice later)
│           ├── ChipStack.tsx      # Visual chip pile
│           ├── GameHeader.tsx     # Title + chip balance
│           └── TurnIndicator.tsx  # Whose turn
│
├── lib/
│   ├── games/                     # NEW: Game logic
│   │   ├── ada-rollz/
│   │   │   ├── types.ts           # TypeScript types
│   │   │   ├── constants.ts       # Game constants
│   │   │   ├── hands.ts           # Hand evaluation logic
│   │   │   ├── ai.ts              # AI decision making
│   │   │   └── utils.ts           # Helper functions
│   │   │
│   │   └── shared/
│   │       ├── dice.ts            # Dice utilities (shared w/ Liar's Dice)
│   │       └── points.ts          # Points/chips utilities
│   │
│   ├── stores/
│   │   └── gameStore.ts           # NEW: Game state (Zustand)
│   │
│   └── hooks/
│       └── useAdaRollz.ts         # NEW: Game hook
│
└── assets/
    └── images/
        └── ada-symbol.svg         # NEW: Cardano symbol
```

### Type Definitions

```typescript
// lib/games/ada-rollz/types.ts

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type DieState = 'idle' | 'rolling' | 'selected' | 'locked';

export interface Die {
  id: string;           // Unique identifier
  value: DieValue;      // Current face value
  state: DieState;      // Visual/interaction state
  isHeld: boolean;      // Keep on reroll?
}

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

export interface EvaluatedHand {
  rank: HandRank;
  rankValue: number;    // 1-9 for comparison
  highDice: DieValue[]; // For tie-breaking
  displayName: string;  // "Full House", etc.
}

export type GamePhase =
  | 'betting'           // Player sets bet amount
  | 'initial_roll'      // First roll
  | 'player_turn'       // Player selecting dice
  | 'player_reroll'     // Rerolling animation
  | 'ai_turn'           // AI decision phase
  | 'reveal'            // Show AI hand
  | 'result';           // Winner declared

export interface GameState {
  phase: GamePhase;
  playerDice: Die[];
  aiDice: Die[];
  playerChips: number;
  aiChips: number;
  pot: number;
  currentBet: number;
  rerollsRemaining: number;  // Max 2
  playerHand: EvaluatedHand | null;
  aiHand: EvaluatedHand | null;
  winner: 'player' | 'ai' | 'tie' | null;
  roundHistory: RoundResult[];
}

export interface RoundResult {
  playerHand: EvaluatedHand;
  aiHand: EvaluatedHand;
  winner: 'player' | 'ai' | 'tie';
  potWon: number;
  timestamp: number;
}

// For future Prediction Market integration
export interface PointsBalance {
  chips: number;        // Gaming chips (100 points each)
  totalPoints: number;  // chips × 100
  lifetimeEarned: number;
  lifetimeLost: number;
}
```

### Constants

```typescript
// lib/games/ada-rollz/constants.ts

export const GAME_CONFIG = {
  INITIAL_CHIPS: 100,
  POINTS_PER_CHIP: 100,
  INITIAL_POINTS: 10000,  // 100 × 100
  MIN_BET: 1,
  MAX_REROLLS: 2,
  DICE_COUNT: 5,
  AI_THINK_DELAY_MS: 800,
  ROLL_ANIMATION_MS: 600,
} as const;

export const HAND_RANKINGS: Record<HandRank, { value: number; name: string }> = {
  high_card:        { value: 1, name: 'High Card' },
  one_pair:         { value: 2, name: 'One Pair' },
  two_pair:         { value: 3, name: 'Two Pair' },
  three_of_a_kind:  { value: 4, name: 'Three of a Kind' },
  small_straight:   { value: 5, name: 'Small Straight' },
  full_house:       { value: 6, name: 'Full House' },
  large_straight:   { value: 7, name: 'Large Straight' },
  four_of_a_kind:   { value: 8, name: 'Four of a Kind' },
  five_of_a_kind:   { value: 9, name: 'FIVE OF A KIND!' },
} as const;

// Dice face layouts (positions of ₳ symbols)
export const DICE_LAYOUTS: Record<DieValue, { row: number; col: number }[]> = {
  1: [{ row: 1, col: 1 }],
  2: [{ row: 0, col: 0 }, { row: 2, col: 2 }],
  3: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
  4: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  5: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  6: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
} as const;
```

### State Management (Zustand)

```typescript
// lib/stores/gameStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Die, GamePhase, PointsBalance } from '../games/ada-rollz/types';

interface GameStore {
  // Points (persisted, shared across games)
  points: PointsBalance;

  // Current game state (not persisted)
  game: GameState | null;

  // Actions
  initGame: () => void;
  placeBet: (chips: number) => void;
  rollDice: () => void;
  toggleDieHold: (dieId: string) => void;
  reroll: () => void;
  stand: () => void;
  endRound: () => void;
  resetGame: () => void;

  // Points management (for future Prediction Market)
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      points: {
        chips: 100,
        totalPoints: 10000,
        lifetimeEarned: 0,
        lifetimeLost: 0,
      },
      game: null,

      // ... implementation
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ points: state.points }), // Only persist points
    }
  )
);
```

### Hand Evaluation Logic

```typescript
// lib/games/ada-rollz/hands.ts

import type { Die, DieValue, EvaluatedHand, HandRank } from './types';
import { HAND_RANKINGS } from './constants';

export function evaluateHand(dice: Die[]): EvaluatedHand {
  const values = dice.map(d => d.value).sort((a, b) => b - a);
  const counts = countValues(values);

  // Check hands from highest to lowest
  if (isFiveOfAKind(counts)) {
    return makeHand('five_of_a_kind', values);
  }
  if (isFourOfAKind(counts)) {
    return makeHand('four_of_a_kind', values);
  }
  if (isLargeStraight(values)) {
    return makeHand('large_straight', values);
  }
  if (isFullHouse(counts)) {
    return makeHand('full_house', values);
  }
  if (isSmallStraight(values)) {
    return makeHand('small_straight', values);
  }
  if (isThreeOfAKind(counts)) {
    return makeHand('three_of_a_kind', values);
  }
  if (isTwoPair(counts)) {
    return makeHand('two_pair', values);
  }
  if (isOnePair(counts)) {
    return makeHand('one_pair', values);
  }

  return makeHand('high_card', values);
}

function countValues(values: DieValue[]): Map<DieValue, number> {
  const counts = new Map<DieValue, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return counts;
}

function isFiveOfAKind(counts: Map<DieValue, number>): boolean {
  return Array.from(counts.values()).includes(5);
}

function isFourOfAKind(counts: Map<DieValue, number>): boolean {
  return Array.from(counts.values()).includes(4);
}

function isFullHouse(counts: Map<DieValue, number>): boolean {
  const vals = Array.from(counts.values());
  return vals.includes(3) && vals.includes(2);
}

function isThreeOfAKind(counts: Map<DieValue, number>): boolean {
  return Array.from(counts.values()).includes(3);
}

function isTwoPair(counts: Map<DieValue, number>): boolean {
  return Array.from(counts.values()).filter(c => c === 2).length === 2;
}

function isOnePair(counts: Map<DieValue, number>): boolean {
  return Array.from(counts.values()).includes(2);
}

function isLargeStraight(values: DieValue[]): boolean {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (sorted.length !== 5) return false;
  // 1-2-3-4-5 or 2-3-4-5-6
  return (
    (sorted[0] === 1 && sorted[4] === 5) ||
    (sorted[0] === 2 && sorted[4] === 6)
  );
}

function isSmallStraight(values: DieValue[]): boolean {
  const unique = new Set(values);
  // Check for 1-2-3-4, 2-3-4-5, or 3-4-5-6
  const straights = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ];
  return straights.some(s => s.every(v => unique.has(v as DieValue)));
}

function makeHand(rank: HandRank, values: DieValue[]): EvaluatedHand {
  return {
    rank,
    rankValue: HAND_RANKINGS[rank].value,
    highDice: values,
    displayName: HAND_RANKINGS[rank].name,
  };
}

export function compareHands(a: EvaluatedHand, b: EvaluatedHand): -1 | 0 | 1 {
  if (a.rankValue !== b.rankValue) {
    return a.rankValue > b.rankValue ? 1 : -1;
  }
  // Tie-break by high dice
  for (let i = 0; i < a.highDice.length; i++) {
    if (a.highDice[i] !== b.highDice[i]) {
      return a.highDice[i] > b.highDice[i] ? 1 : -1;
    }
  }
  return 0;
}
```

### AI Logic

```typescript
// lib/games/ada-rollz/ai.ts

import type { Die, DieValue, EvaluatedHand } from './types';
import { evaluateHand } from './hands';

type AIPersonality = 'cautious' | 'balanced' | 'aggressive';

const AI_PERSONALITY: AIPersonality = 'balanced';

export function aiDecideHold(dice: Die[], rerollsLeft: number): string[] {
  const hand = evaluateHand(dice);
  const values = dice.map(d => d.value);
  const counts = countValues(values);

  // Always keep Five of a Kind
  if (hand.rank === 'five_of_a_kind') {
    return dice.map(d => d.id);
  }

  // Keep Four of a Kind
  if (hand.rank === 'four_of_a_kind') {
    const fourValue = findValueWithCount(counts, 4);
    return dice.filter(d => d.value === fourValue).map(d => d.id);
  }

  // Keep Full House
  if (hand.rank === 'full_house') {
    return dice.map(d => d.id);
  }

  // Keep Three of a Kind, reroll others
  if (hand.rank === 'three_of_a_kind') {
    const threeValue = findValueWithCount(counts, 3);
    return dice.filter(d => d.value === threeValue).map(d => d.id);
  }

  // Keep pairs
  if (hand.rank === 'two_pair' || hand.rank === 'one_pair') {
    const pairValues = findAllValuesWithCount(counts, 2);
    return dice.filter(d => pairValues.includes(d.value)).map(d => d.id);
  }

  // Keep straights
  if (hand.rank === 'large_straight' || hand.rank === 'small_straight') {
    return dice.map(d => d.id);
  }

  // High card: keep highest 2 dice if aggressive, 1 if cautious
  const keepCount = AI_PERSONALITY === 'aggressive' ? 2 :
                    AI_PERSONALITY === 'cautious' ? 0 : 1;
  const sorted = [...dice].sort((a, b) => b.value - a.value);
  return sorted.slice(0, keepCount).map(d => d.id);
}

function countValues(values: DieValue[]): Map<DieValue, number> {
  const counts = new Map<DieValue, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return counts;
}

function findValueWithCount(counts: Map<DieValue, number>, count: number): DieValue {
  for (const [value, c] of counts) {
    if (c === count) return value;
  }
  return 1;
}

function findAllValuesWithCount(counts: Map<DieValue, number>, count: number): DieValue[] {
  const result: DieValue[] = [];
  for (const [value, c] of counts) {
    if (c === count) result.push(value);
  }
  return result;
}
```

---

## Animations

### Performance Requirements
- All animations use `react-native-reanimated` with native driver
- Target: 60fps on Pixel 9 Pro
- No JS thread blocking during animations

### Dice Roll Animation

```typescript
// Using react-native-reanimated

const rollAnimation = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { rotateX: `${rollAnimation.value * 720}deg` },  // 2 full rotations
    { rotateY: `${rollAnimation.value * 540}deg` },
    { scale: interpolate(rollAnimation.value, [0, 0.5, 1], [1, 1.2, 1]) },
  ],
}));

const startRoll = () => {
  rollAnimation.value = 0;
  rollAnimation.value = withSequence(
    withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    withSpring(1, { damping: 15 })  // Bounce on land
  );
};
```

### Chip Animation (Win/Loss)

```typescript
// Chips fly from pot to winner
const chipFly = useSharedValue({ x: 0, y: 0 });

const animateWin = () => {
  chipFly.value = withTiming(
    { x: targetX, y: targetY },
    { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
  );
};
```

### Glow Pulse (Selected Dice)

```typescript
const glowOpacity = useSharedValue(0.3);

const pulseGlow = () => {
  glowOpacity.value = withRepeat(
    withSequence(
      withTiming(0.6, { duration: 500 }),
      withTiming(0.3, { duration: 500 })
    ),
    -1,  // Infinite
    true
  );
};
```

---

## Component Specifications

### Dice Component

```typescript
// components/games/ada-rollz/Dice.tsx

interface DiceProps {
  die: Die;
  onPress: () => void;
  disabled: boolean;
  size?: number;
}

// Features:
// - 3×3 grid for ₳ symbol placement
// - Gradient background
// - Glowing border when selected
// - Press animation (scale)
// - Animated roll with 3D transforms
```

### DiceSymbol Component

```typescript
// components/games/ada-rollz/DiceSymbol.tsx

interface DiceSymbolProps {
  size: number;
  color?: string;
  glowColor?: string;
}

// Renders the ₳ symbol using:
// Option A: SVG from assets/images/ada-symbol.svg
// Option B: react-native-svg Path (self-contained)
```

### GameBoard Component

```typescript
// components/games/ada-rollz/GameBoard.tsx

// Main layout component containing:
// - OpponentHand (top)
// - PotDisplay (center)
// - PlayerHand (bottom)
// - BetControls
// - Action buttons (Roll/Stand)
// - Status display (rerolls, phase)
```

---

## Tab Renaming

The "Flip" tab will be renamed to "Games" to serve as a hub:

```typescript
// app/(tabs)/games.tsx (renamed from flip.tsx)

// Initially shows ADA Rollz
// Future: Menu to select between:
// - ADA Rollz
// - Liar's Dice
// - (Prediction Market - separate tab or here)
```

Update tab bar configuration:
- Icon: dice icon or game controller
- Label: "GAMES"

---

## Liar's Dice Preparation

The architecture is designed to share code:

| Component | ADA Rollz | Liar's Dice |
|-----------|-----------|-------------|
| `Dice.tsx` | ✅ Reuse | ✅ Reuse |
| `DiceSymbol.tsx` | ✅ Reuse | ✅ Reuse |
| `ChipStack.tsx` | ✅ Reuse | ✅ Reuse |
| `GameHeader.tsx` | ✅ Reuse | ✅ Reuse |
| `lib/games/shared/dice.ts` | ✅ Reuse | ✅ Reuse |
| `lib/games/shared/points.ts` | ✅ Reuse | ✅ Reuse |
| Hand evaluation | ❌ Specific | ❌ Different (bidding) |
| Game state | ❌ Specific | ❌ Different (rounds, bids) |

**Shared code ratio:** ~70% reusable

---

## Prediction Market Preparation

The points system is designed for future expansion:

```typescript
interface PointsBalance {
  chips: number;           // For ADA Rollz, Liar's Dice
  totalPoints: number;     // Universal points
  lifetimeEarned: number;  // Stats
  lifetimeLost: number;
}

// Future addition:
interface PredictionBalance extends PointsBalance {
  activePredictions: Prediction[];
  predictionWins: number;
  predictionLosses: number;
}
```

When adding Prediction Market:
1. Points system already exists
2. UI patterns established (glowing cards, animations)
3. Add `lib/predictions/` for market-specific logic
4. Add `components/predictions/` for market UI
5. Either new tab or submenu under Games

---

## Legal Disclaimer (Required)

Add to app settings and game screen:

```
ENTERTAINMENT ONLY

ADA Rollz is a free game for entertainment purposes only.
Points and chips have no monetary value and cannot be
exchanged for cryptocurrency, cash, or any goods or services.
This is NOT gambling.
```

---

## Implementation Phases

### Phase 1: Core Game
- [ ] Rename flip.tsx → games.tsx
- [ ] Create directory structure
- [ ] Implement Dice component with ₳ symbols
- [ ] Implement hand evaluation
- [ ] Create game store
- [ ] Build basic game flow (no animations)

### Phase 2: Visual Polish
- [ ] Add roll animations
- [ ] Add glow effects
- [ ] Add chip animations
- [ ] Style all components to cyberpunk theme
- [ ] Add hand reveal animation

### Phase 3: AI & Balance
- [ ] Implement AI decision making
- [ ] Balance difficulty
- [ ] Add game over modal
- [ ] Add new round flow

### Phase 4: Polish
- [ ] Sound effects (optional, noted for later)
- [ ] Haptic feedback
- [ ] Edge cases (out of chips, etc.)
- [ ] Testing on Pixel 9 Pro

---

## Dependencies

**Already installed:**
- react-native-reanimated ✅
- zustand ✅
- @react-native-async-storage/async-storage ✅

**May need:**
- react-native-svg (check if installed)
- expo-haptics (optional, for feedback)

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| **₳ Symbol** | Programmatic SVG (react-native-svg Path) - color changeable via props |
| **Tab Icon** | Two dice at angle - swappable for custom asset later |
| **AI Difficulty** | Fair & challenging - same random odds, smart hold decisions |
| **Sound Effects** | Skip for now, add later |

---

## DiceSymbol Implementation (Programmatic SVG)

```typescript
// components/games/ada-rollz/AdaSymbol.tsx

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AdaSymbolProps {
  size?: number;
  color?: string;  // Easily changeable!
}

/**
 * Cardano ₳ symbol - programmatic SVG
 * The symbol is an "A" with two parallel horizontal lines
 *
 * Color can be changed via props:
 * - color="#00FFFF" for cyan
 * - color="#FF00FF" for magenta
 * - color="#FFFFFF" for white (default)
 */
export function AdaSymbol({ size = 24, color = '#FFFFFF' }: AdaSymbolProps) {
  // Viewbox is 24x24, scales to any size
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main "A" shape */}
      <Path
        d="M12 2L3 22H7L9 17H15L17 22H21L12 2Z"
        fill={color}
      />
      {/* Upper horizontal line */}
      <Path
        d="M8 12H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Lower horizontal line (the distinctive Cardano double-bar) */}
      <Path
        d="M7 15H17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
```

### Usage Examples

```typescript
// White symbol (default)
<AdaSymbol size={16} />

// Cyan glow effect
<AdaSymbol size={16} color="#00FFFF" />

// Magenta for special states
<AdaSymbol size={16} color="#FF00FF" />

// Gold for winning
<AdaSymbol size={16} color="#FFD700" />
```

---

## Tab Icon Implementation (Swappable)

```typescript
// components/games/shared/GamesTabIcon.tsx

import React from 'react';
import Svg, { Rect, Circle, G } from 'react-native-svg';

interface GamesTabIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

/**
 * Two dice at an angle - placeholder icon
 * Can be swapped for custom asset by replacing this component
 */
export function GamesTabIcon({
  size = 24,
  color = '#FFFFFF',
  focused = false
}: GamesTabIconProps) {
  const activeColor = focused ? '#00FFFF' : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Back die (rotated) */}
      <G transform="translate(10, 2) rotate(15)">
        <Rect
          x="0" y="0" width="10" height="10"
          rx="1.5"
          fill={activeColor}
          opacity={0.6}
        />
        {/* Dots on back die */}
        <Circle cx="3" cy="3" r="1" fill="#0A0A0F" />
        <Circle cx="7" cy="7" r="1" fill="#0A0A0F" />
      </G>

      {/* Front die */}
      <G transform="translate(3, 8) rotate(-10)">
        <Rect
          x="0" y="0" width="12" height="12"
          rx="2"
          fill={activeColor}
        />
        {/* Dots showing "5" */}
        <Circle cx="3" cy="3" r="1.2" fill="#0A0A0F" />
        <Circle cx="9" cy="3" r="1.2" fill="#0A0A0F" />
        <Circle cx="6" cy="6" r="1.2" fill="#0A0A0F" />
        <Circle cx="3" cy="9" r="1.2" fill="#0A0A0F" />
        <Circle cx="9" cy="9" r="1.2" fill="#0A0A0F" />
      </G>
    </Svg>
  );
}

// To swap for custom asset later:
// 1. Create assets/images/games-icon.png (or .svg)
// 2. Replace this component's return with:
//    return <Image source={require('@/assets/images/games-icon.png')} ... />
```

---

## AI Fairness Design

The AI uses the **same random number generator** as the player for dice rolls.
AI strategy is "smart but beatable":

| Situation | AI Behavior | Player Advantage |
|-----------|-------------|------------------|
| Roll outcome | Same RNG, no cheating | Equal odds |
| Hold decisions | Follows optimal strategy | Player can take risks |
| Bluffing | None (transparent logic) | Player can outplay |
| Mistakes | Occasionally suboptimal | ~5% "mistakes" built in |

```typescript
// AI "fairness" implementation
const AI_MISTAKE_RATE = 0.05; // 5% chance of suboptimal decision

function aiDecideWithMistakes(dice: Die[], rerollsLeft: number): string[] {
  // Small chance to make a "human" mistake
  if (Math.random() < AI_MISTAKE_RATE) {
    // Randomly keep one less die than optimal
    const optimal = aiDecideHold(dice, rerollsLeft);
    if (optimal.length > 1) {
      return optimal.slice(0, -1);
    }
  }
  return aiDecideHold(dice, rerollsLeft);
}
```

This makes the AI challenging but not frustrating.
