/**
 * Theme System Types
 *
 * Type-safe theme configuration and color scheme management.
 */

import type { ColorToken } from '../tokens/colors';
import type { TypographyToken } from '../tokens/typography';
import type { SpacingToken, ZIndexToken } from '../tokens/spacing';
import type { ShadowToken, ElevationToken } from '../tokens/shadows';
import type { RadiusToken, ComponentRadiusToken } from '../tokens/radius';
import type {
  DurationToken,
  EasingToken,
  TransitionToken,
  AnimationToken,
} from '../tokens/animations';

/**
 * Color Scheme Options
 */
export type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * Complete Theme Interface
 * All design tokens organized for easy access
 */
export interface Theme {
  // Color scheme
  colorScheme: ColorScheme;
  isDark: boolean;

  // Design tokens
  colors: ColorToken;
  typography: TypographyToken;
  spacing: SpacingToken;
  zIndex: ZIndexToken;
  shadows: ShadowToken;
  elevation: ElevationToken;
  radius: RadiusToken;
  componentRadius: ComponentRadiusToken;
  duration: DurationToken;
  easing: EasingToken;
  transition: TransitionToken;
  animation: AnimationToken;
}

/**
 * Resolved Theme Colors
 * Actual color values based on current color scheme
 */
export interface ResolvedColors {
  // Background colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
  };

  // Border colors
  border: {
    subtle: string;
    default: string;
    emphasis: string;
  };

  // Interactive colors
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
  };

  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Surface colors (for cards, panels)
  surface: {
    default: string;
    hover: string;
    active: string;
    disabled: string;
  };
}

/**
 * Theme Configuration Options
 */
export interface ThemeConfig {
  colorScheme?: ColorScheme;
  persistPreference?: boolean;
  storageKey?: string;
}

/**
 * Theme Context Value
 */
export interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  resolvedColors: ResolvedColors;
}
