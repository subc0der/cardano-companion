# Cardano Companion - Project Overview

## App Description
A Cardano blockchain toolkit mobile app with a cyberpunk UI theme. Android-only development using React Native Expo.

## Target Device
- Google Pixel 9 Pro (primary test device)
- Android platform only (no iOS)

## Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (persistent stores)
- **Server State**: TanStack React Query
- **Styling**: StyleSheet API with cyberpunk theme
- **Animations**: react-native-reanimated
- **Storage**: expo-secure-store (sensitive), async-storage (preferences)

## Current Features
1. **Portfolio** - View wallet holdings, ADA balance, native tokens
2. **Tools** - CSV transaction export
3. **Games** - ADA Rollz dice poker (Phase 1 complete)
4. **Settings** - App preferences and privacy controls

## API Integration
- Blockfrost API for Cardano blockchain data
- Environment variable: `EXPO_PUBLIC_BLOCKFROST_KEY`

---

## Feature Roadmap

### In Progress
- **$handle Support** - Allow wallet linking via ADA Handle ($name) instead of raw addresses
  - See: `13-ada-handle.md`

### Planned (Priority Order)

#### 1. Staking Rewards Optimizer
Analyze stake pool performance, suggest optimal pools, track historical rewards.
- Current delegation analysis
- Pool performance comparison
- Historical rewards tracking
- Pool health alerts
- See: `14-staking-optimizer.md`

#### 2. DeFi Aggregator
Compare swap rates across all Cardano DEXes, track LP positions.
- Multi-DEX price comparison (Minswap, SundaeSwap, WingRiders, etc.)
- Swap route visualization
- LP position tracking
- Token watchlist
- See: `15-defi-aggregator.md`

#### 3. ADA Rollz Phase 2
Animations and polish for the dice poker game.
- 3D dice roll animations
- Chip fly animations
- Sound effects and haptics
- See: `12-ada-rollz-design.md`

#### 4. Future Considerations
- Liar's Dice game (shares components with ADA Rollz)
- NIGHT Token Thaw Tracker (Midnight Network)
- Prediction Market (points-based)

---

## Project Location
`C:\Users\mkhal\dev\cardano-companion`
