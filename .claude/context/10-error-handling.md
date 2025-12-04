# Error Handling Patterns

## API Error Handling

### Blockfrost API Errors
```typescript
interface BlockfrostError {
  status_code: number;
  error: string;
  message: string;
}

// Common error codes
const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};
```

### Error Handling Pattern
```typescript
async function fetchWithErrorHandling<T>(
  endpoint: string
): Promise<T> {
  try {
    const response = await fetch(endpoint, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parsing error
    throw new NetworkError('Failed to connect to server');
  }
}
```

## Custom Error Classes

```typescript
// lib/errors.ts (create when needed)
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}
```

## User-Facing Error Messages

### Principles
- Be helpful, not technical
- Suggest next steps when possible
- Never expose internal details

### Message Mapping
```typescript
const USER_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  403: 'API key is invalid. Please check settings.',
  404: 'Wallet address not found on blockchain.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Server error. Please try again later.',
};

function getUserMessage(statusCode: number): string {
  return USER_MESSAGES[statusCode]
    ?? 'Something went wrong. Please try again.';
}
```

## React Query Error Handling

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['account', address],
  queryFn: () => getAccountInfo(address),
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error instanceof ApiError && error.statusCode < 500) {
      return false;
    }
    return failureCount < 3;
  },
});

// In component
if (isError) {
  return <ErrorDisplay message={getUserMessage(error)} />;
}
```

## Logging (Development Only)

```typescript
// lib/logger.ts (create when needed)
const isDev = __DEV__;

export const logger = {
  error: (message: string, context?: object) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, context);
    }
    // In production: send to error tracking service
  },
  warn: (message: string) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`);
    }
  },
  info: (message: string) => {
    if (isDev) {
      console.log(`[INFO] ${message}`);
    }
  },
};
```
