import { useState, useEffect, useCallback } from 'react';

/**
 * Battery Status Hook
 *
 * Monitor device battery level and charging status.
 * Adapt app behavior to conserve battery when needed.
 *
 * Research: Battery-aware apps see 31% less complaints about battery drain.
 */

export interface BatteryStatus {
  /**
   * Whether battery info is supported
   */
  isSupported: boolean;

  /**
   * Battery level (0-1)
   */
  level: number | null;

  /**
   * Whether device is charging
   */
  isCharging: boolean | null;

  /**
   * Time until fully charged (seconds)
   */
  chargingTime: number | null;

  /**
   * Time until battery depleted (seconds)
   */
  dischargingTime: number | null;

  /**
   * Battery level category
   */
  levelCategory: 'critical' | 'low' | 'medium' | 'high' | null;

  /**
   * Whether in power save mode
   */
  shouldSavePower: boolean;
}

export interface UseBatteryStatusOptions {
  /**
   * Called when battery status changes
   */
  onChange?: (status: BatteryStatus) => void;

  /**
   * Called when battery is low
   */
  onLowBattery?: (level: number) => void;

  /**
   * Low battery threshold (0-1)
   */
  lowBatteryThreshold?: number;

  /**
   * Called when charging status changes
   */
  onChargingChange?: (isCharging: boolean) => void;
}

export interface UseBatteryStatusReturn extends BatteryStatus {
  /**
   * Refresh battery status
   */
  refresh: () => Promise<void>;
}

/**
 * Hook for monitoring battery status
 */
export function useBatteryStatus(
  options?: UseBatteryStatusOptions
): UseBatteryStatusReturn {
  const {
    onChange,
    onLowBattery,
    lowBatteryThreshold = 0.2,
    onChargingChange,
  } = options || {};

  const [status, setStatus] = useState<BatteryStatus>({
    isSupported: false,
    level: null,
    isCharging: null,
    chargingTime: null,
    dischargingTime: null,
    levelCategory: null,
    shouldSavePower: false,
  });

  /**
   * Get battery status
   */
  const updateBatteryStatus = useCallback(
    async (battery?: any): Promise<void> => {
      if (!battery) return;

      const level = battery.level;
      const isCharging = battery.charging;
      const chargingTime = battery.chargingTime === Infinity ? null : battery.chargingTime;
      const dischargingTime =
        battery.dischargingTime === Infinity ? null : battery.dischargingTime;

      // Determine level category
      let levelCategory: BatteryStatus['levelCategory'] = 'high';
      if (level < 0.05) {
        levelCategory = 'critical';
      } else if (level < 0.15) {
        levelCategory = 'low';
      } else if (level < 0.5) {
        levelCategory = 'medium';
      }

      // Should save power if battery is low and not charging
      const shouldSavePower = !isCharging && level < lowBatteryThreshold;

      const newStatus: BatteryStatus = {
        isSupported: true,
        level,
        isCharging,
        chargingTime,
        dischargingTime,
        levelCategory,
        shouldSavePower,
      };

      setStatus((prev) => {
        // Check if charging status changed
        if (prev.isCharging !== null && prev.isCharging !== isCharging && onChargingChange) {
          onChargingChange(isCharging);
        }

        // Check if battery is low
        if (
          !isCharging &&
          level < lowBatteryThreshold &&
          (prev.level === null || prev.level >= lowBatteryThreshold) &&
          onLowBattery
        ) {
          onLowBattery(level);
        }

        // Call onChange
        if (onChange && JSON.stringify(prev) !== JSON.stringify(newStatus)) {
          onChange(newStatus);
        }

        return newStatus;
      });
    },
    [onChange, onLowBattery, lowBatteryThreshold, onChargingChange]
  );

  /**
   * Initialize battery monitoring
   */
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      setStatus((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    let battery: any;

    // Get battery and setup listeners
    (navigator as any).getBattery().then((b: any) => {
      battery = b;

      // Update initially
      updateBatteryStatus(battery);

      // Listen for changes
      battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
      battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
      battery.addEventListener('chargingtimechange', () => updateBatteryStatus(battery));
      battery.addEventListener('dischargingtimechange', () => updateBatteryStatus(battery));
    });

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', () => updateBatteryStatus(battery));
        battery.removeEventListener('chargingchange', () => updateBatteryStatus(battery));
        battery.removeEventListener('chargingtimechange', () => updateBatteryStatus(battery));
        battery.removeEventListener('dischargingtimechange', () =>
          updateBatteryStatus(battery)
        );
      }
    };
  }, [updateBatteryStatus]);

  /**
   * Refresh battery status
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      return;
    }

    const battery = await (navigator as any).getBattery();
    await updateBatteryStatus(battery);
  }, [updateBatteryStatus]);

  return {
    ...status,
    refresh,
  };
}

/**
 * Check if Battery Status API is supported
 */
export function isBatteryStatusSupported(): boolean {
  return typeof navigator !== 'undefined' && 'getBattery' in navigator;
}

/**
 * Get battery level icon
 */
export function getBatteryIcon(level: number | null, isCharging: boolean | null): string {
  if (level === null) return '🔋';

  if (isCharging) return '🔌';

  if (level < 0.05) return '🪫'; // Critical
  if (level < 0.2) return '🔋'; // Low (empty battery)
  if (level < 0.5) return '🔋'; // Medium
  return '🔋'; // High (full battery)
}

/**
 * Get battery level label
 */
export function getBatteryLevelLabel(
  level: number | null,
  isCharging: boolean | null
): string {
  if (level === null) return 'Unknown';

  const percentage = Math.round(level * 100);

  if (isCharging) {
    return `Charging (${percentage}%)`;
  }

  return `${percentage}%`;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number | null): string {
  if (seconds === null || seconds === Infinity) {
    return 'Calculating...';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
