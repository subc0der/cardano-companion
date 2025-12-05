import { Transaction, TransactionType } from '../types/transaction';

const BASE_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const API_KEY = process.env.EXPO_PUBLIC_BLOCKFROST_KEY || '';

// Rate limit delay between API calls to avoid 429 errors (Blockfrost free tier: 10 req/s)
const RATE_LIMIT_DELAY_MS = 100;
// Number of transactions to fetch details for in parallel
const BATCH_SIZE = 10;
// Blockfrost returns this many transactions per page
const TRANSACTIONS_PER_PAGE = 100;
// Maximum pages to fetch (TRANSACTIONS_PER_PAGE * MAX_PAGES = 10,000 tx limit)
const MAX_PAGES = 100;
// Maximum retry attempts for rate-limited requests
const MAX_RETRIES = 3;

interface BlockfrostTxRef {
  tx_hash: string;
  tx_index: number;
  block_height: number;
  block_time: number;
}

interface BlockfrostUtxoAmount {
  unit: string;
  quantity: string;
}

interface BlockfrostUtxoInput {
  address: string;
  amount: BlockfrostUtxoAmount[];
  tx_hash: string;
  output_index: number;
}

interface BlockfrostUtxoOutput {
  address: string;
  amount: BlockfrostUtxoAmount[];
  output_index: number;
}

interface BlockfrostTxUtxos {
  hash: string;
  inputs: BlockfrostUtxoInput[];
  outputs: BlockfrostUtxoOutput[];
}

interface BlockfrostTxDetails {
  hash: string;
  block_height: number;
  block_time: number;
  fees: string;
}

