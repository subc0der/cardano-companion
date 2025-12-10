import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface PrivacyState {
  hideBalances: boolean;
  hideAddresses: boolean;
  toggleHideBalances: () => void;
  toggleHideAddresses: () => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      hideBalances: false,
      hideAddresses: false,
      toggleHideBalances: () =>
        set((state) => ({ hideBalances: !state.hideBalances })),
      toggleHideAddresses: () =>
        set((state) => ({ hideAddresses: !state.hideAddresses })),
    }),
    {
      name: STORAGE_KEYS.PRIVACY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
