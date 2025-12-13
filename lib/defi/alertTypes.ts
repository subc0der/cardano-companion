/**
 * Price Alert Type Definitions
 * Types for DeFi price alerts and notifications.
 */

/** Alert trigger conditions */
export type AlertCondition = 'above' | 'below';

/** Alert types */
export type AlertType = 'price_target' | 'percent_change';

/** Alert status */
export type AlertStatus = 'active' | 'triggered' | 'dismissed';

/**
 * Price target alert configuration.
 * Triggers when rate crosses the target price.
 */
export interface PriceTargetAlert {
  type: 'price_target';
  /** Target exchange rate */
  targetRate: number;
  /** Trigger when price goes above or below target */
  condition: AlertCondition;
}

/**
 * Percentage change alert configuration.
 * Triggers when price changes by specified percentage.
 */
export interface PercentChangeAlert {
  type: 'percent_change';
  /** Percentage threshold (e.g., 5 = 5%) */
  percentThreshold: number;
  /** Trigger on increase, decrease, or either */
  direction: 'up' | 'down' | 'either';
  /** Base rate when alert was created (for calculating change) */
  baseRate: number;
}

/** Union type for alert configurations */
export type AlertConfig = PriceTargetAlert | PercentChangeAlert;

/**
 * Complete price alert record.
 */
export interface PriceAlert {
  /** Unique alert ID */
  id: string;
  /** Associated pair ID from watchlist */
  pairId: string;
  /** Alert configuration */
  config: AlertConfig;
  /** Current status */
  status: AlertStatus;
  /** When alert was created */
  createdAt: number;
  /** When alert was last triggered (null if never) */
  triggeredAt: number | null;
  /** Rate when triggered */
  triggeredRate: number | null;
  /** Whether notification was shown */
  notificationSent: boolean;
}

/**
 * Alert check result from background task.
 */
export interface AlertCheckResult {
  alert: PriceAlert;
  shouldTrigger: boolean;
  currentRate: number;
  message: string;
}

/**
 * Notification payload for price alerts.
 */
export interface PriceAlertNotification {
  alertId: string;
  pairId: string;
  title: string;
  body: string;
  data: {
    type: 'price_alert';
    pairId: string;
    alertId: string;
  };
}
