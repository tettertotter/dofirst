import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { Button } from '../Button';
import { haptics } from '../../utils/haptics';

/**
 * App Rating Prompt Component
 *
 * Smart rating prompt that asks at the right time.
 * Uses two-step flow: internal rating first, then store redirect.
 *
 * Research: Properly timed requests increase ratings by 80%.
 * Two-step prompts have 3x higher completion rate.
 */

export interface RatingPromptProps {
  /**
   * App name
   */
  appName?: string;

  /**
   * Called when user rates (1-5 stars)
   */
  onRate?: (rating: number) => void;

  /**
   * Called when user dismisses
   */
  onDismiss?: () => void;

  /**
   * Called when redirecting to store
   */
  onStoreRedirect?: () => void;

  /**
   * App Store URL (iOS)
   */
  appStoreUrl?: string;

  /**
   * Play Store URL (Android)
   */
  playStoreUrl?: string;

  /**
   * Minimum rating to redirect to store (default 4)
   */
  minStoreRating?: number;

  /**
   * Whether prompt is open
   */
  isOpen?: boolean;

  /**
   * Custom title
   */
  title?: string;

  /**
   * Custom message
   */
  message?: string;

  /**
   * Enable haptic feedback
   */
  enableHaptics?: boolean;

  /**
   * Position on screen
   */
  position?: 'center' | 'bottom';
}

export function RatingPrompt({
  appName = 'this app',
  onRate,
  onDismiss,
  onStoreRedirect,
  appStoreUrl,
  playStoreUrl,
  minStoreRating = 4,
  isOpen = true,
  title = 'Enjoying the app?',
  message = `We'd love to hear your feedback!`,
  enableHaptics = true,
  position = 'bottom',
}: RatingPromptProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<'initial' | 'rating' | 'feedback' | 'thanks'>('initial');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  /**
   * Handle star selection
   */
  const handleRatingSelect = useCallback(
    (rating: number) => {
      setSelectedRating(rating);

      if (enableHaptics) {
        haptics.selection();
      }

      if (onRate) onRate(rating);

      // High rating - redirect to store
      if (rating >= minStoreRating) {
        setStep('thanks');

        // Redirect to appropriate store
        setTimeout(() => {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);

          let storeUrl = '';
          if (isIOS && appStoreUrl) {
            storeUrl = appStoreUrl;
          } else if (isAndroid && playStoreUrl) {
            storeUrl = playStoreUrl;
          }

          if (storeUrl) {
            if (onStoreRedirect) onStoreRedirect();
            window.open(storeUrl, '_blank');
          }

          // Auto-dismiss after redirect
          setTimeout(() => {
            if (onDismiss) onDismiss();
          }, 1000);
        }, 1500);
      } else {
        // Low rating - ask for feedback
        setStep('feedback');
      }
    },
    [
      enableHaptics,
      onRate,
      minStoreRating,
      appStoreUrl,
      playStoreUrl,
      onStoreRedirect,
      onDismiss,
    ]
  );

  /**
   * Handle dismiss
   */
  const handleDismiss = useCallback(() => {
    if (enableHaptics) haptics.selection();
    if (onDismiss) onDismiss();
  }, [enableHaptics, onDismiss]);

  /**
   * Render stars
   */
  const renderStars = () => {
    const displayRating = hoveredRating || selectedRating;

    return (
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
          justifyContent: 'center',
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
        }}
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <motion.button
            key={rating}
            onClick={() => handleRatingSelect(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 40,
              padding: theme.spacing.xs,
              filter: rating <= displayRating ? 'none' : 'grayscale(100%)',
              opacity: rating <= displayRating ? 1 : 0.3,
              transition: 'all 0.2s ease',
            }}
          >
            ⭐
          </motion.button>
        ))}
      </div>
    );
  };

  /**
   * Render content based on step
   */
  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: theme.spacing.sm,
                textAlign: 'center',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 15,
                color: theme.colors.gray[600],
                marginBottom: theme.spacing.md,
                textAlign: 'center',
              }}
            >
              {message}
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <Button onClick={handleDismiss} variant="ghost" fullWidth>
                Not Now
              </Button>
              <Button onClick={() => setStep('rating')} fullWidth>
                Rate App
              </Button>
            </div>
          </>
        );

      case 'rating':
        return (
          <>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: theme.spacing.sm,
                textAlign: 'center',
              }}
            >
              How would you rate {appName}?
            </div>
            {renderStars()}
            <Button onClick={handleDismiss} variant="ghost" fullWidth>
              Cancel
            </Button>
          </>
        );

      case 'feedback':
        return (
          <>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: theme.spacing.sm,
                textAlign: 'center',
              }}
            >
              Thanks for your feedback!
            </div>
            <div
              style={{
                fontSize: 15,
                color: theme.colors.gray[600],
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              }}
            >
              We're sorry you're not having a great experience. Please let us know how we
              can improve.
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <Button onClick={handleDismiss} variant="ghost" fullWidth>
                Maybe Later
              </Button>
              <Button
                onClick={() => {
                  // Open feedback form (could be email, support page, etc.)
                  handleDismiss();
                }}
                fullWidth
              >
                Send Feedback
              </Button>
            </div>
          </>
        );

      case 'thanks':
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: 60,
                textAlign: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              🎉
            </motion.div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: theme.spacing.sm,
                textAlign: 'center',
              }}
            >
              Thank you!
            </div>
            <div
              style={{
                fontSize: 15,
                color: theme.colors.gray[600],
                textAlign: 'center',
              }}
            >
              Redirecting to store...
            </div>
          </>
        );
    }
  };

  if (!isOpen) return null;

  const containerStyle: React.CSSProperties =
    position === 'center'
      ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: theme.zIndex.modal + 1,
        width: '90%',
        maxWidth: 400,
      }
      : {
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: theme.zIndex.modal + 1,
        maxWidth: 400,
        margin: '0 auto',
      };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.modal,
          }}
        />

        {/* Prompt */}
        <motion.div
          initial={{ opacity: 0, y: position === 'center' ? -20 : 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'center' ? -20 : 50, scale: 0.95 }}
          style={{
            ...containerStyle,
            background: theme.colors.gray[0],
            borderRadius: theme.radius.xl,
            padding: theme.spacing.xl,
            boxShadow: theme.shadows.light.xl,
          }}
        >
          {renderContent()}
        </motion.div>
      </>
    </AnimatePresence>
  );
}

