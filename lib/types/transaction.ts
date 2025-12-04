export type TransactionType =
  | 'send'
  | 'receive'
  | 'stake_reward'
  | 'stake_delegate'
  | 'mint'
  | 'burn'
  | 'unknown';

export interface TransactionAmount {
  address: string;
  amount: string;
  asset: string;
}

export interface Transaction {
  txHash: string;
  blockHeight: number;
  blockTime: number;
  timestamp: Date;
  type: TransactionType;
  inputs: TransactionAmount[];
  outputs: TransactionAmount[];
  netAmount: string;
  asset: string;
  assetTicker?: string;
  fee?: string;
  metadata?: Record<string, unknown>;
  stakeAddress?: string;
  poolId?: string;
}

export type AssetFilter = 'all' | 'ada_only' | 'tokens';

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
  includeStakingRewards: boolean;
  assetFilter: AssetFilter;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  transactionCount: number;
  dateRange: { start: Date; end: Date };
  error?: string;
}

export interface ExportProgress {
  phase: 'fetching' | 'processing' | 'exporting';
  current: number;
  total: number;
}
