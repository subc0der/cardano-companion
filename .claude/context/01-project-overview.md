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

## Core Features (Planned)
1. **Portfolio** - View wallet holdings and ADA balance
2. **Tools** - Quick utilities for Cardano operations
3. **Flip** - Coin flip functionality
4. **Settings** - App preferences and privacy controls

## API Integration
- Blockfrost API for Cardano blockchain data
- Environment variable: `EXPO_PUBLIC_BLOCKFROST_KEY`

## Project Location
`C:\Users\mkhal\dev\cardano-companion`
