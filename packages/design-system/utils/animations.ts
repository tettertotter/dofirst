/**
 * Animation Utilities
 *
 * Spring physics animations using framer-motion.
 * Research-backed configs from iOS 18 and Material 3 Expressive.
 *
 * Performance:
 * - 60fps baseline (all platforms)
 * - 120fps premium (ProMotion displays)
 * - GPU-accelerated (transform, opacity only)
 *
 * References:
 * - PROFESSIONAL_UI_DESIGN_GUIDE.md (2025 Mobile UX Excellence)
 * - iOS 18 Human Interface Guidelines
 * - Material 3 Motion System
 */

'use client';

import type { Transition, Variants } from 'framer-motion';

/**
 * Spring Physics Configurations
 *
 * Based on research:
 * - Snappy: Fast interactions (buttons, toggles) - 200-300ms
 * - Smooth: Standard transitions (modals, menus) - 300-400ms
 * - Bouncy: Playful feedback (success states) - 400-500ms
 * - Gentle: Large movements (page transitions) - 500-600ms
 */
export const springConfigs = {
  /**
   * Snappy - Fast, responsive (buttons, toggles, checkboxes)
   * Duration: ~200-300ms
   */
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  /**
   * Smooth - Standard interactions (modals, dropdowns, tooltips)
   * Duration: ~300-400ms
   */
  smooth: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  /**
   * Bouncy - Playful, attention-grabbing (success, celebrations)
   * Duration: ~400-500ms
   */
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 1,
  },

  /**
   * Gentle - Subtle, large movements (sheets, pages, drawers)
   * Duration: ~500-600ms
   */
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },
} satisfies Record<string, Transition>;

/**
 * Common Animation Variants
 */

/**
 * Fade - Opacity transitions (overlays, backdrops)
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Slide Up - Bottom sheets, mobile modals
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
};

/**
 * Slide Down - Dropdowns, menus
 */
export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Scale - Centered modals, popovers
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Scale Bounce - Success states, confirmations
 */
export const scaleBounceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

/**
 * Slide Left - Swipe gestures (complete task)
 */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

/**
 * Slide Right - Swipe gestures (snooze task)
 */
export const slideRightVariants: Variants = {
  hidden: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

/**
 * Button Press - Scale down on tap
 */
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.95 },
};

/**
 * Stagger Children - Lists, grids
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between children
    },
  },
};

export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Skeleton Pulse - Loading states
 */
export const skeletonPulseVariants: Variants = {
  pulse: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Toast Slide - Notifications
 */
export const toastSlideVariants: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

/**
 * Accordion - Expand/collapse
 */
export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1 },
};

/**
 * Utility Functions
 */

/**
 * Get transition for component type
 */
export function getTransition(type: 'button' | 'modal' | 'toast' | 'sheet' | 'menu'): Transition {
  switch (type) {
    case 'button':
      return springConfigs.snappy;
    case 'modal':
    case 'menu':
      return springConfigs.smooth;
    case 'toast':
      return springConfigs.bouncy;
    case 'sheet':
      return springConfigs.gentle;
    default:
      return springConfigs.smooth;
  }
}

/**
 * Respects user's motion preferences
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get transition with reduced motion support
 */
export function getAccessibleTransition(type: 'button' | 'modal' | 'toast' | 'sheet' | 'menu'): Transition {
  if (shouldReduceMotion()) {
    // Instant transitions for reduced motion
    return { duration: 0.01 };
  }
  return getTransition(type);
}
