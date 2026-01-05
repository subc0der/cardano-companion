# ADA Blox - Technical Design Document

## Overview

**ADA Blox** is a block puzzle game inspired by Block Blast/Tetris. Players place block shapes on a grid to complete rows and columns, which then clear for points. Simple tap-to-place mechanics, endless gameplay, and Cardano theming.

### Why This Game?
- **#1 most downloaded game on App Store 2024** (Block Blast - 67M downloads)
- Simple tap mechanics perfect for mobile
- No complex physics or real-time action (React Native friendly)
- Endless replayability with high score chasing
- Easy to theme with Cardano aesthetic

### Design Goals
1. **Addictive gameplay** - "One more game" feel
2. **React Native optimized** - No complex physics, grid-based
3. **Cardano themed** - ADA colors, blockchain visual elements
4. **Offline first** - No network required to play
5. **Points integration** - Share points with ADA Rollz

---

## Game Rules

### Basic Mechanics
1. Player sees a 10x10 grid (empty at start)
2. Three block shapes appear at bottom
3. Drag a shape onto the grid to place it
4. When a full row OR column is completed, it clears
5. Clearing grants points (more lines = combo bonus)
6. Game ends when no remaining shapes can fit

### Block Shapes (Tetromino-style)
Using Cardano-themed naming:

| Shape | Name | Grid Size | Visual |
|-------|------|-----------|--------|
| Single | "Lovelace" | 1x1 | ▪ |
| Line-2 | "Pair" | 1x2 | ▪▪ |
| Line-3 | "Triple" | 1x3 | ▪▪▪ |
| Line-4 | "Quad" | 1x4 | ▪▪▪▪ |
| Line-5 | "Epoch" | 1x5 | ▪▪▪▪▪ |
| Square-2 | "Block" | 2x2 | ▪▪<br>▪▪ |
| Square-3 | "Stake" | 3x3 | ▪▪▪<br>▪▪▪<br>▪▪▪ |
| L-shape | "Smart" | 2x3 | ▪<br>▪<br>▪▪ |
| L-reverse | "Contract" | 2x3 | ▪<br>▪<br>▪▪ (mirrored) |
| T-shape | "Plutus" | 2x3 | ▪▪▪<br>▪ |
| Z-shape | "Hydra" | 2x3 | ▪▪<br>▪▪ (offset) |
| Corner | "Stake Pool" | 2x2 | ▪▪<br>▪ |

### Scoring System

| Action | Points |
|--------|--------|
| Place block | 10 points per cell |
| Clear 1 line | 100 points |
| Clear 2 lines (combo) | 300 points |
| Clear 3 lines | 600 points |
| Clear 4+ lines | 1000+ points (exponential) |
| Perfect clear (empty board) | 5000 bonus |

### Difficulty Progression
- Start with simple shapes (1x1, 2x2, lines)
- As score increases, more complex shapes appear
- Shape distribution adjusts to make placement harder
- No time pressure (unlike Tetris) - purely puzzle

---

## Visual Design

### Grid Appearance
```
┌──────────────────────────────────────┐
│  ADA BLOX           Score: 12,450    │
│                     Best:  45,200    │
├──────────────────────────────────────┤
│                                      │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐              │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤              │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤              │
│  ├─┼─┼─┼─┼▪┼▪┼─┼─┼─┼─┤              │  ← Placed blocks
│  ├─┼─┼─┼─┼▪┼─┼─┼─┼─┼─┤              │
│  ├─┼─┼─┼─┼▪┼─┼─┼─┼─┼─┤              │
│  ├─┼─┼▪┼▪┼▪┼▪┼▪┼─┼─┼─┤              │  ← About to clear!
│  ├─┼─┼─┼▪┼▪┼─┼─┼─┼─┼─┤              │
│  ├─┼─┼─┼▪┼─┼─┼─┼─┼─┼─┤              │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘              │
│                                      │
│  ┌─────┐  ┌─────┐  ┌─────┐          │  ← Available shapes
│  │ ▪▪▪ │  │ ▪▪  │  │  ▪  │          │
│  │     │  │ ▪▪  │  │     │          │
│  └─────┘  └─────┘  └─────┘          │
│                                      │
└──────────────────────────────────────┘
```

