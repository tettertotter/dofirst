/**
 * Web-only entry point for notifications package
 * Does not import React Native dependencies
 */

import type { NotificationAdapter } from './types';
import { WebNotificationAdapter } from './web-adapter';

export * from './types';

/**
 * Create notification adapter for web platform
 */
export function createNotificationAdapter(apiUrl?: string): NotificationAdapter {
  return new WebNotificationAdapter(apiUrl);
}

/**
 * Initialize notifications for web
 */
export async function initializeNotifications(): Promise<void> {
  const adapter = createNotificationAdapter();
  await adapter.requestPermission();
}

/**
 * Get notification permission status for web
 */
export async function getNotificationStatus(): Promise<'granted' | 'denied' | 'default'> {
  const adapter = createNotificationAdapter();
  const hasPermission = await adapter.hasPermission();
  return hasPermission ? 'granted' : 'default';
}
