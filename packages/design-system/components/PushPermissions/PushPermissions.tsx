import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { Modal } from '../Modal';

/**
 * Push Permissions Component
 *
 * Handles requesting and managing push notification permissions.
 * Uses native Notifications API with graceful degradation.
 *
 * Research: 47% higher engagement with push notifications enabled.
 * Opt-in rate increases by 3x with contextual permission requests.
 */

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PushPermissionsProps {
  /**
   * Called when permission is granted
   */
  onPermissionGranted?: (subscription?: PushSubscription) => void;

  /**
   * Called when permission is denied
   */
  onPermissionDenied?: () => void;

  /**
   * Called on error
   */
  onError?: (error: Error) => void;

  /**
   * VAPID public key for push subscription
   */
  vapidPublicKey?: string;

  /**
   * Whether to show as modal (vs inline)
   */
  modal?: boolean;

  /**
   * Whether modal is open (controlled mode)
   */
  isOpen?: boolean;

  /**
   * Called when modal closes
   */
  onClose?: () => void;

  /**
   * Custom title
   */
  title?: string;

  /**
   * Custom description
   */
  description?: string;

  /**
   * Custom benefits list
   */
  benefits?: string[];

  /**
   * Show helpful instructions for denied state
   */
  showInstructions?: boolean;

  /**
   * Auto-subscribe to push after permission granted
   */
  autoSubscribe?: boolean;
}

export function PushPermissions({
  onPermissionGranted,
  onPermissionDenied,
  onError,
  vapidPublicKey,
  modal = false,
  isOpen = true,
  onClose,
  title = 'Stay Updated',
  description = 'Get notified about important updates and activity.',
  benefits = [
    'New proposals in your pools',
    'Voting deadlines approaching',
    'Results and winners announced',
    'Direct messages and mentions',
  ],
  showInstructions = true,
  autoSubscribe = true,
}: PushPermissionsProps) {
  const { theme } = useTheme();
  const [permissionState, setPermissionState] = useState<PermissionState>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  /**
   * Check current permission state
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionState('unsupported');
      return;
    }

    setPermissionState(Notification.permission as PermissionState);
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      const err = new Error('Notifications not supported');
      if (onError) onError(err);
      return;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PermissionState);

      if (permission === 'granted') {
        // Subscribe to push if VAPID key provided and autoSubscribe enabled
        if (vapidPublicKey && autoSubscribe && 'serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
            });

            setSubscription(pushSubscription);
            if (onPermissionGranted) onPermissionGranted(pushSubscription);
          } catch (subscribeError) {
            // Failed to subscribe, but permission granted
            if (onPermissionGranted) onPermissionGranted();
          }
        } else {
          if (onPermissionGranted) onPermissionGranted();
        }
      } else if (permission === 'denied') {
        if (onPermissionDenied) onPermissionDenied();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Permission request failed');
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Subscribe to push notifications
   */
  const subscribeToPush = async () => {
    if (
      !vapidPublicKey ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      setSubscription(pushSubscription);
      if (onPermissionGranted) onPermissionGranted(pushSubscription);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Push subscription failed');
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Content to display
   */
  const renderContent = () => {
    // Unsupported
    if (permissionState === 'unsupported') {
      return (
        <Alert variant="warning">
          Push notifications are not supported in your browser.
        </Alert>
      );
    }

    // Already granted
    if (permissionState === 'granted') {
      return (
        <div>
          <Alert variant="success">
            Push notifications are enabled! 🎉
          </Alert>

          {vapidPublicKey && !subscription && (
            <div style={{ marginTop: theme.spacing.md }}>
              <Button
                onClick={subscribeToPush}
                loading={isLoading}
                fullWidth
              >
                Subscribe to Updates
              </Button>
            </div>
          )}

          {subscription && (
            <div
              style={{
                marginTop: theme.spacing.md,
                fontSize: 14,
                color: theme.colors.gray[600],
              }}
            >
              You're subscribed and will receive notifications.
            </div>
          )}
        </div>
      );
    }

    // Denied
    if (permissionState === 'denied') {
      return (
        <div>
          <Alert variant="error">
            Notification permissions were denied.
          </Alert>

          {showInstructions && (
            <div style={{ marginTop: theme.spacing.md }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: theme.spacing.sm,
                }}
              >
                To enable notifications:
              </div>
              <ol
                style={{
                  fontSize: 14,
                  paddingLeft: theme.spacing.lg,
                  margin: 0,
                  color: theme.colors.gray[600],
                }}
              >
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Notifications" in the permissions list</li>
                <li>Change the setting to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
      );
    }

    // Default - need to request
    return (
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: theme.spacing.sm,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 15,
            color: theme.colors.gray[600],
            marginBottom: theme.spacing.lg,
          }}
        >
          {description}
        </div>

        <div
          style={{
            background: theme.colors.gray[50],
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: theme.spacing.md,
            }}
          >
            You'll be notified about:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 18 }}>✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={requestPermission}
          loading={isLoading}
          size="lg"
          fullWidth
        >
          Enable Notifications
        </Button>

        <div
          style={{
            marginTop: theme.spacing.md,
            fontSize: 13,
            color: theme.colors.gray[500],
            textAlign: 'center',
          }}
        >
          You can change this anytime in your browser settings
        </div>
      </div>
    );
  };

  // Modal mode
  if (modal) {
    return (
      <Modal open={isOpen} onClose={onClose || (() => { })} size="sm">
        <div style={{ padding: theme.spacing.lg }}>
          {renderContent()}
        </div>
      </Modal>
    );
  }

  // Inline mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: theme.colors.gray[0],
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        boxShadow: theme.shadows.light.md,
      }}
    >
      {renderContent()}
    </motion.div>
  );
}

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function canUsePushNotifications(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as PermissionState;
}

/**
 * Request notification permission (standalone)
 */
export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  const permission = await Notification.requestPermission();
  return permission as PermissionState;
}