### Color Scheme (Cyberpunk Cardano)

```typescript
// lib/games/ada-blox/constants.ts

export const BLOX_COLORS = {
  // Grid
  gridBackground: '#0A0A0F',
  gridLines: '#1A1A2E',
  gridCell: '#0F0F1A',

  // Blocks (gradient from cyan to magenta based on shape complexity)
  block1: '#00FFFF',  // Cyan - simple shapes
  block2: '#00CCFF',  // Light blue
  block3: '#0099FF',  // Blue
  block4: '#6666FF',  // Purple-blue
  block5: '#9933FF',  // Purple
  block6: '#CC00FF',  // Magenta - complex shapes

  // Effects
  glowCyan: 'rgba(0, 255, 255, 0.4)',
  glowMagenta: 'rgba(255, 0, 255, 0.4)',
  clearFlash: '#FFFFFF',
  comboGold: '#FFD700',

  // UI
  scoreText: '#00FFFF',
  bestText: '#FF00FF',
  gameOverOverlay: 'rgba(10, 10, 15, 0.9)',
} as const;
```

### Block Visual Style
- Gradient fill with subtle glow
- Rounded corners (2dp radius)
- Shadow effect (depth)
- Pulse animation when hovering valid placement
- Flash + shrink animation when line clears

### Animations
All using `react-native-reanimated`:

| Animation | Duration | Effect |
|-----------|----------|--------|
| Block drag | Real-time | Shadow follows finger |
| Valid hover | 200ms loop | Gentle pulse glow |
| Invalid hover | - | Red tint, no glow |
| Place block | 100ms | Scale 1.1 → 1.0, drop shadow |
| Line clear | 300ms | Flash white → shrink to center → gone |
| Combo text | 500ms | Scale up + float up + fade |
| Game over | 400ms | Grid fades, overlay slides up |

---

## Architecture

### Directory Structure

```
lib/
├── games/
│   ├── ada-blox/
│   │   ├── types.ts           # TypeScript types
│   │   ├── constants.ts       # Colors, shapes, scoring
│   │   ├── shapes.ts          # Shape definitions & generation
│   │   ├── grid.ts            # Grid logic (place, clear, validate)
│   │   ├── scoring.ts         # Score calculation
│   │   └── utils.ts           # Helper functions
│   └── shared/
│       └── points.ts          # Shared with ADA Rollz

components/
├── games/
│   ├── ada-blox/
│   │   ├── BloxGrid.tsx       # 10x10 game grid
│   │   ├── BloxCell.tsx       # Single grid cell
│   │   ├── BloxShape.tsx      # Draggable shape piece
│   │   ├── ShapeTray.tsx      # Bottom tray with 3 shapes
│   │   ├── ScoreDisplay.tsx   # Current & best score
│   │   ├── ComboText.tsx      # "+300 COMBO!" floating text
│   │   ├── GameOverModal.tsx  # Game over screen
│   │   └── BloxGame.tsx       # Main game container
│   └── shared/
│       └── GameHeader.tsx     # Reused from ADA Rollz

app/
└── (tabs)/
    └── games.tsx              # Games hub (ADA Rollz + ADA Blox selector)

lib/
└── stores/
    └── bloxStore.ts           # Zustand store for game state
```

### Type Definitions

```typescript
// lib/games/ada-blox/types.ts

export type CellState = 'empty' | 'filled';

export interface Cell {
  row: number;
  col: number;
  state: CellState;
  color: string | null;
}

export type Grid = Cell[][];

export interface Position {
  row: number;
  col: number;
}

export interface ShapeDefinition {
  id: string;
  name: string;
  cells: Position[];  // Relative positions from origin (0,0)
  color: string;
  width: number;
  height: number;
}

export interface DraggableShape {
  id: string;
  definition: ShapeDefinition;
  isUsed: boolean;
}

export interface GameState {
  grid: Grid;
  availableShapes: DraggableShape[];
  score: number;
  bestScore: number;
  linesCleared: number;
  isGameOver: boolean;
  lastCombo: number;  // For combo display
}

export interface PlacementResult {
  valid: boolean;
  linesCleared: number;
  pointsEarned: number;
  isPerfectClear: boolean;
}
```

### Shape Definitions

