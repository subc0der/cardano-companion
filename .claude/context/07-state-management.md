# State Management

## Architecture Overview

### Local UI State
- `useState` for component-specific state
- `useReducer` for complex component logic

### Global App State (Zustand)
- Persistent stores for user preferences
- Located in `lib/stores/`

### Server State (TanStack Query)
- API data fetching and caching
- Automatic refetching and invalidation

## Zustand Stores

### Privacy Store (`lib/stores/privacy.ts`)
```typescript
interface PrivacyState {
  hideBalances: boolean;
  hideAddresses: boolean;
  toggleHideBalances: () => void;
  toggleHideAddresses: () => void;
}
```
- Persisted to AsyncStorage
- Key: `privacy-storage`

### Creating New Stores
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MyState {
  value: string;
  setValue: (value: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## React Query Usage

### Basic Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { blockfrost } from '@/lib/api/blockfrost';

function useAccountInfo(stakeAddress: string) {
  return useQuery({
    queryKey: ['account', stakeAddress],
    queryFn: () => blockfrost.getAccountInfo(stakeAddress),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!stakeAddress,
  });
}
```

### Query Keys Convention
- Arrays for hierarchical data
- Include all dependencies
- Examples:
  - `['account', stakeAddress]`
  - `['utxos', address]`
  - `['asset', policyId, assetName]`

## Secure Storage

### For Sensitive Data
Use `expo-secure-store` for:
- API keys (if stored locally)
- Wallet connection tokens
- User credentials

```typescript
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('key', 'value');
const value = await SecureStore.getItemAsync('key');
```

### Storage Limits
- SecureStore: 2048 bytes per value
- AsyncStorage: No practical limit
- Choose based on data sensitivity

## Zustand Best Practices

### Avoiding Stale Closures in Callbacks
When a callback uses store state and needs the latest value (not the value at
callback creation time), use `getState()` instead of the hook's return value:

```typescript
// BAD: Uses stale `items` from closure
const processItems = useCallback(async () => {
  for (const item of items) {  // items is stale!
    await doSomething(item);
  }
}, [items]);

// GOOD: Gets fresh state directly from store
const processItems = useCallback(async () => {
  const currentItems = useMyStore.getState().items;
  for (const item of currentItems) {
    await doSomething(item);
  }
}, []);
```

This is especially important when:
- The callback is called right after a state update (before re-render)
- The callback runs asynchronously and state may change during execution
- The callback is used as a dependency in another callback
