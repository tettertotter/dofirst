import { useState, useEffect, useCallback } from 'react';

/**
 * Connection Quality Monitor Hook
 *
 * Monitors network connection quality and speed.
 * Helps adapt UI/UX based on connection capabilities.
 *
 * Research: Apps that adapt to network conditions see 28% less abandonment.
 */

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';

export interface ConnectionInfo {
  /**
   * Whether online
   */
  isOnline: boolean;

  /**
   * Connection quality rating
   */
  quality: ConnectionQuality;

  /**
   * Effective connection type
   */
  effectiveType: EffectiveConnectionType;

  /**
   * Download speed estimate (Mbps)
   */
  downlink?: number;

  /**
   * Round-trip time (ms)
   */
  rtt?: number;

  /**
   * Whether on metered connection
   */
  saveData?: boolean;
}

export interface UseConnectionQualityOptions {
  /**
   * Called when connection changes
   */
  onChange?: (info: ConnectionInfo) => void;

  /**
   * Called when going offline
   */
  onOffline?: () => void;

  /**
   * Called when coming online
   */
  onOnline?: () => void;
}

export interface UseConnectionQualityReturn extends ConnectionInfo {
  /**
   * Whether connection is fast enough for rich media
   */
  canLoadMedia: boolean;

  /**
   * Whether connection is fast enough for HD video
   */
  canLoadHD: boolean;

  /**
   * Whether should use data-saver mode
   */
  shouldSaveData: boolean;

  /**
   * Refresh connection info
   */
  refresh: () => void;
}

/**
 * Hook for monitoring connection quality
 */
export function useConnectionQuality(
  options?: UseConnectionQualityOptions
): UseConnectionQualityReturn {
  const { onChange, onOffline, onOnline } = options || {};

  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(() =>
    getConnectionInfo()
  );

  /**
   * Update connection info
   */
  const updateConnectionInfo = useCallback(() => {
    const newInfo = getConnectionInfo();
    setConnectionInfo((prev) => {
      // Check if online status changed
      if (prev.isOnline && !newInfo.isOnline && onOffline) {
        onOffline();
      } else if (!prev.isOnline && newInfo.isOnline && onOnline) {
        onOnline();
      }

      // Call onChange if anything changed
      if (onChange && JSON.stringify(prev) !== JSON.stringify(newInfo)) {
        onChange(newInfo);
      }

      return newInfo;
    });
  }, [onChange, onOffline, onOnline]);

  /**
   * Listen for connection changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update on online/offline events
    window.addEventListener('online', updateConnectionInfo);
    window.addEventListener('offline', updateConnectionInfo);

    // Update on connection change (Network Information API)
    const connection = getNetworkConnection();
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
    }

    // Poll for changes (fallback)
    const interval = setInterval(updateConnectionInfo, 30000); // Every 30s

    return () => {
      window.removeEventListener('online', updateConnectionInfo);
      window.removeEventListener('offline', updateConnectionInfo);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
      clearInterval(interval);
    };
  }, [updateConnectionInfo]);

  // Derived state
  const canLoadMedia = connectionInfo.quality !== 'poor' && connectionInfo.isOnline;
  const canLoadHD = ['excellent', 'good'].includes(connectionInfo.quality) && connectionInfo.isOnline;
  const shouldSaveData = connectionInfo.saveData || connectionInfo.quality === 'poor';

  return {
    ...connectionInfo,
    canLoadMedia,
    canLoadHD,
    shouldSaveData,
    refresh: updateConnectionInfo,
  };
}

/**
 * Get current connection info
 */
function getConnectionInfo(): ConnectionInfo {
  if (typeof window === 'undefined') {
    return {
      isOnline: true,
      quality: 'good',
      effectiveType: 'unknown',
    };
  }

  const isOnline = navigator.onLine;
  const connection = getNetworkConnection();

  if (!isOnline) {
    return {
      isOnline: false,
      quality: 'offline',
      effectiveType: 'unknown',
    };
  }

  const effectiveType = (connection?.effectiveType || 'unknown') as EffectiveConnectionType;
  const downlink = connection?.downlink;
  const rtt = connection?.rtt;
  const saveData = connection?.saveData || false;

  // Determine quality
  let quality: ConnectionQuality = 'good';

  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    quality = 'poor';
  } else if (effectiveType === '3g') {
    quality = 'fair';
  } else if (effectiveType === '4g') {
    // Use downlink and RTT to differentiate between good and excellent
    if (downlink && downlink >= 10 && rtt && rtt < 100) {
      quality = 'excellent';
    } else {
      quality = 'good';
    }
  } else if (effectiveType === 'wifi') {
    quality = 'excellent';
  }

  return {
    isOnline,
    quality,
    effectiveType,
    downlink,
    rtt,
    saveData,
  };
}

/**
 * Get Network Information API connection
 */
function getNetworkConnection(): any {
  if (typeof navigator === 'undefined') return null;

  return (
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection ||
    null
  );
}

/**
 * Check if Network Information API is supported
 */
export function isNetworkInformationSupported(): boolean {
  return typeof navigator !== 'undefined' && getNetworkConnection() !== null;
}

/**
 * Get connection quality label
 */
export function getConnectionQualityLabel(quality: ConnectionQuality): string {
  const labels: Record<ConnectionQuality, string> = {
    excellent: 'Excellent Connection',
    good: 'Good Connection',
    fair: 'Fair Connection',
    poor: 'Poor Connection',
    offline: 'No Connection',
  };
  return labels[quality];
}

/**
 * Get connection quality color
 */
export function getConnectionQualityColor(quality: ConnectionQuality): string {
  const colors: Record<ConnectionQuality, string> = {
    excellent: '#10b981', // green
    good: '#3b82f6', // blue
    fair: '#f59e0b', // amber
    poor: '#ef4444', // red
    offline: '#6b7280', // gray
  };
  return colors[quality];
}
