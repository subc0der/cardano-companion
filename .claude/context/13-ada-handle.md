# ADA Handle ($handle) Integration

## Overview

Allow users to enter `$myhandle` instead of long wallet addresses like `addr1q...`. ADA Handles are human-readable names (NFTs) that resolve to Cardano addresses.

## How ADA Handles Work

ADA Handles are CIP-25/CIP-68 NFTs minted under a specific policy ID. When someone owns a handle NFT, their wallet address is the holder of that asset.

### Resolution Flow
```
$handlename → hex encode → build asset ID → query Blockfrost → get holder address
```

1. User enters `$handlename`
2. Convert handle name to hex: `handlename` → `68616e646c656e616d65`
3. Build asset ID: `{policyId}{hexEncodedName}`
4. Query Blockfrost `/assets/{assetId}/addresses`
5. Return the address holding the NFT

## Policy IDs

### CIP-25 (Original - Mainnet)
```
f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a
```

### CIP-68 (Reference Token Standard)
For handles with reference tokens, additional policy IDs may apply. Most handles use CIP-25.

## Implementation

### New Files

#### `lib/cardano/handle-resolver.ts`
```typescript
import { blockfrost } from '../api/blockfrost';

// CIP-25 ADA Handle Policy ID (Mainnet)
const HANDLE_POLICY_ID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';

// Valid handle characters: a-z, 0-9, underscore, hyphen, period
const HANDLE_REGEX = /^[a-z0-9_.\-]+$/i;
const MAX_HANDLE_LENGTH = 15;

export interface HandleResolution {
  handle: string;
  address: string;
  stakeAddress: string | null;
}

export class HandleResolutionError extends Error {
  constructor(message: string, public code: 'INVALID_FORMAT' | 'NOT_FOUND' | 'API_ERROR') {
    super(message);
    this.name = 'HandleResolutionError';
  }
}

/**
 * Check if input looks like an ADA Handle
 */
export function isHandle(input: string): boolean {
  return input.startsWith('$') && input.length > 1;
}

/**
 * Validate handle format (without $ prefix)
 */
export function validateHandle(handle: string): { valid: boolean; error?: string } {
  if (handle.length === 0) {
    return { valid: false, error: 'Handle cannot be empty' };
  }
  if (handle.length > MAX_HANDLE_LENGTH) {
    return { valid: false, error: `Handle too long (max ${MAX_HANDLE_LENGTH} chars)` };
  }
  if (!HANDLE_REGEX.test(handle)) {
    return { valid: false, error: 'Handle contains invalid characters' };
  }
  return { valid: true };
}

/**
 * Convert handle name to hex encoding
 */
function handleToHex(handle: string): string {
  return Buffer.from(handle.toLowerCase(), 'utf8').toString('hex');
}

/**
 * Resolve an ADA Handle to a wallet address
 */
export async function resolveHandle(handle: string): Promise<HandleResolution> {
  // Remove $ prefix if present
  const cleanHandle = handle.startsWith('$') ? handle.slice(1) : handle;

  // Validate format
  const validation = validateHandle(cleanHandle);
  if (!validation.valid) {
    throw new HandleResolutionError(validation.error!, 'INVALID_FORMAT');
  }

  // Build asset ID
  const hexName = handleToHex(cleanHandle);
  const assetId = `${HANDLE_POLICY_ID}${hexName}`;

  try {
    // Query Blockfrost for asset holders
    const addresses = await blockfrost.getAssetAddresses(assetId);

    if (!addresses || addresses.length === 0) {
      throw new HandleResolutionError(
        `Handle $${cleanHandle} not found or not minted`,
        'NOT_FOUND'
      );
    }

    // Get the holder address (should be exactly one for an NFT)
    const holderAddress = addresses[0].address;

    // Get stake address from address info
    const addressInfo = await blockfrost.getAddressInfo(holderAddress);

    return {
      handle: cleanHandle,
      address: holderAddress,
      stakeAddress: addressInfo.stake_address,
    };
  } catch (error) {
    if (error instanceof HandleResolutionError) {
      throw error;
    }
    throw new HandleResolutionError(
      'Failed to resolve handle',
      'API_ERROR'
    );
  }
}
```

### Blockfrost API Addition

Add to `lib/api/blockfrost.ts`:

```typescript
export interface AssetAddress {
  address: string;
  quantity: string;
}

export async function getAssetAddresses(asset: string): Promise<AssetAddress[]> {
  return fetchBlockfrost<AssetAddress[]>(`/assets/${asset}/addresses`);
}
```

