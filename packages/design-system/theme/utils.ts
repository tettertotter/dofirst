/**
 * Theme Utilities
 *
 * Helper functions for theme resolution and color scheme management.
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, zIndex } from '../tokens/spacing';
import { shadows, elevation } from '../tokens/shadows';
import { radius, componentRadius } from '../tokens/radius';
import { duration, easing, transition, animation } from '../tokens/animations';
import type { ColorScheme, Theme, ResolvedColors } from './types';

/**
 * Detect system color scheme preference
 */
export function getSystemColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Resolve color scheme (handles 'auto' preference)
 */
export function resolveColorScheme(scheme: ColorScheme): 'light' | 'dark' {
  if (scheme === 'auto') {
    return getSystemColorScheme();
  }
  return scheme;
}

/**
 * Get resolved colors based on color scheme
 */
export function getResolvedColors(isDark: boolean): ResolvedColors {
  if (isDark) {
    return {
      // Background colors
      bg: {
        primary: colors.dark.bg.primary,
        secondary: colors.dark.bg.secondary,
        tertiary: colors.dark.bg.tertiary,
        quaternary: colors.dark.bg.quaternary,
      },

      // Text colors
      text: {
        primary: colors.dark.text.primary,
        secondary: colors.dark.text.secondary,
        tertiary: colors.dark.text.tertiary,
        disabled: colors.dark.text.disabled,
      },

      // Border colors
      border: {
        subtle: colors.dark.border.subtle,
        default: colors.dark.border.default,
        emphasis: colors.dark.border.emphasis,
      },

      // Interactive colors
      interactive: {
        primary: colors.primary[500],
        primaryHover: colors.primary[400],
        primaryActive: colors.primary[600],
        secondary: colors.gray[600],
        secondaryHover: colors.gray[500],
        secondaryActive: colors.gray[700],
      },

      // Semantic colors
      semantic: {
        success: colors.accent[500],
        warning: colors.warning[500],
        error: colors.error[500],
        info: colors.info[500],
      },

      // Surface colors
      surface: {
        default: colors.dark.bg.secondary,
        hover: colors.dark.bg.tertiary,
        active: colors.dark.bg.quaternary,
        disabled: colors.dark.bg.secondary,
      },
    };
  }

  // Light mode
  return {
    // Background colors
    bg: {
      primary: colors.gray[0],
      secondary: colors.gray[50],
      tertiary: colors.gray[100],
      quaternary: colors.gray[200],
    },

    // Text colors
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      tertiary: colors.gray[500],
      disabled: colors.gray[400],
    },

    // Border colors
    border: {
      subtle: colors.gray[200],
      default: colors.gray[300],
      emphasis: colors.gray[400],
    },

    // Interactive colors
    interactive: {
      primary: colors.primary[500],
      primaryHover: colors.primary[600],
      primaryActive: colors.primary[700],
      secondary: colors.gray[200],
      secondaryHover: colors.gray[300],
      secondaryActive: colors.gray[400],
    },

    // Semantic colors
    semantic: {
      success: colors.accent[500],
      warning: colors.warning[500],
      error: colors.error[500],
      info: colors.info[500],
    },

    // Surface colors
    surface: {
      default: colors.gray[0],
      hover: colors.gray[50],
      active: colors.gray[100],
      disabled: colors.gray[100],
    },
  };
}

/**
 * Create theme object from color scheme
 */
export function createTheme(colorScheme: ColorScheme): Theme {
  const isDark = resolveColorScheme(colorScheme) === 'dark';

  return {
    colorScheme,
    isDark,

    // Design tokens
    colors,
    typography,
    spacing,
    zIndex,
    shadows,
    elevation,
    radius,
    componentRadius,
    duration,
    easing,
    transition,
    animation,
  };
}

/**
 * Get shadows for current color scheme
 */
export function getShadows(isDark: boolean) {
  return isDark ? shadows.dark : shadows.light;
}

/**
 * Persist color scheme preference to storage
 */
export function saveColorScheme(scheme: ColorScheme, key = 'color-scheme') {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, scheme);
  } catch (error) {
    console.warn('Failed to save color scheme preference:', error);
  }
}

/**
 * Load color scheme preference from storage
 */
export function loadColorScheme(key = 'color-scheme'): ColorScheme | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load color scheme preference:', error);
  }

  return null;
}

/**
 * Listen for system color scheme changes
 */
export function watchSystemColorScheme(
  callback: (scheme: 'light' | 'dark') => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches ? 'dark' : 'light');
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Fallback for older browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * Generate CSS variables from theme
 * Useful for integrating with CSS-in-JS or vanilla CSS
 */
export function generateCSSVariables(theme: Theme, isDark: boolean): Record<string, string> {
  const resolvedColors = getResolvedColors(isDark);
  const themeShadows = getShadows(isDark);

  return {
    // Colors
    '--color-bg-primary': resolvedColors.bg.primary,
    '--color-bg-secondary': resolvedColors.bg.secondary,
    '--color-bg-tertiary': resolvedColors.bg.tertiary,
    '--color-text-primary': resolvedColors.text.primary,
    '--color-text-secondary': resolvedColors.text.secondary,
    '--color-text-tertiary': resolvedColors.text.tertiary,
    '--color-border-default': resolvedColors.border.default,
    '--color-interactive-primary': resolvedColors.interactive.primary,
    '--color-interactive-primary-hover': resolvedColors.interactive.primaryHover,
    '--color-success': resolvedColors.semantic.success,
    '--color-warning': resolvedColors.semantic.warning,
    '--color-error': resolvedColors.semantic.error,
    '--color-info': resolvedColors.semantic.info,

    // Spacing
    '--spacing-xs': theme.spacing.xs,
    '--spacing-sm': theme.spacing.sm,
    '--spacing-md': theme.spacing.md,
    '--spacing-lg': theme.spacing.lg,
    '--spacing-xl': theme.spacing.xl,

    // Radius
    '--radius-sm': theme.radius.sm,
    '--radius-md': theme.radius.md,
    '--radius-lg': theme.radius.lg,
    '--radius-full': theme.radius.full,

    // Shadows
    '--shadow-sm': themeShadows.sm,
    '--shadow-md': themeShadows.md,
    '--shadow-lg': themeShadows.lg,

    // Typography
    '--font-primary': theme.typography.fonts.primary,
    '--font-mono': theme.typography.fonts.mono,

    // Transitions
    '--transition-fast': theme.transition.fade.value,
    '--transition-normal': theme.transition.transform.value,
  };
}
