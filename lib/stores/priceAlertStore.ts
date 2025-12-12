/**
 * Price Alert Store
 *
 * Manages price alerts for watchlist pairs.
 * Uses Zustand with AsyncStorage persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { PriceAlert, AlertConfig, AlertStatus } from '../defi/alertTypes';

/** Maximum alerts per pair */
const MAX_ALERTS_PER_PAIR = 3;

/** Maximum total alerts */
const MAX_TOTAL_ALERTS = 20;

interface PriceAlertState {
  /** All price alerts */
  alerts: PriceAlert[];

  /** Whether notifications are enabled globally */
  notificationsEnabled: boolean;

  /** Last background check timestamp */
  lastBackgroundCheck: number | null;

  /** Add a new alert for a pair */
  addAlert: (pairId: string, config: AlertConfig) => boolean;

  /** Remove an alert by ID */
  removeAlert: (alertId: string) => void;

  /** Remove all alerts for a pair */
  removeAlertsForPair: (pairId: string) => void;

  /** Update alert status */
  updateAlertStatus: (
    alertId: string,
    status: AlertStatus,
    triggeredRate?: number
  ) => void;

  /** Mark alert notification as sent */
  markNotificationSent: (alertId: string) => void;

  /** Reset a triggered alert to active */
  reactivateAlert: (alertId: string) => void;

  /** Get alerts for a specific pair */
  getAlertsForPair: (pairId: string) => PriceAlert[];

  /** Get all active alerts */
  getActiveAlerts: () => PriceAlert[];

  /** Get count of triggered (unread) alerts */
  getTriggeredCount: () => number;

  /** Get total alert count */
  getTotalAlertCount: () => number;

  /** Toggle notifications globally */
  toggleNotifications: () => void;

  /** Update last background check time */
  setLastBackgroundCheck: (timestamp: number) => void;

  /** Clear all alerts */
  clearAllAlerts: () => void;
}

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      notificationsEnabled: true,
      lastBackgroundCheck: null,

      addAlert: (pairId: string, config: AlertConfig) => {
        const { alerts } = get();

        // Check limits
        const pairAlerts = alerts.filter((a) => a.pairId === pairId);
        if (pairAlerts.length >= MAX_ALERTS_PER_PAIR) {
          return false;
        }
        if (alerts.length >= MAX_TOTAL_ALERTS) {
          return false;
        }

        const newAlert: PriceAlert = {
          id: generateAlertId(),
          pairId,
          config,
          status: 'active',
          createdAt: Date.now(),
          triggeredAt: null,
          triggeredRate: null,
          notificationSent: false,
        };

        set({ alerts: [...alerts, newAlert] });
        return true;
      },

      removeAlert: (alertId: string) => {
        const { alerts } = get();
        set({ alerts: alerts.filter((a) => a.id !== alertId) });
      },

      removeAlertsForPair: (pairId: string) => {
        const { alerts } = get();
        set({ alerts: alerts.filter((a) => a.pairId !== pairId) });
      },

      updateAlertStatus: (alertId, status, triggeredRate) => {
        const { alerts } = get();
        set({
          alerts: alerts.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  status,
                  triggeredAt: status === 'triggered' ? Date.now() : a.triggeredAt,
                  triggeredRate: triggeredRate ?? a.triggeredRate,
                }
              : a
          ),
        });
      },

      markNotificationSent: (alertId: string) => {
        const { alerts } = get();
        set({
          alerts: alerts.map((a) =>
            a.id === alertId ? { ...a, notificationSent: true } : a
          ),
        });
      },

      reactivateAlert: (alertId: string) => {
        const { alerts } = get();
        set({
          alerts: alerts.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  status: 'active' as AlertStatus,
                  triggeredAt: null,
                  triggeredRate: null,
                  notificationSent: false,
                }
              : a
          ),
        });
      },

      getAlertsForPair: (pairId: string) => {
        return get().alerts.filter((a) => a.pairId === pairId);
      },

      getActiveAlerts: () => {
        return get().alerts.filter((a) => a.status === 'active');
      },

      getTriggeredCount: () => {
        return get().alerts.filter((a) => a.status === 'triggered').length;
      },

      getTotalAlertCount: () => {
        return get().alerts.length;
      },

      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },

      setLastBackgroundCheck: (timestamp: number) => {
        set({ lastBackgroundCheck: timestamp });
      },

      clearAllAlerts: () => {
        set({ alerts: [], lastBackgroundCheck: null });
      },
    }),
    {
      name: STORAGE_KEYS.PRICE_ALERTS,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Alert limits for UI display */
export const ALERT_LIMITS = {
  MAX_PER_PAIR: MAX_ALERTS_PER_PAIR,
  MAX_TOTAL: MAX_TOTAL_ALERTS,
} as const;
