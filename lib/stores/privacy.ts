import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      name: 'privacy-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
