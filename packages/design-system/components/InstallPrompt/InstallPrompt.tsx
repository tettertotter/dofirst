'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { slideUpVariants } from '../../utils/animations';
import { haptics } from '../../utils/haptics';

/**
 * Install Prompt Component
 *
 * Smart PWA install prompt with optimal timing and UX.
 *
 * Research: 65% higher install rates with smart timing vs immediate prompts.
 * Best shown after 2+ visits, 30+ seconds engagement, or after successful action.
 */

export interface InstallPromptProps {
  /**
   * Custom title
   */
  title?: string;

  /**
   * Custom description
   */
  description?: string;

  /**
   * Custom install button text
   */
  installText?: string;

  /**
   * Custom dismiss button text
   */
  dismissText?: string;

  /**
   * Minimum time on site before showing (ms)
   */
  minTimeOnSite?: number;

  /**
   * Minimum number of visits before showing
   */
  minVisits?: number;

  /**
   * Days to wait after dismissal before showing again
   */
  dismissalCooldown?: number;

  /**
   * Called when user clicks install
   */
  onInstall?: () => void;

  /**
   * Called when user dismisses prompt
   */
  onDismiss?: () => void;

  /**
   * Position of the prompt
   */
  position?: 'top' | 'bottom';
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'todaypool_install_prompt';

interface PromptState {
  dismissed: boolean;
  dismissedAt?: number;
  visits: number;
  installed: boolean;
}

/**
 * Install prompt for PWA with smart timing
 */
export function InstallPrompt({
  title = 'Install TodayPool',
  description = 'Install our app for a faster, native-like experience with offline support',
  installText = 'Install',
  dismissText = 'Not now',
  minTimeOnSite = 30000, // 30 seconds
  minVisits = 2,
  dismissalCooldown = 7, // 7 days
  onInstall,
  onDismiss,
  position = 'bottom',
}: InstallPromptProps) {
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Load state from localStorage
    const storedState = localStorage.getItem(STORAGE_KEY);
    let state: PromptState = storedState
      ? JSON.parse(storedState)
      : { dismissed: false, visits: 0, installed: false };

    // Check if already installed
    if (state.installed) return;

    // Increment visit count
    state.visits += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Check if we should show the prompt
    const shouldShow = (): boolean => {
      // Check minimum visits
      if (state.visits < minVisits) return false;

      // Check dismissal cooldown
      if (state.dismissed && state.dismissedAt) {
        const daysSinceDismissal =
          (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissal < dismissalCooldown) return false;
      }

      return true;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);

      // Wait minimum time on site, then show if conditions met
      setTimeout(() => {
        if (shouldShow()) {
          setShowPrompt(true);
        }
      }, minTimeOnSite);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      const state: PromptState = {
        dismissed: false,
        installed: true,
        visits: 0,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [minTimeOnSite, minVisits, dismissalCooldown]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    haptics.selection();

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        haptics.success();

        // Mark as installed
        const state: PromptState = {
          dismissed: false,
          installed: true,
          visits: 0,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        if (onInstall) onInstall();
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install prompt error:', error);
      haptics.error();
    }
  };

  const handleDismiss = () => {
    haptics.selection();

    // Store dismissal
    const state: PromptState = {
      dismissed: true,
      dismissedAt: Date.now(),
      visits: 0,
      installed: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    setShowPrompt(false);

    if (onDismiss) onDismiss();
  };

  const promptStyles: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    [position]: 0,
    zIndex: theme.zIndex.modal,
    padding: theme.spacing.md,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: theme.colors.gray[0],
    boxShadow: theme.shadows.light.lg,
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: 600,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  };

  const textContainerStyles: React.CSSProperties = {
    flex: 1,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 1.4,
  };

  const buttonsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
  };

  const buttonBaseStyles: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };

  const installButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    background: theme.colors.gray[0],
    color: '#667eea',
  };

  const dismissButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    background: 'transparent',
    color: theme.colors.gray[0],
    border: `1px solid ${theme.colors.gray[0]}`,
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          style={promptStyles}
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div style={contentStyles}>
            <div style={{ fontSize: 32 }}>📱</div>
            <div style={textContainerStyles}>
              <div style={titleStyles}>{title}</div>
              <div style={descriptionStyles}>{description}</div>
            </div>
            <div style={buttonsContainerStyles}>
              <button
                onClick={handleDismiss}
                style={dismissButtonStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {dismissText}
              </button>
              <button
                onClick={handleInstall}
                style={installButtonStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {installText}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
