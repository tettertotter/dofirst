/**
 * Utility Hooks
 *
 * Professional React hooks for common patterns.
 * Essential for building real applications.
 */

// Media queries and responsive design
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, breakpoints } from './useMediaQuery';

// Click outside detection
export { useOnClickOutside } from './useOnClickOutside';

// Local storage persistence
export { useLocalStorage } from './useLocalStorage';

// Debouncing for performance
export { useDebounce, useDebouncedCallback } from './useDebounce';

// Window dimensions
export { useWindowSize } from './useWindowSize';
export type { WindowSize } from './useWindowSize';

// Keyboard shortcuts
export { useKeyPress, useKeyPressEvent } from './useKeyPress';

// Clipboard
export { useCopyToClipboard } from './useCopyToClipboard';
export type { CopyToClipboardResult } from './useCopyToClipboard';

// Boolean toggle
export { useToggle } from './useToggle';
export type { UseToggleResult } from './useToggle';

// Previous value
export { usePrevious } from './usePrevious';

// Timers
export { useInterval, useTimeout } from './useInterval';

// Optimistic updates
export { useOptimistic, useOptimisticValue } from './useOptimistic';
export type {
  UseOptimisticOptions,
  OptimisticState,
  OptimisticActions,
} from './useOptimistic';

// Web Share API
export { useShare, canShare, canShareData } from './useShare';
export type { ShareData, ShareResult, UseShareReturn } from './useShare';

// Background Sync
export { useBackgroundSync, canBackgroundSync } from './useBackgroundSync';
export type {
  SyncAction,
  UseBackgroundSyncOptions,
  UseBackgroundSyncReturn,
} from './useBackgroundSync';

// Badge API
export {
  useBadge,
  canUseBadge,
  setBadgeCount,
  clearBadgeCount,
} from './useBadge';
export type { UseBadgeOptions, UseBadgeReturn } from './useBadge';

// IndexedDB Storage
export { useIndexedDB } from './useIndexedDB';
export type { UseIndexedDBOptions, UseIndexedDBReturn } from './useIndexedDB';

// Performance Monitoring
export { usePerformance, getCoreWebVitals } from './usePerformance';
export type {
  PerformanceMetric,
  CoreWebVitals,
  UsePerformanceOptions,
  UsePerformanceReturn,
} from './usePerformance';

// Biometric Authentication
export { useBiometric, canUseBiometric, getBiometricType } from './useBiometric';
export type {
  BiometricCredential,
  UseBiometricOptions,
  UseBiometricReturn,
} from './useBiometric';

// Haptic Patterns
export { useHapticPatterns, hapticPatterns, contextualHaptics } from './useHapticPatterns';
export type { HapticSequence, UseHapticPatternsReturn } from './useHapticPatterns';

// Connection Quality
export { useConnectionQuality, isNetworkInformationSupported, getConnectionQualityLabel, getConnectionQualityColor } from './useConnectionQuality';
export type { ConnectionQuality, EffectiveConnectionType, ConnectionInfo, UseConnectionQualityOptions, UseConnectionQualityReturn } from './useConnectionQuality';

// Wake Lock
export { useWakeLock, isWakeLockSupported } from './useWakeLock';
export type { UseWakeLockOptions, UseWakeLockReturn } from './useWakeLock';

// Intersection Observer
export { useIntersectionObserver, useLazyLoad, useInfiniteScroll, useScrollAnimation, useViewportTracking, isIntersectionObserverSupported } from './useIntersectionObserver';
export type { UseIntersectionObserverOptions, UseIntersectionObserverReturn } from './useIntersectionObserver';

// Battery Status
export { useBatteryStatus, isBatteryStatusSupported, getBatteryIcon, getBatteryLevelLabel, formatTimeRemaining } from './useBatteryStatus';
export type { BatteryStatus, UseBatteryStatusOptions, UseBatteryStatusReturn } from './useBatteryStatus';
