import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletState {
  address: string | null;
  stakeAddress: string | null;
  setAddress: (address: string | null) => void;
  setStakeAddress: (stakeAddress: string | null) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      stakeAddress: null,
      setAddress: (address) => set({ address }),
      setStakeAddress: (stakeAddress) => set({ stakeAddress }),
      clearWallet: () => set({ address: null, stakeAddress: null }),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
