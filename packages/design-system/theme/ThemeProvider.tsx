/**
 * Theme Provider
 *
 * React context provider for theme management.
 * Supports light/dark modes with auto detection and persistence.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  ColorScheme,
  Theme,
  ThemeConfig,
  ThemeContextValue,
  ResolvedColors,
} from './types';
import {
  createTheme,
  getResolvedColors,
  resolveColorScheme,
  saveColorScheme,
  loadColorScheme,
  watchSystemColorScheme,
} from './utils';

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Default theme configuration
 */
const defaultConfig: Required<ThemeConfig> = {
  colorScheme: 'auto',
  persistPreference: true,
  storageKey: 'todaypool-color-scheme',
};

/**
 * Theme Provider Component
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  config?: ThemeConfig;
}

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };

  // Load initial color scheme from storage or use default
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (mergedConfig.persistPreference) {
      const stored = loadColorScheme(mergedConfig.storageKey);
      if (stored) return stored;
    }
    return mergedConfig.colorScheme;
  });

  // Resolve actual color scheme (handles 'auto')
  const [resolvedScheme, setResolvedScheme] = useState<'light' | 'dark'>(() =>
    resolveColorScheme(colorScheme)
  );

  // Watch for system color scheme changes when in 'auto' mode
  useEffect(() => {
    if (colorScheme !== 'auto') return;

    const unwatch = watchSystemColorScheme((systemScheme) => {
      setResolvedScheme(systemScheme);
    });

    return unwatch;
  }, [colorScheme]);

  // Update resolved scheme when color scheme changes
  useEffect(() => {
    setResolvedScheme(resolveColorScheme(colorScheme));
  }, [colorScheme]);

  // Create theme object
  const theme = createTheme(colorScheme);
  const isDark = resolvedScheme === 'dark';
  const resolvedColors = getResolvedColors(isDark);

  // Set color scheme with optional persistence
  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);

    if (mergedConfig.persistPreference) {
      saveColorScheme(scheme, mergedConfig.storageKey);
    }
  };

  // Toggle between light and dark (skips 'auto')
  const toggleColorScheme = () => {
    const newScheme = resolvedScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
  };

  // Update document class for global styling
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Also set color-scheme for native browser elements
    root.style.colorScheme = resolvedScheme;
  }, [isDark, resolvedScheme]);

  const contextValue: ThemeContextValue = {
    theme,
    colorScheme,
    isDark,
    setColorScheme,
    toggleColorScheme,
    resolvedColors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to get current color scheme
 */
export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme, isDark } = useTheme();

  return {
    colorScheme,
    setColorScheme,
    toggleColorScheme,
    isDark,
  };
}

/**
 * Hook to get resolved colors
 */
export function useColors() {
  const { resolvedColors } = useTheme();
  return resolvedColors;
}

/**
 * Hook to access specific design tokens
 */
export function useDesignTokens() {
  const { theme } = useTheme();

  return {
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    radius: theme.radius,
    shadows: theme.shadows,
    elevation: theme.elevation,
    animation: theme.animation,
    transition: theme.transition,
  };
}
