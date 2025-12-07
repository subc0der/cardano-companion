# ADA Handle ($handle) Integration

## Overview

Allow users to enter `$myhandle` instead of long wallet addresses like `addr1q...`. ADA Handles are human-readable names (NFTs) that resolve to Cardano addresses.

## How ADA Handles Work

ADA Handles are CIP-25/CIP-68 NFTs minted under a specific policy ID. When someone owns a handle NFT, their wallet address is the holder of that asset.

### Resolution via Handle.me API

We use the official Handle.me API for resolution. This is the recommended approach because:
1. Handle.me is the official API maintained by the ADA Handle team
2. It provides direct handle-to-address resolution
3. It's simpler and more reliable than querying Blockfrost for asset holders

```
$handlename → Handle.me API → get resolved address
```

1. User enters `$handlename`
2. Query Handle.me API: `GET https://api.handle.me/handles/{name}`
3. Return the resolved address and stake address

## API Details

### Handle.me API
- **Endpoint**: `https://api.handle.me/handles/{name}`
- **Documentation**: https://docs.handle.me/
- **Rate Limits**: Public API, reasonable rate limits

### Response Structure
```json
{
  "name": "handlename",
  "holder": "stake1...",
  "resolved_addresses": {
    "ada": "addr1..."
  }
}
```

## Implementation

### Files

#### `lib/cardano/handle-resolver.ts`
```typescript
// Official Handle.me API endpoint
// Documentation: https://docs.handle.me/
const HANDLE_API_BASE = 'https://api.handle.me';

// Valid handle characters: a-z, 0-9, underscore, hyphen, period
const HANDLE_REGEX = /^[a-z0-9_.\-]+$/i;
const MAX_HANDLE_LENGTH = 15;

export interface HandleResolution {
  /** The handle that was resolved (without the '$' prefix). */
  handle: string;
  /**
   * The primary resolved address. This will be the payment address (addr1...)
   * if available, otherwise it falls back to the stake address.
   */
  address: string;
  /** The stake address (stake1...) associated with the handle, if available. */
  stakeAddress: string | null;
}

export type HandleErrorCode = 'INVALID_FORMAT' | 'NOT_FOUND' | 'API_ERROR';

export class HandleResolutionError extends Error {
  constructor(message: string, public code: HandleErrorCode) {
    super(message);
    this.name = 'HandleResolutionError';
  }
}

export function isHandle(input: string): boolean {
  return input.startsWith('$') && input.length > 1;
}

export function validateHandle(handle: string): { valid: boolean; error?: string } {
  // Validation logic...
}

export async function resolveHandle(handle: string): Promise<HandleResolution> {
  // Remove $ prefix, validate, query Handle.me API
}
```

### WalletInput Component Update

The `components/portfolio/WalletInput.tsx` detects `$` prefix and resolves handles:

```typescript
import { isHandle, resolveHandle, HandleResolutionError } from '../../lib/cardano/handle-resolver';

// In validateAndSaveAddress:
if (isHandle(trimmed)) {
  const resolution = await resolveHandle(trimmed);
  address = resolution.address;
  stakeAddress = resolution.stakeAddress;
} else {
  // Existing address validation...
}
```

## Security Considerations

1. **Input Sanitization**: Validate characters, prevent injection
2. **Case Normalization**: Handles are case-insensitive, normalize to lowercase
3. **Cache Duration**: Don't cache handle→address too long (handles can transfer)
4. **Error Handling**: User-friendly errors, no API error codes exposed

## Edge Cases

| Case | Behavior |
|------|----------|
| Handle doesn't exist | Error: "Handle $foo not found" |
| Handle transferred | Return new owner's address |
| Upper/lowercase | Normalize to lowercase before lookup |
| Special chars | Only allow: a-z, 0-9, _, -, . |
| Too long | Max 15 characters |

## Testing

### Test Handles (Mainnet)
- `$subcoder` - Known test handle
- Any handle you own

### Test Cases
1. Valid handle: `$subcoder` → resolves to address
2. Invalid chars: `$foo@bar` → error
3. Too long: `$thisisaverylonghandlename` → error
4. Not found: `$zzzzzzzzzzz` → not found error
5. With $ prefix: `$handle` → works
6. Without $ prefix: `handle` → treated as invalid address

## Implementation Status

### Phase 1: Core Resolution ✅
- [x] Create `lib/cardano/handle-resolver.ts` with Handle.me API
- [x] Update WalletInput to detect and resolve handles
- [x] Error handling with user-friendly messages

### Phase 2: UI Polish (Future)
- [ ] Show loading state during resolution
- [ ] Display handle name in portfolio header
- [ ] Add success/error feedback animations

### Phase 3: Enhancements (Future)
- [ ] Handle autocomplete (type-ahead)
- [ ] Handle verification badge
- [ ] Support CIP-68 handles

## Dependencies

- **Handle.me API** - Official ADA Handle resolution service
- No additional npm packages required

## Alternative Approaches Considered

### Blockfrost Asset Query
Initially considered querying Blockfrost's `/assets/{assetId}/addresses` endpoint with the CIP-25 policy ID. This approach was abandoned because:
1. Requires hex encoding handle names
2. More complex error handling
3. Handle.me API is simpler and official

The Handle.me API is the recommended approach per ADA Handle documentation.
