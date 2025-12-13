/**
 * Notification module exports
 */

export {
  configureNotifications,
  setupNotificationChannel,
  requestPermissions,
  checkPermissions,
  sendPriceAlertNotification,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from './notificationService';

export {
  BACKGROUND_ALERT_TASK,
  registerBackgroundAlertTask,
  unregisterBackgroundAlertTask,
  isBackgroundTaskRegistered,
} from './backgroundAlertTask';
