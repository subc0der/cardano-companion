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
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setWarning(null);
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
      setWarning(null);
      setResult(null);

      try {
        // Phase 1: Get all addresses for this wallet
        setProgress({ phase: 'fetching', current: 0, total: 0 });

        let allAddresses: string[] = [walletAddress];

        if (stakeAddress) {
          try {
            const accountAddresses =
              await blockfrost.getAccountAddresses(stakeAddress);
            const stakeAddresses = accountAddresses.map((a) => a.address);
            // Merge and deduplicate, preserving original wallet address
            allAddresses = Array.from(new Set([walletAddress, ...stakeAddresses]));
          } catch (err) {
            // Fall back to single address but warn user with details
            const reason = err instanceof Error ? err.message : 'Unknown error';
            setWarning(`Could not fetch all wallet addresses (${reason}). Export may be incomplete.`);
          }
        }

        // Phase 2: Fetch transaction hashes from all addresses in parallel
        const allTxRefs: Awaited<ReturnType<typeof fetchTransactionHashes>> = [];
        const seenHashes = new Set<string>();

        // Track cumulative progress per address during parallel fetches
        const addressProgress = new Map<string, number>();

        const allTxRefsByAddress = await Promise.all(
          allAddresses.map((address) =>
            fetchTransactionHashes(address, (count) => {
              // Each callback receives cumulative count for its address (e.g., 100, 200, 300).
              // Store per-address progress and sum across all addresses for the display counter.
              addressProgress.set(address, count);
              const totalProgress = Array.from(addressProgress.values()).reduce(
                (sum, n) => sum + n,
                0
              );
              setProgress({
                phase: 'fetching',
                current: totalProgress,
                total: 0,
              });
            })
          )
        );

        // Deduplicate and flatten results
        for (const txRefs of allTxRefsByAddress) {
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
        // If including staking rewards, continue even with no txs - we may still have rewards

        // Phase 3: Fetch transaction details
        setProgress({
          phase: 'processing',
          current: 0,
          total: allTxRefs.length,
        });

        const { transactions, failedCount } = await fetchTransactionDetails(
          allTxRefs,
          allAddresses,
          (current, total) => {
            setProgress({ phase: 'processing', current, total });
          }
        );

        // Warn user if some transactions couldn't be fetched
        if (failedCount > 0) {
          setWarning(
            `Could not fetch details for ${failedCount} transaction${failedCount > 1 ? 's' : ''}. Export may be incomplete.`
          );
        }

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
    warning,
    result,
    reset,
  };
}
