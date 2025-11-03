/**
 * Design Tokens: Colors - 2025 Professional Standards
 *
 * OKLCH Color Space for perceptual uniformity
 * Saturated grays (no pure black/white)
 * Eliminated medium grays (400-600 range)
 *
 * Based on research from Linear, Material Design 3, and modern design systems
 */

export const colors = {
  // Brand Colors - Primary (Blue)
  // OKLCH ensures perceptually uniform brightness across all shades
  primary: {
    50: 'oklch(97% 0.025 230)',   // Lightest tint - hover backgrounds
    100: 'oklch(93% 0.045 230)',  // Very light - selected states
    200: 'oklch(85% 0.070 230)',  // Light - subtle accents
    300: 'oklch(70% 0.100 230)',  // Medium light
    400: 'oklch(62% 0.125 230)',  // Medium (added for compatibility) ⭐
    500: 'oklch(55% 0.150 230)',  // Main brand color ⭐
    600: 'oklch(48% 0.140 230)',  // Medium dark (added for compatibility) ⭐
    700: 'oklch(42% 0.130 230)',  // Dark - active states
    800: 'oklch(32% 0.110 230)',  // Very dark
    900: 'oklch(25% 0.090 230)',  // Darkest - maximum contrast
  },

  // Accent Colors - Green (Success/Positive)
  accent: {
    50: 'oklch(97% 0.020 145)',
    100: 'oklch(93% 0.045 145)',
    200: 'oklch(85% 0.085 145)',
    300: 'oklch(75% 0.130 145)',
    400: 'oklch(67% 0.150 145)',  // Medium (added for compatibility) ⭐
    500: 'oklch(60% 0.170 145)',  // Main success color ⭐
    600: 'oklch(52% 0.155 145)',  // Medium dark (added for compatibility) ⭐
    700: 'oklch(45% 0.140 145)',
    800: 'oklch(35% 0.110 145)',
    900: 'oklch(28% 0.085 145)',
  },

  // Warning Colors - Amber
  warning: {
    50: 'oklch(97% 0.015 85)',
    100: 'oklch(93% 0.040 85)',
    200: 'oklch(87% 0.080 85)',
    300: 'oklch(78% 0.125 85)',
    400: 'oklch(73% 0.145 85)',   // Medium (added for compatibility) ⭐
    500: 'oklch(68% 0.165 85)',   // Main warning color ⭐
    600: 'oklch(59% 0.152 85)',   // Medium dark (added for compatibility) ⭐
    700: 'oklch(50% 0.140 85)',
    800: 'oklch(40% 0.110 85)',
    900: 'oklch(32% 0.085 85)',
  },

  // Error Colors - Red
  error: {
    50: 'oklch(97% 0.015 25)',
    100: 'oklch(93% 0.040 25)',
    200: 'oklch(87% 0.075 25)',
    300: 'oklch(77% 0.120 25)',
    400: 'oklch(68% 0.152 25)',   // Medium (added for compatibility) ⭐
    500: 'oklch(60% 0.185 25)',   // Main error color ⭐
    600: 'oklch(53% 0.172 25)',   // Medium dark (added for compatibility) ⭐
    700: 'oklch(47% 0.160 25)',
    800: 'oklch(38% 0.130 25)',
    900: 'oklch(30% 0.105 25)',
  },

  // Info Colors - Blue (lighter than primary)
  info: {
    50: 'oklch(97% 0.020 250)',
    100: 'oklch(93% 0.042 250)',
    200: 'oklch(86% 0.070 250)',
    300: 'oklch(73% 0.105 250)',
    400: 'oklch(65% 0.125 250)',  // Medium (added for compatibility) ⭐
    500: 'oklch(58% 0.145 250)',  // Main info color ⭐
    600: 'oklch(51% 0.135 250)',  // Medium dark (added for compatibility) ⭐
    700: 'oklch(44% 0.125 250)',
    800: 'oklch(35% 0.100 250)',
    900: 'oklch(28% 0.080 250)',
  },

  // Neutral Colors - SATURATED GRAYS (Light Mode)
  // Slight cool tint (270° = blue-ish) for sophistication
  gray: {
    0: 'oklch(100% 0 0)',        // Pure white (special case, rarely used)
    50: 'oklch(98% 0.005 270)',  // Off white - subtle backgrounds (was #fafafa)
    100: 'oklch(96% 0.008 270)', // Very light - hover backgrounds (was #f5f5f5)
    200: 'oklch(88% 0.010 270)', // Light - borders (was #e5e5e5)
    300: 'oklch(75% 0.012 270)', // Medium light - disabled (was #d4d4d4)
    400: 'oklch(62% 0.013 270)', // Medium (added for compatibility) ⭐
    500: 'oklch(52% 0.014 270)', // Medium (added for compatibility) ⭐
    600: 'oklch(48% 0.014 270)', // Medium dark (added for compatibility) ⭐
    700: 'oklch(45% 0.015 270)', // Dark - body text (was #525252)
    800: 'oklch(30% 0.018 270)', // Very dark - headings (was #262626)
    900: 'oklch(20% 0.020 270)', // Nearly black - max contrast (was #171717)
    1000: 'oklch(10% 0.01 270)', // Rich black (was #000000) - slight cool tint
  },

  // Dark Mode Background Colors
  // Saturated with slight warm tint for comfortable viewing
  dark: {
    bg: {
      primary: 'oklch(10% 0.010 270)',    // Main background (was #0a0a0a)
      secondary: 'oklch(15% 0.012 270)',  // Card backgrounds (was #171717)
      tertiary: 'oklch(20% 0.015 270)',   // Elevated elements (was #262626)
      quaternary: 'oklch(30% 0.018 270)', // Highest elevation (was #404040)
      // New: Subtle hover states
      hover: 'oklch(18% 0.012 270)',
      active: 'oklch(22% 0.015 270)',
    },
    border: {
      subtle: 'oklch(20% 0.015 270)',     // Very subtle (was #262626)
      default: 'oklch(30% 0.018 270)',    // Standard (was #404040)
      emphasis: 'oklch(45% 0.020 270)',   // Emphasized (was #525252)
    },
    text: {
      primary: 'oklch(98% 0.005 270)',    // Main text (was #fafafa)
      secondary: 'oklch(75% 0.012 270)',  // Secondary text (was #d4d4d4)
      tertiary: 'oklch(60% 0.015 270)',   // Tertiary text (was #a3a3a3)
      disabled: 'oklch(45% 0.015 270)',   // Disabled (was #737373)
      // Eliminated: Medium gray range for better hierarchy
    },
    surface: {
      // MD3-style elevation tints
      base: 'oklch(10% 0.010 270)',
      hover: 'oklch(13% 0.011 270)',
      elevated: 'oklch(15% 0.012 270)',
    },
  },

  // Semantic Task Colors (converted to OKLCH)
  // Priority levels - perceptually balanced
  priority: {
    1: 'oklch(60% 0.185 25)',   // Urgent - red
    2: 'oklch(65% 0.170 45)',   // High - orange
    3: 'oklch(58% 0.145 250)',  // Medium - blue
    4: 'oklch(55% 0.135 290)',  // Low - purple
    5: 'oklch(55% 0.020 270)',  // Very Low - gray (subtle color)
  },

  // Status Colors (OKLCH with better contrast)
  status: {
    proposed: {
      bg: 'oklch(93% 0.040 85)',       // Light amber
      text: 'oklch(32% 0.085 85)',     // Dark amber (WCAG AAA)
      border: 'oklch(87% 0.080 85)',   // Medium amber
    },
    accepted: {
      bg: 'oklch(93% 0.045 145)',      // Light green
      text: 'oklch(28% 0.085 145)',    // Dark green (WCAG AAA)
      border: 'oklch(85% 0.085 145)',  // Medium green
    },
    declined: {
      bg: 'oklch(93% 0.040 25)',       // Light red
      text: 'oklch(30% 0.105 25)',     // Dark red (WCAG AAA)
      border: 'oklch(87% 0.075 25)',   // Medium red
    },
    completed: {
      bg: 'oklch(93% 0.042 250)',      // Light indigo
      text: 'oklch(30% 0.095 250)',    // Dark indigo (WCAG AAA)
      border: 'oklch(86% 0.070 250)',  // Medium indigo
    },
    snoozed: {
      bg: 'oklch(95% 0.035 290)',      // Light purple
      text: 'oklch(32% 0.100 290)',    // Dark purple (WCAG AAA)
      border: 'oklch(88% 0.065 290)',  // Medium purple
    },
  },

  // Overlay Colors (enhanced with OKLCH)
  overlay: {
    light: 'oklch(0% 0 0 / 0.5)',         // Standard overlay
    medium: 'oklch(0% 0 0 / 0.65)',       // Emphasized overlay
    dark: 'oklch(0% 0 0 / 0.8)',          // Strong overlay
    blur: 'oklch(100% 0 0 / 0.7)',        // Frosted glass (light mode)
    blurDark: 'oklch(10% 0.01 270 / 0.7)', // Frosted glass (dark mode, saturated)
  },

  // Surface colors for elevation (Material Design 3 inspired)
  // Using color tints instead of just shadows
  surface: {
    light: {
      base: 'oklch(100% 0 0)',          // Base surface
      level1: 'oklch(98% 0.005 270)',   // Elevated +1
      level2: 'oklch(96% 0.008 270)',   // Elevated +2
      level3: 'oklch(94% 0.010 270)',   // Elevated +3
    },
    dark: {
      base: 'oklch(10% 0.010 270)',     // Base surface
      level1: 'oklch(13% 0.011 270)',   // Elevated +1 (5% tint)
      level2: 'oklch(15% 0.012 270)',   // Elevated +2 (8% tint)
      level3: 'oklch(18% 0.013 270)',   // Elevated +3 (11% tint)
    },
  },
} as const;

