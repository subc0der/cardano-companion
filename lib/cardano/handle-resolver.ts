/**
 * ADA Handle Resolution
 *
 * Resolves $handles (e.g., $myhandle) to Cardano wallet addresses.
 * Uses the official Handle.me API for resolution.
 */

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
  constructor(
    message: string,
    public code: HandleErrorCode
  ) {
    super(message);
    this.name = 'HandleResolutionError';
  }
}

/**
 * Check if input looks like an ADA Handle (starts with $)
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
    return { valid: false, error: `Handle too long (max ${MAX_HANDLE_LENGTH} characters)` };
  }
  if (!HANDLE_REGEX.test(handle)) {
    return { valid: false, error: 'Handle contains invalid characters' };
  }
  return { valid: true };
}

/** Response from Handle.me API */
interface HandleApiResponse {
  name: string;
  holder: string;
  resolved_addresses?: {
    ada?: string;
  };
}

/**
 * Resolve an ADA Handle to a wallet address
 *
 * @param handle - The handle to resolve (with or without $ prefix)
 * @returns The resolved address and stake address
 * @throws HandleResolutionError if resolution fails
 */
export async function resolveHandle(handle: string): Promise<HandleResolution> {
  // Remove $ prefix if present
  const cleanHandle = handle.startsWith('$') ? handle.slice(1) : handle;

  // Validate format
  const validation = validateHandle(cleanHandle);
  if (!validation.valid) {
    throw new HandleResolutionError(
      validation.error ?? 'Invalid handle format',
      'INVALID_FORMAT'
    );
  }

  try {
    // Query Handle.me API
    const response = await fetch(
      `${HANDLE_API_BASE}/handles/${cleanHandle.toLowerCase()}`
    );

    if (response.status === 404) {
      throw new HandleResolutionError(
        `Handle $${cleanHandle} not found`,
        'NOT_FOUND'
      );
    }

    if (!response.ok) {
      throw new HandleResolutionError(
        'Failed to resolve handle',
        'API_ERROR'
      );
    }

    const data: HandleApiResponse = await response.json();

    // Get the resolved Cardano address
    // First check resolved_addresses.ada, then fall back to holder (stake address)
    const address = data.resolved_addresses?.ada ?? null;
    const stakeAddress = data.holder;

    if (!address && !stakeAddress) {
      throw new HandleResolutionError(
        `Handle $${cleanHandle} has no associated address`,
        'NOT_FOUND'
      );
    }

    return {
      handle: cleanHandle,
      address: address ?? stakeAddress,
      // The 'holder' field should be a stake address, but validate to be safe
      stakeAddress: stakeAddress.startsWith('stake1') ? stakeAddress : null,
    };
  } catch (error) {
    if (error instanceof HandleResolutionError) {
      throw error;
    }

    // Network or parsing error
    if (error instanceof Error) {
      // error.message is always a string, but may be empty - provide specific fallback
      const message = error.message.trim() || 'Network error while resolving handle';
      throw new HandleResolutionError(message, 'API_ERROR');
    }

    throw new HandleResolutionError(
      'Unable to connect to Handle.me API. Please try again.',
      'API_ERROR'
    );
  }
}
