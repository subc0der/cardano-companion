# Constants & Configuration

## Environment Variables

### Required
```env
EXPO_PUBLIC_BLOCKFROST_KEY=your_blockfrost_project_id
```

### Setup
1. Copy `.env.example` to `.env`
2. Get API key from https://blockfrost.io/
3. Never commit `.env` file

## Application Constants

### API Configuration
```typescript
// lib/api/constants.ts (create when needed)
export const API_CONFIG = {
  BLOCKFROST_BASE_URL: 'https://cardano-mainnet.blockfrost.io/api/v0',
  CACHE_TTL_MS: 30_000,        // 30 seconds
  REQUEST_TIMEOUT_MS: 10_000,  // 10 seconds
  MAX_RETRIES: 3,
};
```

### Cardano Constants
```typescript
// lib/cardano/constants.ts (create when needed)
export const CARDANO = {
  LOVELACE_PER_ADA: 1_000_000,
  NETWORK_ID_MAINNET: 1,
  NETWORK_ID_TESTNET: 0,
  ADDRESS_PREFIX_PAYMENT: 'addr1',
  ADDRESS_PREFIX_STAKE: 'stake1',
};
```

### UI Constants
```typescript
// lib/theme/constants.ts (create when needed)
export const UI = {
  ANIMATION_DURATION_MS: 200,
  BUTTON_PRESS_SCALE: 0.95,
  BORDER_RADIUS_SM: 4,
  BORDER_RADIUS_MD: 8,
  BORDER_RADIUS_LG: 16,
  TOUCH_TARGET_MIN: 44,  // Minimum touch target in points
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 16,
  SPACING_LG: 24,
  SPACING_XL: 32,
};
```

## Naming Pattern for Constants

### Time Values
Always suffix with unit:
- `TIMEOUT_MS` (milliseconds)
- `INTERVAL_SEC` (seconds)
- `CACHE_DURATION_MIN` (minutes)

### Size Values
Be explicit about units:
- `MAX_FILE_SIZE_BYTES`
- `ICON_SIZE_PX` (pixels)
- `SPACING_MD` (points/dp)

### Counts
Use descriptive names:
- `MAX_RETRY_ATTEMPTS`
- `ITEMS_PER_PAGE`
- `MIN_PASSWORD_LENGTH`

## Feature Flags (Future)
```typescript
export const FEATURES = {
  ENABLE_WALLET_CONNECT: false,
  ENABLE_NFT_GALLERY: false,
  ENABLE_STAKING: false,
  DEBUG_MODE: __DEV__,
};
```
