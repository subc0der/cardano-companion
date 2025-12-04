import { useState, useCallback } from 'react';
import {
  fetchTransactionHashes,
  fetchTransactionDetails,
  fetchStakingRewards,
} from '../api/blockfrost-transactions';
import { exportTransactionsToCSV } from '../utils/csv-export';
import { blockfrost } from '../api/blockfrost';
import {
  Transaction,
  ExportOptions,
  ExportResult,
  ExportProgress,
} from '../types/transaction';

export function useExportTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    phase: 'fetching',
    current: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setProgress({ phase: 'fetching', current: 0, total: 0 });
  }, []);

  const exportData = useCallback(
    async (
      walletAddress: string,
      stakeAddress: string | null,
      options: ExportOptions
    ) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        // Phase 1: Get all addresses for this wallet
        setProgress({ phase: 'fetching', current: 0, total: 0 });

        let allAddresses: string[] = [walletAddress];

        if (stakeAddress) {
          try {
            const accountAddresses =
              await blockfrost.getAccountAddresses(stakeAddress);
            allAddresses = accountAddresses.map((a) => a.address);
          } catch {
            // Fall back to single address
          }
        }

        // Phase 2: Fetch transaction hashes from all addresses
        const allTxRefs: Awaited<ReturnType<typeof fetchTransactionHashes>> = [];
        const seenHashes = new Set<string>();

        for (const address of allAddresses) {
          const txRefs = await fetchTransactionHashes(address, (count) => {
            setProgress({ phase: 'fetching', current: count, total: 0 });
          });

          for (const txRef of txRefs) {
            if (!seenHashes.has(txRef.tx_hash)) {
              seenHashes.add(txRef.tx_hash);
              allTxRefs.push(txRef);
            }
          }
        }

        if (allTxRefs.length === 0 && !options.includeStakingRewards) {
          setError('No transactions found for this wallet');
          return;
        }

        // Phase 3: Fetch transaction details
        setProgress({
          phase: 'processing',
          current: 0,
          total: allTxRefs.length,
        });

        const transactions = await fetchTransactionDetails(
          allTxRefs,
          allAddresses,
          (current, total) => {
            setProgress({ phase: 'processing', current, total });
          }
        );

        // Phase 4: Fetch staking rewards if requested
        let allTransactions: Transaction[] = transactions;

        if (options.includeStakingRewards && stakeAddress) {
          const rewards = await fetchStakingRewards(stakeAddress);
          allTransactions = [...transactions, ...rewards];
        }

        // Phase 5: Generate and share CSV
        setProgress({ phase: 'exporting', current: 0, total: 1 });

        const exportResult = await exportTransactionsToCSV(
          allTransactions,
          options
        );

        if (exportResult.success) {
          setResult(exportResult);
        } else {
          setError(exportResult.error || 'Export failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    exportData,
    isLoading,
    progress,
    error,
    result,
    reset,
  };
}
