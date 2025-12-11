/**
 * Notification Service
 *
 * Handles push notification setup, permissions, and delivery.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { PriceAlertNotification } from '../defi/alertTypes';

/** Notification channel ID for Android */
const PRICE_ALERT_CHANNEL_ID = 'price-alerts';

/**
 * Configure notification handling.
 * Call this in app root layout.
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Create Android notification channel.
 * Required for Android 8.0+.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(PRICE_ALERT_CHANNEL_ID, {
      name: 'Price Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00FFFF',
      sound: 'default',
    });
  }
}

/**
 * Request notification permissions.
 * Returns true if granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if notification permissions are granted.
 */
export async function checkPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a local notification for a price alert.
 */
export async function sendPriceAlertNotification(
  notification: PriceAlertNotification
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: PRICE_ALERT_CHANNEL_ID,
      }),
    },
    trigger: null, // Immediate delivery
  });

  return notificationId;
}

/**
 * Add listener for notification interactions.
 */
export function addNotificationResponseListener(
  callback: (alertId: string, pairId: string) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.type === 'price_alert') {
      callback(data.alertId as string, data.pairId as string);
    }
  });
}

/**
 * Add listener for notifications received while app is in foreground.
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
