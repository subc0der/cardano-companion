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

### Completed
- **Staking Rewards Optimizer** - Pool analysis, recommendations, rewards chart
  - See: `14-staking-optimizer.md`
- **Staking Alerts** - Warnings for pool health issues (retiring, oversaturated)
- **$handle Support** - Allow wallet linking via ADA Handle ($name)
  - See: `13-ada-handle.md`

### In Progress
- **UI/UX Improvements** - Functional improvements and consistency pass

### Planned (Priority Order)

#### 1. UI/UX Consistency Pass
- Component styling alignment
- Color palette adherence
- Animation polish

#### 2. DeFi Aggregator (Main Feature)
Best-in-class mobile DEX aggregator for Cardano.
- Multi-DEX price comparison (Minswap, SundaeSwap, WingRiders, etc.)
- Swap route visualization with fee breakdown
- LP position tracking
- Token watchlist with 24h price changes
- See: `15-defi-aggregator.md`

#### 3. Price Alerts & Notifications
Push notifications for price movements.
- Token price alerts (ADA hits $X, MIN drops 10%, etc.)
- Customizable thresholds (above/below/percent change)
- Multiple alerts per token
- Integrates with DeFi Aggregator watchlist
- See: `17-price-alerts.md`

#### 4. Stake Pool Alerts (Enhanced)
Proactive staking notifications (extends existing alerts).
- Push notifications when pool approaches saturation (80%, 90%)
- Retirement announcements
- Performance drop alerts (ROA below threshold)
- Epoch reward notifications
- See: `18-stake-pool-alerts.md`

#### 5. Fiat Currency Conversion
- Price API integration (CoinGecko or similar)
- Display balances in USD/EUR
- Settings: preferred currency

#### 6. ADA Blox (Block Puzzle Game)
Block Blast-style puzzle game with Cardano theming.
- 10x10 grid, drag-and-drop block placement
- Clear rows/columns for points, combo bonuses
- Shares points system with ADA Rollz
- See: `16-ada-blox-design.md`

#### 7. ADA Rollz Phase 2
Animations and polish for the dice poker game.
- 3D dice roll animations
- Chip fly animations
- Sound effects and haptics
- See: `12-ada-rollz-design.md`

#### 8. Future Considerations
- Liar's Dice game (shares components with ADA Rollz)
- NIGHT Token Thaw Tracker (Midnight Network)
- Prediction Market (points-based)
- Cardano Runner (endless runner game)
- Tax Report Export
- Airdrop Tracker
- Governance Voting Assistant

---

## Project Location
`C:\Users\mkhal\dev\cardano-companion`
