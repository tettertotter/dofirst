/**
 * Haptic Feedback Service
 *
 * Cross-platform haptic feedback with fallbacks.
 * Research: Haptics increase task completion by 12-18% and reduce errors by 23%.
 *
 * Supports:
 * - iOS: UIImpactFeedbackGenerator
 * - Android: HapticFeedbackConstants
 * - Web: Vibration API
 *
 * References:
 * - PROFESSIONAL_UI_DESIGN_GUIDE.md (2025 Mobile UX Excellence)
 * - iOS 18 Human Interface Guidelines
 * - Material 3 Expressive
 */

'use client';

/**
 * Haptic Feedback Patterns
 */
export type HapticPattern =
  | 'selection'  // Light tap (toggle, checkbox, radio)
  | 'impact'     // Medium tap (button press)
  | 'success'    // Success notification
  | 'warning'    // Warning notification
  | 'error'      // Error notification
  | 'heavy'      // Heavy impact (drag drop, confirmation)
  | 'soft'       // Subtle feedback
  | 'rigid';     // Boundary/error

/**
 * Platform-specific vibration patterns (in milliseconds)
 */
const VIBRATION_PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 10,                    // Single quick tap
  impact: 15,                       // Slightly longer
  success: [0, 50],                 // Short pause then vibrate
  warning: [0, 30, 50, 30],        // Two pulses
  error: [0, 50, 50, 50],          // Three quick pulses
  heavy: 30,                        // Long single vibration
  soft: 5,                          // Very subtle
  rigid: [0, 20, 20, 20, 20, 20],  // Rapid pulses (boundary hit)
};

/**
 * Haptic Feedback Service Class
 */
class HapticService {
  private enabled: boolean = true;
  private platform: 'ios' | 'android' | 'web' | 'unknown' = 'unknown';

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectPlatform();
      this.checkUserPreferences();
    }
  }

  /**
   * Detect Platform
   */
  private detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      this.platform = 'ios';
    } else if (/android/.test(userAgent)) {
      this.platform = 'android';
    } else {
      this.platform = 'web';
    }
  }

  /**
   * Check User Preferences
   * Respects system and app-level haptic settings
   */
  private checkUserPreferences() {
    // Check if user prefers reduced motion (also often correlates with haptic preference)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check localStorage for user preference
    const userPreference = localStorage.getItem('haptic-feedback-enabled');

    if (userPreference !== null) {
      this.enabled = userPreference === 'true';
    } else if (prefersReducedMotion) {
      // Default to disabled if user prefers reduced motion
      this.enabled = false;
    }
  }

  /**
   * Set Enabled State
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptic-feedback-enabled', String(enabled));
    }
  }

  /**
   * Get Enabled State
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Trigger Haptic Feedback
   */
  trigger(pattern: HapticPattern = 'selection') {
    if (!this.enabled || typeof window === 'undefined') {
      return;
    }

    // Platform-specific implementation
    switch (this.platform) {
      case 'ios':
        this.triggerIOS(pattern);
        break;
      case 'android':
        this.triggerAndroid(pattern);
        break;
      case 'web':
      default:
        this.triggerWeb(pattern);
        break;
    }
  }

  /**
   * iOS Haptic Feedback
   * Uses Haptics API (Expo) or falls back to Vibration API
   */
  private triggerIOS(pattern: HapticPattern) {
    // Check if Expo Haptics is available (React Native)
    // @ts-ignore - Expo global may not be defined
    if (typeof window.ExpoHaptics !== 'undefined') {
      // @ts-ignore
      const { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } =
        (window as any).ExpoHaptics;

      switch (pattern) {
        case 'selection':
        case 'soft':
          // @ts-ignore
          impactAsync(ImpactFeedbackStyle.Light);
          break;
        case 'impact':
          // @ts-ignore
          impactAsync(ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
        case 'rigid':
          // @ts-ignore
          impactAsync(ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          // @ts-ignore
          notificationAsync(NotificationFeedbackType.Success);
          break;
        case 'warning':
          // @ts-ignore
          notificationAsync(NotificationFeedbackType.Warning);
          break;
        case 'error':
          // @ts-ignore
          notificationAsync(NotificationFeedbackType.Error);
          break;
      }
    } else {
      // Fallback to Web Vibration API
      this.triggerWeb(pattern);
    }
  }

  /**
   * Android Haptic Feedback
   * Uses HapticFeedback API (React Native) or falls back to Vibration API
   */
  private triggerAndroid(pattern: HapticPattern) {
    // Check if React Native HapticFeedback is available
    // @ts-ignore - React Native global may not be defined
    if (typeof window.ReactNativeHapticFeedback !== 'undefined') {
      // @ts-ignore
      const { trigger: nativeTrigger } = window.ReactNativeHapticFeedback;

      // Map our patterns to Android HapticFeedbackConstants
      const androidPattern = {
        selection: 'clockTick',        // CLOCK_TICK
        soft: 'clockTick',
        impact: 'contextClick',        // CONTEXT_CLICK
        heavy: 'longPress',            // LONG_PRESS
        success: 'notificationSuccess', // Custom or CONFIRM
        warning: 'notificationWarning',
        error: 'notificationError',    // Custom or REJECT
        rigid: 'reject',
      }[pattern];

      nativeTrigger(androidPattern || 'impactMedium');
    } else {
      // Fallback to Web Vibration API
      this.triggerWeb(pattern);
    }
  }

  /**
   * Web Haptic Feedback
   * Uses Vibration API (widely supported)
   */
  private triggerWeb(pattern: HapticPattern) {
    if (!navigator.vibrate) {
      // Vibration API not supported
      return;
    }

    const vibrationPattern = VIBRATION_PATTERNS[pattern];

    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silent fail - haptics are non-critical
      console.debug('Haptic feedback failed:', error);
    }
  }

  /**
   * Convenience Methods
   */

  /** Light tap (toggles, checkboxes, radio buttons) */
  selection() {
    this.trigger('selection');
  }

  /** Medium tap (button presses) */
  impact() {
    this.trigger('impact');
  }

  /** Success feedback (task completed, save successful) */
  success() {
    this.trigger('success');
  }

  /** Warning feedback (confirmation needed) */
  warning() {
    this.trigger('warning');
  }

  /** Error feedback (validation error, action failed) */
  error() {
    this.trigger('error');
  }

  /** Heavy impact (drag drop, destructive action) */
  heavy() {
    this.trigger('heavy');
  }

  /** Subtle feedback (hover, focus) */
  soft() {
    this.trigger('soft');
  }

  /** Boundary/error (swipe limit reached, scroll boundary) */
  rigid() {
    this.trigger('rigid');
  }
}

/**
 * Singleton Instance
 */
const haptics = new HapticService();

/**
 * Export Singleton
 */
export { haptics };

/**
 * Export Class for Testing
 */
export { HapticService };

/**
 * React Hook for Haptic Feedback
 */
export function useHaptics() {
  return {
    trigger: (pattern: HapticPattern) => haptics.trigger(pattern),
    selection: () => haptics.selection(),
    impact: () => haptics.impact(),
    success: () => haptics.success(),
    warning: () => haptics.warning(),
    error: () => haptics.error(),
    heavy: () => haptics.heavy(),
    soft: () => haptics.soft(),
    rigid: () => haptics.rigid(),
    setEnabled: (enabled: boolean) => haptics.setEnabled(enabled),
    isEnabled: () => haptics.isEnabled(),
  };
}
