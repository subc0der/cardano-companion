# Cardano Blockchain Integration

## Blockfrost API

### Configuration
- Base URL: `https://cardano-mainnet.blockfrost.io/api/v0`
- API Key: Environment variable `EXPO_PUBLIC_BLOCKFROST_KEY`
- Get key from: https://blockfrost.io/

### Implemented Methods
Located in `lib/api/blockfrost.ts`:

1. **getAccountInfo(stakeAddress)**
   - Returns stake account details
   - Balance, rewards, pool delegation

2. **getAddressUtxos(address)**
   - Returns unspent transaction outputs
   - Used for balance calculation

3. **getAssetInfo(asset)**
   - Returns native token metadata
   - Policy ID, asset name, quantity

### Caching Strategy
- In-memory cache with 30-second TTL
- Prevents redundant API calls
- Cache key: API endpoint path

### Rate Limits (Free Tier)
- 50,000 requests/day
- 10 requests/second
- Consider implementing request queuing

## Wallet Integration

### Current Status
Placeholder implementation in `lib/cardano/wallet-bridge.ts`

### Planned Approaches
1. **Deep Linking** - Connect to external wallet apps
2. **WebView Bridge** - dApp connector protocol
3. **QR Code** - Address sharing

### Wallet Data Types
```typescript
interface WalletConnection {
  address: string;         // Bech32 payment address
  stakeAddress: string;    // Stake address for rewards
  networkId: number;       // 1 = mainnet, 0 = testnet
}
```

## Address Formats
- Payment addresses start with `addr1`
- Stake addresses start with `stake1`
- Policy IDs are 56-character hex strings
- Asset IDs: `{policyId}{assetNameHex}`

## ADA Denomination
- 1 ADA = 1,000,000 lovelace
- API returns amounts in lovelace
- Display in ADA with 6 decimal places