```typescript
// lib/games/ada-blox/shapes.ts

import { ShapeDefinition, Position } from './types';
import { BLOX_COLORS } from './constants';

const SHAPES: ShapeDefinition[] = [
  // Single cell
  {
    id: 'single',
    name: 'Lovelace',
    cells: [{ row: 0, col: 0 }],
    color: BLOX_COLORS.block1,
    width: 1,
    height: 1,
  },

  // Horizontal lines
  {
    id: 'line2h',
    name: 'Pair',
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    color: BLOX_COLORS.block1,
    width: 2,
    height: 1,
  },
  {
    id: 'line3h',
    name: 'Triple',
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
    color: BLOX_COLORS.block2,
    width: 3,
    height: 1,
  },

  // 2x2 Square
  {
    id: 'square2',
    name: 'Block',
    cells: [
      { row: 0, col: 0 }, { row: 0, col: 1 },
      { row: 1, col: 0 }, { row: 1, col: 1 },
    ],
    color: BLOX_COLORS.block3,
    width: 2,
    height: 2,
  },

  // L-shape
  {
    id: 'lshape',
    name: 'Smart',
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 }, { row: 2, col: 1 },
    ],
    color: BLOX_COLORS.block4,
    width: 2,
    height: 3,
  },

  // T-shape
  {
    id: 'tshape',
    name: 'Plutus',
    cells: [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 1, col: 1 },
    ],
    color: BLOX_COLORS.block5,
    width: 3,
    height: 2,
  },

  // 3x3 Square (rare, high value)
  {
    id: 'square3',
    name: 'Stake',
    cells: [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
      { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
    ],
    color: BLOX_COLORS.block6,
    width: 3,
    height: 3,
  },

  // Add more shapes...
];

export function getRandomShapes(count: number, difficulty: number): ShapeDefinition[] {
  // Weight selection based on difficulty
  // Higher difficulty = more complex shapes
  const weights = SHAPES.map((shape) => {
    const complexity = shape.cells.length;
    if (difficulty < 1000) {
      // Easy: prefer simple shapes
      return complexity <= 3 ? 3 : 1;
    } else if (difficulty < 5000) {
      // Medium: balanced
      return 2;
    } else {
      // Hard: prefer complex shapes
      return complexity >= 4 ? 3 : 1;
    }
  });

  // Weighted random selection
  const selected: ShapeDefinition[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(weightedRandomSelect(SHAPES, weights));
  }
  return selected;
}
```

### Grid Logic

```typescript
// lib/games/ada-blox/grid.ts

import { Grid, Cell, ShapeDefinition, Position, PlacementResult } from './types';
import { GRID_SIZE, POINTS } from './constants';

export function createEmptyGrid(): Grid {
  const grid: Grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      rowCells.push({
        row,
        col,
        state: 'empty',
        color: null,
      });
    }
    grid.push(rowCells);
  }
  return grid;
}

export function canPlaceShape(
  grid: Grid,
  shape: ShapeDefinition,
  position: Position
): boolean {
  for (const cell of shape.cells) {
    const targetRow = position.row + cell.row;
    const targetCol = position.col + cell.col;

    // Check bounds
    if (targetRow < 0 || targetRow >= GRID_SIZE) return false;
    if (targetCol < 0 || targetCol >= GRID_SIZE) return false;

    // Check if cell is empty
    if (grid[targetRow][targetCol].state === 'filled') return false;
  }
  return true;
}

export function placeShape(
  grid: Grid,
  shape: ShapeDefinition,
  position: Position
): Grid {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  for (const cell of shape.cells) {
    const targetRow = position.row + cell.row;
    const targetCol = position.col + cell.col;
    newGrid[targetRow][targetCol] = {
      ...newGrid[targetRow][targetCol],
      state: 'filled',
      color: shape.color,
    };
  }

  return newGrid;
}

export function findClearableLines(grid: Grid): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];

  // Check rows
  for (let row = 0; row < GRID_SIZE; row++) {
    if (grid[row].every(cell => cell.state === 'filled')) {
      rows.push(row);
    }
  }

  // Check columns
  for (let col = 0; col < GRID_SIZE; col++) {
    if (grid.every(row => row[col].state === 'filled')) {
      cols.push(col);
    }
  }

  return { rows, cols };
}

export function clearLines(
  grid: Grid,
  rows: number[],
  cols: number[]
): Grid {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  // Clear rows
  for (const row of rows) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[row][col] = {
        ...newGrid[row][col],
        state: 'empty',
        color: null,
      };
    }
  }

  // Clear columns
  for (const col of cols) {
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row][col] = {
        ...newGrid[row][col],
        state: 'empty',
        color: null,
      };
    }
  }

  return newGrid;
}

export function canAnyShapeFit(grid: Grid, shapes: ShapeDefinition[]): boolean {
  for (const shape of shapes) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (canPlaceShape(grid, shape, { row, col })) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isGridEmpty(grid: Grid): boolean {
  return grid.every(row => row.every(cell => cell.state === 'empty'));
}
```