### WalletInput Component Update

Modify `components/portfolio/WalletInput.tsx`:

```typescript
import { isHandle, resolveHandle, HandleResolutionError } from '../../lib/cardano/handle-resolver';

// In validateAndSaveAddress function:
const validateAndSaveAddress = async () => {
  const trimmed = inputValue.trim();

  if (!trimmed) {
    setError('Please enter a wallet address or $handle');
    return;
  }

  setIsValidating(true);
  setError(null);

  try {
    let address: string;
    let stakeAddress: string | null = null;

    if (isHandle(trimmed)) {
      // Resolve ADA Handle
      const resolution = await resolveHandle(trimmed);
      address = resolution.address;
      stakeAddress = resolution.stakeAddress;
      // Optionally store handle name for display
      // setHandleName(resolution.handle);
    } else {
      // Existing address validation logic
      const isValidFormat =
        (trimmed.startsWith('addr1') && trimmed.length >= 58) ||
        (trimmed.startsWith('stake1') && trimmed.length >= 54);

      if (!isValidFormat) {
        setError('Invalid Cardano address format');
        setIsValidating(false);
        return;
      }

      if (trimmed.startsWith('stake1')) {
        stakeAddress = trimmed;
        address = null;
      } else {
        address = trimmed;
      }
    }

    setAddress(address);
    setStakeAddress(stakeAddress);
    onConnected?.();
  } catch (error) {
    if (error instanceof HandleResolutionError) {
      setError(error.message);
    } else {
      setError('Failed to validate address');
    }
  } finally {
    setIsValidating(false);
  }
};
```

Update hint text:
```typescript
<Text style={styles.hint}>
  Enter your Cardano address (addr1...), stake address (stake1...), or $handle
</Text>
```

Update placeholder:
```typescript
placeholder="addr1q... or $handle"
```

## Wallet Store Update (Optional)

To display the handle name in the UI, add to `lib/stores/wallet.ts`:

```typescript
interface WalletState {
  address: string | null;
  stakeAddress: string | null;
  handleName: string | null;  // NEW: Store resolved handle
  // ...
}
```

## Security Considerations

1. **Policy ID Validation**: Only resolve handles from the official ADA Handle policy ID
2. **Input Sanitization**: Validate characters, prevent injection attacks
3. **Cache Duration**: Don't cache handle→address too long (handles can transfer)
   - Use short TTL (5 minutes) or no caching for handle lookups
4. **Privacy**: Don't log handle lookups (could reveal user intent)

## Edge Cases

| Case | Behavior |
|------|----------|
| Handle doesn't exist | Error: "Handle $foo not found or not minted" |
| Handle transferred | Return new owner's address |
| Multiple policy IDs | Only support official CIP-25 policy |
| Upper/lowercase | Normalize to lowercase before lookup |
| Special chars | Only allow: a-z, 0-9, _, -, . |

## Testing

### Test Handles (Mainnet)

Use well-known handles for testing:
- `$adahandle` - The official handle
- Any handle you own

### Test Cases

1. Valid handle: `$foo` → resolves to address
2. Invalid chars: `$foo@bar` → error
3. Too long: `$thisisaverylonghandlename` → error
4. Not found: `$zzzzzzzzzzz` → not found error
5. With $ prefix: `$handle` → works
6. Without $ prefix in input: `handle` → treated as invalid address

## UI/UX Improvements

### Loading State
Show "Resolving handle..." during API call

### Success Feedback
After resolution, briefly show:
```
✓ $handlename → addr1q...xyz
```

### Handle Display
In portfolio header, show handle name if available:
```
$myhandle
addr1q...xyz (abbreviated)
```

## Implementation Phases

### Phase 1: Core Resolution
- [ ] Add `getAssetAddresses` to blockfrost.ts
- [ ] Create `lib/cardano/handle-resolver.ts`
- [ ] Update WalletInput to detect and resolve handles

### Phase 2: UI Polish
- [ ] Show loading state during resolution
- [ ] Display handle name in portfolio header
- [ ] Add success/error feedback animations

### Phase 3: Enhancements (Future)
- [ ] Handle autocomplete (type-ahead)
- [ ] Handle verification badge
- [ ] Support CIP-68 handles

## Dependencies

No new dependencies required. Uses existing:
- Blockfrost API (already configured)
- React Native TextInput
