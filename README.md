# Cardano Companion

A mobile wallet companion app for Cardano blockchain. View your ADA balance, native tokens, and staking rewards.

## Features

- **Portfolio View**: Enter any Cardano wallet address to view balances
- **Full Wallet Support**: Automatically fetches all addresses under your stake key
- **Staking Rewards**: Shows unclaimed staking rewards
- **Native Tokens**: View all Cardano native tokens in your wallet
- **Pull-to-Refresh**: Easily refresh your wallet data
- **Privacy Mode**: Hide balances with a toggle (coming soon)
- **Cyberpunk Theme**: Dark UI with neon cyan/magenta accents

## Screenshots

Coming soon...

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with AsyncStorage persistence
- **API Caching**: TanStack React Query
- **Blockchain API**: Blockfrost
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your mobile device
- Blockfrost API key (get one at [blockfrost.io](https://blockfrost.io))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/subc0der/cardano-companion.git
   cd cardano-companion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Blockfrost API key:
   ```
   EXPO_PUBLIC_BLOCKFROST_KEY=your_mainnet_api_key_here
   ```

4. Start the development server:
   ```bash
   npx expo start --clear
   ```

5. Scan the QR code with Expo Go on your phone

## Project Structure

```
cardano-companion/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── portfolio.tsx  # Main portfolio view
│   │   ├── tools.tsx      # Tools (coming soon)
│   │   ├── flip.tsx       # Flip (coming soon)
│   │   └── settings.tsx   # Settings (coming soon)
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Splash screen
├── components/            # Reusable components
│   ├── portfolio/         # Portfolio-specific components
│   └── ui/                # Generic UI components
├── lib/                   # Core libraries
│   ├── api/               # API clients (Blockfrost)
│   ├── hooks/             # React hooks
│   ├── stores/            # Zustand stores
│   └── theme/             # Colors and typography
└── assets/                # Fonts and images
```

## API Usage

This app uses the Blockfrost API to fetch Cardano blockchain data. The free tier includes:
- 50,000 requests/day
- 10 requests/second

## Development

### Commands

```bash
# Start dev server
npx expo start --clear

# Type check
npx tsc --noEmit

# Start on specific port
npx expo start --port 8081
```

### Testing

Test device: Google Pixel 9 Pro with Expo Go

## Roadmap

- [ ] Stake address (stake1...) direct lookup
- [ ] Settings screen with privacy toggle
- [ ] Tools screen (address validation, etc.)
- [ ] Flip screen (NFT viewer)
- [ ] Token metadata and images
- [ ] Price data integration
- [ ] Transaction history

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## Acknowledgments

- [Blockfrost](https://blockfrost.io) for the Cardano API
- [Expo](https://expo.dev) for the development framework