### State Management

```typescript
// lib/stores/bloxStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Grid, GameState, DraggableShape, ShapeDefinition, Position
} from '../games/ada-blox/types';
import {
  createEmptyGrid,
  canPlaceShape,
  placeShape,
  findClearableLines,
  clearLines,
  canAnyShapeFit,
  isGridEmpty,
} from '../games/ada-blox/grid';
import { getRandomShapes } from '../games/ada-blox/shapes';
import { calculateScore } from '../games/ada-blox/scoring';

interface BloxStore {
  // Persisted
  bestScore: number;
  totalGamesPlayed: number;
  totalLinesCleared: number;

  // Current game (not persisted)
  game: GameState | null;

  // Actions
  startNewGame: () => void;
  placeShapeAt: (shapeId: string, position: Position) => PlacementResult;
  endGame: () => void;
}

export const useBloxStore = create<BloxStore>()(
  persist(
    (set, get) => ({
      bestScore: 0,
      totalGamesPlayed: 0,
      totalLinesCleared: 0,
      game: null,

      startNewGame: () => {
        const shapes = getRandomShapes(3, 0);
        set({
          game: {
            grid: createEmptyGrid(),
            availableShapes: shapes.map((def, i) => ({
              id: `shape-${i}`,
              definition: def,
              isUsed: false,
            })),
            score: 0,
            bestScore: get().bestScore,
            linesCleared: 0,
            isGameOver: false,
            lastCombo: 0,
          },
        });
      },

      placeShapeAt: (shapeId, position) => {
        const { game } = get();
        if (!game) return { valid: false, linesCleared: 0, pointsEarned: 0, isPerfectClear: false };

        const shapeIndex = game.availableShapes.findIndex(s => s.id === shapeId);
        if (shapeIndex === -1) return { valid: false, linesCleared: 0, pointsEarned: 0, isPerfectClear: false };

        const shape = game.availableShapes[shapeIndex];
        if (shape.isUsed) return { valid: false, linesCleared: 0, pointsEarned: 0, isPerfectClear: false };

        if (!canPlaceShape(game.grid, shape.definition, position)) {
          return { valid: false, linesCleared: 0, pointsEarned: 0, isPerfectClear: false };
        }

        // Place the shape
        let newGrid = placeShape(game.grid, shape.definition, position);

        // Check for lines to clear
        const { rows, cols } = findClearableLines(newGrid);
        const totalLines = rows.length + cols.length;

        if (totalLines > 0) {
          newGrid = clearLines(newGrid, rows, cols);
        }

        const isPerfectClear = totalLines > 0 && isGridEmpty(newGrid);
        const pointsEarned = calculateScore(shape.definition.cells.length, totalLines, isPerfectClear);
        const newScore = game.score + pointsEarned;

        // Mark shape as used
        const newShapes = [...game.availableShapes];
        newShapes[shapeIndex] = { ...shape, isUsed: true };

        // Check if all shapes used - get new ones
        const allUsed = newShapes.every(s => s.isUsed);
        let finalShapes = newShapes;
        if (allUsed) {
          const newDefs = getRandomShapes(3, newScore);
          finalShapes = newDefs.map((def, i) => ({
            id: `shape-${Date.now()}-${i}`,
            definition: def,
            isUsed: false,
          }));
        }

        // Check game over
        const unusedShapes = finalShapes.filter(s => !s.isUsed).map(s => s.definition);
        const isGameOver = !canAnyShapeFit(newGrid, unusedShapes);

        set({
          game: {
            ...game,
            grid: newGrid,
            availableShapes: finalShapes,
            score: newScore,
            linesCleared: game.linesCleared + totalLines,
            lastCombo: totalLines,
            isGameOver,
          },
          bestScore: Math.max(get().bestScore, newScore),
          totalLinesCleared: get().totalLinesCleared + totalLines,
        });

        if (isGameOver) {
          set({ totalGamesPlayed: get().totalGamesPlayed + 1 });
        }

        return { valid: true, linesCleared: totalLines, pointsEarned, isPerfectClear };
      },

      endGame: () => {
        set({ game: null });
      },
    }),
    {
      name: 'blox-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bestScore: state.bestScore,
        totalGamesPlayed: state.totalGamesPlayed,
        totalLinesCleared: state.totalLinesCleared,
      }),
    }
  )
);
```

