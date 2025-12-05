const BASE_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const API_KEY = process.env.EXPO_PUBLIC_BLOCKFROST_KEY || '';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 30 * 1000; // 30 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchBlockfrost<T>(endpoint: string): Promise<T> {
  const cacheKey = endpoint;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      project_id: API_KEY,
    },
  });

  if (!response.ok) {
    let errorMessage = `Blockfrost API error: ${response.status}`;
    try {
      const error = await response.json();
      if (error && error.message) {
        errorMessage = error.message;
      }
    } catch {
      // Response is not valid JSON, use default message with status code
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  setCache(cacheKey, data);
  return data;
}

export interface AccountInfo {
  stake_address: string;
  active: boolean;
  active_epoch: number | null;
  controlled_amount: string;
  rewards_sum: string;
  withdrawals_sum: string;
  reserves_sum: string;
  treasury_sum: string;
  withdrawable_amount: string;
  pool_id: string | null;
}

export interface Utxo {
  tx_hash: string;
  tx_index: number;
  output_index: number;
  amount: Array<{ unit: string; quantity: string }>;
  block: string;
  data_hash: string | null;
  inline_datum: string | null;
  reference_script_hash: string | null;
}

export interface AssetInfo {
  asset: string;
  policy_id: string;
  asset_name: string;
  fingerprint: string;
  quantity: string;
  initial_mint_tx_hash: string;
  mint_or_burn_count: number;
  onchain_metadata: Record<string, unknown> | null;
  onchain_metadata_standard: string | null;
  metadata: {
    name: string;
    description: string;
    ticker: string | null;
    url: string | null;
    logo: string | null;
    decimals: number | null;
  } | null;
}

export async function getAccountInfo(stakeAddress: string): Promise<AccountInfo> {
  return fetchBlockfrost<AccountInfo>(`/accounts/${stakeAddress}`);
}

export async function getAddressUtxos(address: string): Promise<Utxo[]> {
  return fetchBlockfrost<Utxo[]>(`/addresses/${address}/utxos`);
}

export interface AddressInfo {
  address: string;
  amount: Array<{ unit: string; quantity: string }>;
  stake_address: string | null;
  type: string;
  script: boolean;
}

export async function getAddressInfo(address: string): Promise<AddressInfo> {
  return fetchBlockfrost<AddressInfo>(`/addresses/${address}`);
}

export interface AccountAddress {
  address: string;
}

const MAX_PAGINATION_PAGES = 100;
// Blockfrost returns this many addresses per page
const ADDRESSES_PER_PAGE = 100;

export async function getAccountAddresses(stakeAddress: string): Promise<AccountAddress[]> {
  // Paginate through all addresses
  const allAddresses: AccountAddress[] = [];
  let page = 1;

  while (page <= MAX_PAGINATION_PAGES) {
    const addresses = await fetchBlockfrost<AccountAddress[]>(
      `/accounts/${stakeAddress}/addresses?page=${page}`
    );

    if (addresses.length === 0) break;
    allAddresses.push(...addresses);

    if (addresses.length < ADDRESSES_PER_PAGE) break;
    page++;
  }

  return allAddresses;
}

export async function getAssetInfo(asset: string): Promise<AssetInfo> {
  return fetchBlockfrost<AssetInfo>(`/assets/${asset}`);
}

export const blockfrost = {
  getAccountInfo,
  getAddressUtxos,
  getAddressInfo,
  getAccountAddresses,
  getAssetInfo,
};