interface BlockfrostReward {
  epoch: number;
  amount: string;
  pool_id: string;
  type: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBlockfrost<T>(
  path: string,
  retryCount = 0
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { project_id: API_KEY },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await sleep(RATE_LIMIT_DELAY_MS * Math.pow(2, retryCount));
        return fetchBlockfrost<T>(path, retryCount + 1);
      }
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Blockfrost error: ${response.status}`);
  }

  return response.json();
}

export async function fetchTransactionHashes(
  address: string,
  onProgress?: (current: number) => void
): Promise<BlockfrostTxRef[]> {
  const allTxs: BlockfrostTxRef[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    try {
      const txs = await fetchBlockfrost<BlockfrostTxRef[]>(
        `/addresses/${address}/transactions?page=${page}&order=desc`
      );

      if (txs.length === 0) break;
      allTxs.push(...txs);
      onProgress?.(allTxs.length);

      if (txs.length < TRANSACTIONS_PER_PAGE) break;
      page++;
      await sleep(RATE_LIMIT_DELAY_MS);
    } catch (error) {
      if (error instanceof Error && error.message === 'Resource not found') {
        break;
      }
      throw error;
    }
  }

  return allTxs;
}

export interface FetchTransactionResult {
  transactions: Transaction[];
  failedCount: number;
}

export async function fetchTransactionDetails(
  txRefs: BlockfrostTxRef[],
  walletAddresses: string[],
  onProgress?: (current: number, total: number) => void
): Promise<FetchTransactionResult> {
  const transactions: Transaction[] = [];
  const addressSet = new Set(walletAddresses.map((a) => a.toLowerCase()));
  let failedCount = 0;

  for (let i = 0; i < txRefs.length; i += BATCH_SIZE) {
    const batch = txRefs.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (txRef) => {
        try {
          const [details, utxos] = await Promise.all([
            fetchBlockfrost<BlockfrostTxDetails>(`/txs/${txRef.tx_hash}`),
            fetchBlockfrost<BlockfrostTxUtxos>(`/txs/${txRef.tx_hash}/utxos`),
          ]);
          return { details, utxos, txRef };
        } catch {
          // Individual transaction fetch failures are tracked but don't stop the export
          return null;
        }
      })
    );

    for (const result of results) {
      if (!result) {
        failedCount++;
        continue;
      }
      const { details, utxos, txRef } = result;

      const tx = parseTransaction(details, utxos, txRef, addressSet);
      if (tx) {
        transactions.push(tx);
      }
    }

    onProgress?.(Math.min(i + BATCH_SIZE, txRefs.length), txRefs.length);
    // Conservative delay between batches to avoid rate limits after potential retries
    await sleep(RATE_LIMIT_DELAY_MS * 5);
  }

  return { transactions, failedCount };
}

function parseTransaction(
  details: BlockfrostTxDetails,
  utxos: BlockfrostTxUtxos,
  txRef: BlockfrostTxRef,
  walletAddresses: Set<string>
): Transaction | null {
  const isInput = utxos.inputs.some((i) =>
    walletAddresses.has(i.address.toLowerCase())
  );
  const isOutput = utxos.outputs.some((o) =>
    walletAddresses.has(o.address.toLowerCase())
  );

  const type = classifyTransaction(isInput, isOutput);
  const netAmount = calculateNetAmount(utxos, walletAddresses, 'lovelace');

  return {
    txHash: details.hash,
    blockHeight: details.block_height,
    blockTime: txRef.block_time,
    timestamp: new Date(txRef.block_time * 1000),
    type,
    inputs: utxos.inputs.map((i) => ({
      address: i.address,
      amount: i.amount.find((a) => a.unit === 'lovelace')?.quantity || '0',
      asset: 'lovelace',
    })),
    outputs: utxos.outputs.map((o) => ({
      address: o.address,
      amount: o.amount.find((a) => a.unit === 'lovelace')?.quantity || '0',
      asset: 'lovelace',
    })),
    netAmount: netAmount.toString(),
    asset: 'lovelace',
    assetTicker: 'ADA',
    fee: isInput ? details.fees : undefined,
  };
}

function classifyTransaction(
  isInput: boolean,
  isOutput: boolean
): TransactionType {
  if (isInput && !isOutput) return 'send';
  if (!isInput && isOutput) return 'receive';
  if (isInput && isOutput) return 'send'; // Self-transfer counts as send (pays fee)
  return 'unknown';
}

function calculateNetAmount(
  utxos: BlockfrostTxUtxos,
  walletAddresses: Set<string>,
  asset: string
): bigint {
  let received = BigInt(0);
  let sent = BigInt(0);

  for (const output of utxos.outputs) {
    if (walletAddresses.has(output.address.toLowerCase())) {
      const amount = output.amount.find((a) => a.unit === asset);
      if (amount) received += BigInt(amount.quantity);
    }
  }

  for (const input of utxos.inputs) {
    if (walletAddresses.has(input.address.toLowerCase())) {
      const amount = input.amount.find((a) => a.unit === asset);
      if (amount) sent += BigInt(amount.quantity);
    }
  }

  return received - sent;
}

// Cardano Shelley era parameters for epoch-to-timestamp conversion.
// Source: Cardano mainnet protocol parameters.
// Shelley era started July 29, 2020 at 21:44:51 UTC (epoch 208).
// Note: These values are fixed for mainnet but could differ on testnets.
const SHELLEY_START_TIMESTAMP = 1596059091;
const EPOCH_LENGTH_SECONDS = 432000; // 5 days in seconds
const SHELLEY_START_EPOCH = 208;

/**
 * Converts a Cardano epoch number to an approximate Unix timestamp.
 * Returns the end of the epoch as an approximation of when rewards are distributed.
 * Note: Actual reward distribution occurs ~2 days after epoch end, so timestamps
 * may be off by up to ~2 days from when users actually received rewards.
 */
function epochToTimestamp(epoch: number): number {
  return (
    SHELLEY_START_TIMESTAMP +
    (epoch - SHELLEY_START_EPOCH + 1) * EPOCH_LENGTH_SECONDS
  );
}

export async function fetchStakingRewards(
  stakeAddress: string
): Promise<Transaction[]> {
  try {
    const rewards = await fetchBlockfrost<BlockfrostReward[]>(
      `/accounts/${stakeAddress}/rewards`
    );

    return rewards.map((reward) => ({
      txHash: `reward_epoch_${reward.epoch}`,
      blockHeight: 0,
      blockTime: epochToTimestamp(reward.epoch),
      timestamp: new Date(epochToTimestamp(reward.epoch) * 1000),
      type: 'stake_reward' as const,
      inputs: [],
      outputs: [],
      netAmount: reward.amount,
      asset: 'lovelace',
      assetTicker: 'ADA',
      poolId: reward.pool_id,
    }));
  } catch (error) {
    if (error instanceof Error && error.message === 'Resource not found') {
      return [];
    }
    throw error;
  }
}
