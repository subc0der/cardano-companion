import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction, ExportOptions, ExportResult } from '../types/transaction';

const CSV_HEADERS = [
  'Date',
  'Type',
  'Asset',
  'Amount',
  'Fee',
  'Transaction Hash',
  'Block',
  'Notes',
];

const LOVELACE_DIVISOR = 1_000_000;
// Number of characters to show from pool ID in notes
const POOL_ID_PREFIX_LENGTH = 10;

function formatAmount(lovelace: string, asset: string): string {
  if (asset === 'lovelace') {
    const ada = Number(lovelace) / LOVELACE_DIVISOR;
    return ada.toFixed(6);
  }
  return lovelace;
}

function escapeCSVField(field: string): string {
  let escaped = field;
  // First, wrap in quotes if contains special characters, and escape double quotes
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    escaped = `"${escaped.replace(/"/g, '""')}"`;
  }
  // Then prevent CSV injection by prepending single quote for formula characters
  // This must happen AFTER quote wrapping to be effective
  if (/^[=+\-@\t|]/.test(field)) {
    escaped = "'" + escaped;
  }
  return escaped;
}

function generateNotes(tx: Transaction): string {
  const notes: string[] = [];

  if (tx.type === 'stake_reward' && tx.poolId) {
    notes.push(`Pool: ${tx.poolId.slice(0, POOL_ID_PREFIX_LENGTH)}...`);
  }

  return notes.join('; ');
}

export function generateCSV(transactions: Transaction[]): string {
  const rows: string[] = [CSV_HEADERS.join(',')];

  for (const tx of transactions) {
    const row = [
      tx.timestamp.toISOString(),
      tx.type,
      tx.assetTicker || tx.asset,
      formatAmount(tx.netAmount, tx.asset),
      tx.fee ? formatAmount(tx.fee, 'lovelace') : '',
      tx.txHash,
      tx.blockHeight.toString(),
      generateNotes(tx),
    ];

    const escapedRow = row.map(escapeCSVField);
    rows.push(escapedRow.join(','));
  }

  return rows.join('\n');
}

function filterTransactions(
  transactions: Transaction[],
  options: ExportOptions
): Transaction[] {
  let filtered = [...transactions];

  if (options.startDate) {
    filtered = filtered.filter((tx) => tx.timestamp >= options.startDate!);
  }

  if (options.endDate) {
    filtered = filtered.filter((tx) => tx.timestamp <= options.endDate!);
  }

  if (!options.includeStakingRewards) {
    filtered = filtered.filter((tx) => tx.type !== 'stake_reward');
  }

  if (options.assetFilter === 'ada_only') {
    filtered = filtered.filter((tx) => tx.asset === 'lovelace');
  }

  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return filtered;
}

export async function exportTransactionsToCSV(
  transactions: Transaction[],
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const filtered = filterTransactions(transactions, options);

    if (filtered.length === 0) {
      return {
        success: false,
        filename: '',
        transactionCount: 0,
        error: transactions.length > 0
          ? 'No transactions match the selected filters'
          : 'No transactions to export',
      };
    }

    const csv = generateCSV(filtered);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cardano-transactions-${timestamp}.csv`;
    const file = new File(Paths.cache, filename);

    await file.write(csv);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Cardano Transactions',
      });
    }

    const dateRange = filtered.reduce(
      (acc, tx) => ({
        start: tx.timestamp < acc.start ? tx.timestamp : acc.start,
        end: tx.timestamp > acc.end ? tx.timestamp : acc.end,
      }),
      { start: filtered[0].timestamp, end: filtered[0].timestamp }
    );

    return {
      success: true,
      filename,
      transactionCount: filtered.length,
      dateRange,
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      transactionCount: 0,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}