/**
 * Smart rating prompt manager with timing logic
 */
export interface RatingPromptManagerOptions {
  /**
   * Minimum number of sessions before showing
   */
  minSessions?: number;

  /**
   * Minimum number of days since install
   */
  minDaysSinceInstall?: number;

  /**
   * Minimum number of significant events
   */
  minSignificantEvents?: number;

  /**
   * Days to wait after dismiss
   */
  daysUntilPrompt?: number;

  /**
   * Storage key prefix
   */
  storageKey?: string;
}

export class RatingPromptManager {
  private options: Required<RatingPromptManagerOptions>;

  constructor(options: RatingPromptManagerOptions = {}) {
    this.options = {
      minSessions: options.minSessions ?? 3,
      minDaysSinceInstall: options.minDaysSinceInstall ?? 7,
      minSignificantEvents: options.minSignificantEvents ?? 5,
      daysUntilPrompt: options.daysUntilPrompt ?? 30,
      storageKey: options.storageKey ?? 'rating-prompt',
    };
  }

  /**
   * Check if should show prompt
   */
  shouldShow(): boolean {
    if (typeof window === 'undefined') return false;

    const data = this.getData();

    // Already rated
    if (data.hasRated) return false;

    // Recently dismissed
    if (data.lastDismissed) {
      const daysSinceDismiss =
        (Date.now() - data.lastDismissed) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < this.options.daysUntilPrompt) return false;
    }

    // Check criteria
    const daysSinceInstall = (Date.now() - data.installDate) / (1000 * 60 * 60 * 24);
    return (
      data.sessionCount >= this.options.minSessions &&
      daysSinceInstall >= this.options.minDaysSinceInstall &&
      data.significantEvents >= this.options.minSignificantEvents
    );
  }

  /**
   * Record session
   */
  recordSession(): void {
    const data = this.getData();
    data.sessionCount++;
    this.saveData(data);
  }

  /**
   * Record significant event
   */
  recordSignificantEvent(): void {
    const data = this.getData();
    data.significantEvents++;
    this.saveData(data);
  }

  /**
   * Record rating
   */
  recordRating(rating: number): void {
    const data = this.getData();
    data.hasRated = true;
    data.rating = rating;
    this.saveData(data);
  }

  /**
   * Record dismiss
   */
  recordDismiss(): void {
    const data = this.getData();
    data.lastDismissed = Date.now();
    data.dismissCount++;
    this.saveData(data);
  }

  /**
   * Get data
   */
  private getData() {
    if (typeof window === 'undefined') {
      return this.getDefaultData();
    }

    const stored = localStorage.getItem(this.options.storageKey);
    if (!stored) {
      const data = this.getDefaultData();
      this.saveData(data);
      return data;
    }

    return JSON.parse(stored);
  }

  /**
   * Save data
   */
  private saveData(data: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.options.storageKey, JSON.stringify(data));
  }

  /**
   * Get default data
   */
  private getDefaultData() {
    return {
      installDate: Date.now(),
      sessionCount: 0,
      significantEvents: 0,
      hasRated: false,
      rating: null,
      lastDismissed: null,
      dismissCount: 0,
    };
  }

  /**
   * Reset all data
   */
  reset(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.options.storageKey);
  }
}

/**
 * Create rating prompt manager instance
 */
export function createRatingPromptManager(
  options?: RatingPromptManagerOptions
): RatingPromptManager {
  return new RatingPromptManager(options);
}
