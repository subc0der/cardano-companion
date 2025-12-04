import { useQuery } from '@tanstack/react-query';
import { blockfrost } from '../api/blockfrost';
import { useWalletStore } from '../stores/wallet';

export interface WalletBalance {
  lovelace: string;
  ada: number;
  rewardsAda: number;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  unit: string;
  quantity: string;
  policyId: string;
  assetName: string;
  displayName: string;
}

function parseAssetUnit(unit: string): { policyId: string; assetName: string } {
  // Lovelace is just 'lovelace'
  if (unit === 'lovelace') {
    return { policyId: '', assetName: '' };
  }
  // Other assets: first 56 chars are policy ID, rest is asset name (hex)
  const policyId = unit.slice(0, 56);
  const assetNameHex = unit.slice(56);
  return { policyId, assetName: assetNameHex };
}

function hexToAscii(hex: string): string {
  try {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.slice(i, i + 2), 16);
      if (charCode >= 32 && charCode <= 126) {
        str += String.fromCharCode(charCode);
      }
    }
    return str || hex.slice(0, 8);
  } catch {
    return hex.slice(0, 8);
  }
}

function lovelaceToAda(lovelace: bigint): number {
  // Convert BigInt to ADA using string manipulation to avoid precision loss
  const lovelaceStr = lovelace.toString().padStart(7, '0');
  const integerPart = lovelaceStr.slice(0, -6) || '0';
  const decimalPart = lovelaceStr.slice(-6);
  const adaStr = `${integerPart}.${decimalPart}`;
  return parseFloat(adaStr);
}

async function fetchWalletBalance(address: string): Promise<WalletBalance> {
  // Step 1: Get address info to find the stake address
  const addressInfo = await blockfrost.getAddressInfo(address);
  const stakeAddress = addressInfo.stake_address;

  const balances = new Map<string, bigint>();
  let stakingRewards = BigInt(0);

  if (stakeAddress) {
    // Step 2: Get ALL addresses associated with this stake key
    const accountAddresses = await blockfrost.getAccountAddresses(stakeAddress);

    // Step 3: Fetch UTXOs from all addresses in parallel
    const utxoPromises = accountAddresses.map((addr) =>
      blockfrost.getAddressUtxos(addr.address)
    );
    const allUtxoArrays = await Promise.all(utxoPromises);

    // Aggregate balances from all UTXOs
    for (const utxos of allUtxoArrays) {
      for (const utxo of utxos) {
        for (const amount of utxo.amount) {
          const current = balances.get(amount.unit) || BigInt(0);
          balances.set(amount.unit, current + BigInt(amount.quantity));
        }
      }
    }

    // Step 4: Get staking rewards (withdrawable amount)
    try {
      const accountInfo = await blockfrost.getAccountInfo(stakeAddress);
      stakingRewards = BigInt(accountInfo.withdrawable_amount || '0');
    } catch (error) {
      // Only ignore 404 errors (account not registered for staking)
      // Re-throw other errors (network issues, server errors, etc.)
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('404') && !errorMessage.includes('not found')) {
        throw error;
      }
    }
  } else {
    // No stake address - just fetch UTXOs for this single address
    const utxos = await blockfrost.getAddressUtxos(address);
    for (const utxo of utxos) {
      for (const amount of utxo.amount) {
        const current = balances.get(amount.unit) || BigInt(0);
        balances.set(amount.unit, current + BigInt(amount.quantity));
      }
    }
  }

  // Extract lovelace (ADA) and add staking rewards
  const utxoLovelace = balances.get('lovelace') || BigInt(0);
  const totalLovelace = utxoLovelace + stakingRewards;
  const lovelace = totalLovelace.toString();
  const ada = lovelaceToAda(totalLovelace);
  const rewardsAda = lovelaceToAda(stakingRewards);

  // Build token list
  const tokens: TokenBalance[] = [];
  for (const [unit, quantity] of balances) {
    if (unit === 'lovelace') continue;

    const { policyId, assetName } = parseAssetUnit(unit);
    tokens.push({
      unit,
      quantity: quantity.toString(),
      policyId,
      assetName,
      displayName: hexToAscii(assetName) || unit.slice(0, 12),
    });
  }

  return { lovelace, ada, rewardsAda, tokens };
}

export function useWalletData() {
  const { address, stakeAddress } = useWalletStore();
  const walletIdentifier = address || stakeAddress;

  return useQuery({
    queryKey: ['wallet-balance', walletIdentifier],
    queryFn: () => {
      if (!walletIdentifier) {
        throw new Error('No wallet address');
      }
      // For stake addresses, we'd need a different endpoint
      // For now, only support regular addresses
      if (walletIdentifier.startsWith('stake1')) {
        throw new Error('Stake address balance lookup not yet implemented');
      }
      return fetchWalletBalance(walletIdentifier);
    },
    enabled: !!walletIdentifier && !walletIdentifier.startsWith('stake1'),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}
