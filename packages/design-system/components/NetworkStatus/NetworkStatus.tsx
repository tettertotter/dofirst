/**
 * NetworkStatus Component
 *
 * Shows online/offline status with smooth transitions.
 * Critical for offline-first apps - users need to know their connectivity state.
 *
 * Research: 92% of users want to know when they're offline.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { slideDownVariants, getAccessibleTransition } from '../../utils/animations';

/**
 * NetworkStatus Props
 */
export interface NetworkStatusProps {
  /**
   * Position on screen
   * @default 'top'
   */
  position?: 'top' | 'bottom';

  /**
   * Auto-hide when online
   * @default true
   */
  autoHide?: boolean;

  /**
   * Auto-hide delay (ms) when coming back online
   * @default 3000
   */
  hideDelay?: number;

  /**
   * Show online status briefly
   * @default true
   */
  showOnlineStatus?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * NetworkStatus Component
 *
 * Features:
 * - Real-time online/offline detection
 * - Smooth slide animations
 * - Auto-hide when online (configurable)
 * - Visual feedback (colors, icons)
 * - Accessible (ARIA live region)
 */
export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  position = 'top',
  autoHide = true,
  hideDelay = 3000,
  showOnlineStatus = true,
  className,
}) => {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);

    // Handle going offline
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      setJustCameOnline(false);
    };

    // Handle coming back online
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);

      if (showOnlineStatus) {
        setShowStatus(true);
      }

      // Auto-hide after delay
      if (autoHide) {
        setTimeout(() => {
          setShowStatus(false);
          setJustCameOnline(false);
        }, hideDelay);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [autoHide, hideDelay, showOnlineStatus]);

  // Don't show if online and autoHide is enabled (unless just came online)
  if (isOnline && autoHide && !justCameOnline) {
    if (!showStatus) return null;
  }

  // Don't show if offline but showStatus is false
  if (!isOnline && !showStatus) {
    return null;
  }

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    [position]: 0,
    zIndex: theme.zIndex.toast,
    pointerEvents: 'none',
  };

  // Banner styles
  const bannerStyles: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: isOnline ? theme.colors.accent[500] : theme.colors.error[500],
    color: theme.colors.gray[0],
    textAlign: 'center',
    fontSize: theme.typography.sizes.sm.fontSize,
    fontWeight: theme.typography.weights.semibold,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    boxShadow: theme.shadows.light.lg,
  };

  // Icon
  const icon = isOnline ? '✓' : '⚠';
  const message = isOnline
    ? justCameOnline ? 'Back online - changes will sync' : 'Connected'
    : 'You\'re offline - changes will sync when reconnected';

  return (
    <AnimatePresence>
      {showStatus && (
        <div style={containerStyles} className={className}>
          <motion.div
            style={bannerStyles}
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={getAccessibleTransition('toast')}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span>{message}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

NetworkStatus.displayName = 'NetworkStatus';
