/**
 * Design Tokens: Breakpoints - Mobile-First Responsive Design
 *
 * Apple and Android minimum touch target: 44x44px
 * These breakpoints determine when to switch between mobile and desktop component sizing
 */

export const breakpoints = {
  /**
   * Mobile breakpoint (0-767px)
   * - Touch targets: 44x44px minimum
   * - Larger padding for fat-finger taps
   * - Bottom navigation
   * - FAB for quick actions
   */
  mobile: {
    min: 0,
    max: 767,
    mediaQuery: '(max-width: 767px)',
  },

  /**
   * Tablet breakpoint (768-1023px)
   * - Hybrid sizing between mobile and desktop
   * - Can use desktop sizing for most components
   */
  tablet: {
    min: 768,
    max: 1023,
    mediaQuery: '(min-width: 768px) and (max-width: 1023px)',
  },

  /**
   * Desktop breakpoint (1024px+)
   * - Standard desktop sizing
   * - Mouse-optimized interactions
   */
  desktop: {
    min: 1024,
    mediaQuery: '(min-width: 1024px)',
  },
} as const;

export type Breakpoint = keyof typeof breakpoints;