---

## Drag & Drop Implementation

Using `react-native-gesture-handler` and `react-native-reanimated`:

```typescript
// components/games/ada-blox/BloxShape.tsx

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface BloxShapeProps {
  shape: DraggableShape;
  onDragStart: () => void;
  onDragMove: (position: Position) => void;
  onDrop: (position: Position) => void;
}

export function BloxShape({ shape, onDragStart, onDragMove, onDrop }: BloxShapeProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.1);
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // Convert to grid position
      const gridPos = screenToGrid(event.absoluteX, event.absoluteY);
      runOnJS(onDragMove)(gridPos);
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1);
      const gridPos = screenToGrid(event.absoluteX, event.absoluteY);
      runOnJS(onDrop)(gridPos);
      // Reset position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging.value ? 100 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.shapeContainer, animatedStyle]}>
        {/* Render shape cells */}
        {shape.definition.cells.map((cell, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                left: cell.col * CELL_SIZE,
                top: cell.row * CELL_SIZE,
                backgroundColor: shape.definition.color,
              },
            ]}
          />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## Implementation Phases

### Phase 1: Core Mechanics
- [ ] Create directory structure
- [ ] Define types and constants
- [ ] Implement shape definitions
- [ ] Implement grid logic (place, clear, validate)
- [ ] Create BloxGrid and BloxCell components
- [ ] Basic tap-to-place (no drag yet)

### Phase 2: Drag & Drop
- [ ] Implement BloxShape with gesture handler
- [ ] Add ShapeTray component
- [ ] Implement drag preview on grid
- [ ] Add valid/invalid placement highlighting

### Phase 3: Scoring & Game Flow
- [ ] Implement scoring system
- [ ] Add score display
- [ ] Implement game over detection
- [ ] Add GameOverModal
- [ ] Best score persistence

### Phase 4: Visual Polish
- [ ] Line clear animations
- [ ] Combo text popup
- [ ] Block glow effects
- [ ] Haptic feedback on place/clear
- [ ] Sound effects (optional, later)

### Phase 5: Integration
- [ ] Add to Games tab selector
- [ ] Points integration with shared store
- [ ] Stats tracking

---

## Dependencies

**Already installed:**
- react-native-reanimated
- react-native-gesture-handler
- zustand
- @react-native-async-storage/async-storage

**No new dependencies required.**

---

## Performance Considerations

1. **Grid rendering** - Use FlatList with `getItemLayout` for constant cell sizes
2. **Animations** - All on native thread via reanimated
3. **State updates** - Batch grid updates, avoid unnecessary re-renders
4. **Cell memoization** - Memoize BloxCell to prevent re-render on unrelated changes

---

## Accessibility

- Screen reader announces: shape name, current score, game over
- Haptic feedback on placement and line clear
- High contrast mode compatible (neon colors)
- No time pressure allows thoughtful play

---

## Future Enhancements

1. **Daily challenges** - Specific starting grid, compete for high score
2. **Power-ups** - Clear single cell, rotate shape, bomb (clears 3x3)
3. **Themes** - Different color palettes (unlock with points)
4. **Leaderboard** - Optional online high score board
5. **Multiplayer** - Same shapes, race to higher score

---

## Legal Note

Same as ADA Rollz - entertainment only, points have no monetary value.