/**
 * Helper: Get RGB values from OKLCH for use in rgba() contexts
 *
 * Note: This is a placeholder. In production, you'd use a library
 * like culori or implement proper OKLCH → RGB conversion.
 * Modern browsers handle oklch() natively in most contexts.
 */
export const rgbValues = {
  primary: '14, 165, 233',      // Approximation of primary-500
  accent: '34, 197, 94',        // Approximation of accent-500
  warning: '245, 158, 11',      // Approximation of warning-500
  error: '239, 68, 68',         // Approximation of error-500
  info: '59, 130, 246',         // Approximation of info-500
} as const;

/**
 * Design Philosophy:
 *
 * 1. OKLCH Color Space
 *    - Perceptually uniform (all shades appear evenly bright)
 *    - Better gradients (no unexpected lightness jumps)
 *    - Easier accessibility (predictable contrast)
 *
 * 2. Saturated Grays
 *    - No pure #000000 or #FFFFFF (harsh, sterile)
 *    - Slight color tint (270° = cool blue) for sophistication
 *    - Feels warmer, more premium
 *
 * 3. Eliminated Medium Grays (400-600)
 *    - Creates "wireframey" amateur look
 *    - Jump from 300 → 700 forces better hierarchy
 *    - Decisions become more intentional
 *
 * 4. Accessibility First
 *    - All text colors meet WCAG AA minimum (4.5:1)
 *    - Status colors meet AAA where possible (7:1)
 *    - Dark mode has higher contrast
 *
 * 5. Elevation Through Color + Shadow
 *    - Material Design 3 approach
 *    - Subtle tints instead of heavy shadows
 *    - Modern, sophisticated depth
 */

export type ColorToken = typeof colors;
export type ColorKey = keyof typeof colors;
