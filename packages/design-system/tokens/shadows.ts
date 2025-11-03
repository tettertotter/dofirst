/**
 * Design Tokens: Shadows - 2025 Professional Standards
 *
 * Material Design 3 Dual-Shadow System
 * - Combines sharp shadow + soft blur
 * - Subtle color tints for elevation
 * - Modern, sophisticated depth
 *
 * Based on Material Design 3 elevation system
 */

export const shadows = {
  // Light Mode Shadows
  // Dual-shadow technique: [sharp shadow], [soft blur]
  light: {
    // No shadow - flat on surface
    none: 'none',

    // xs - Minimal depth
    // Use for: Subtle separation, hover hints
    // Format: Sharp (key light) + Soft (ambient)
    xs: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',

    // sm - Small elevation (buttons, inputs)
    // Use for: Buttons (resting), small cards, input fields
    sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 1px rgba(0, 0, 0, 0.05)',

    // md - Medium elevation (cards, dropdowns)
    // Use for: Cards, raised panels, dropdown menus
    md: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 2px 6px 0px rgba(0, 0, 0, 0.10)',

    // lg - Large elevation (modals, popovers)
    // Use for: Modals, large popovers, floating panels
    lg: '0px 1px 3px 0px rgba(0, 0, 0, 0.08), 0px 4px 8px 3px rgba(0, 0, 0, 0.12)',

    // xl - Extra large elevation (dialogs)
    // Use for: Dialogs, major overlays, command palettes
    xl: '0px 2px 4px 0px rgba(0, 0, 0, 0.10), 0px 8px 16px 0px rgba(0, 0, 0, 0.15)',

    // 2xl - Maximum elevation (full-screen overlays)
    // Use for: Full-screen modals, critical overlays
    '2xl': '0px 4px 6px 0px rgba(0, 0, 0, 0.12), 0px 16px 24px 0px rgba(0, 0, 0, 0.18)',
  },

  // Dark Mode Shadows
  // Stronger opacity needed for visibility on dark backgrounds
  dark: {
    none: 'none',

    // Higher opacity for dark mode (need more contrast)
    xs: '0px 1px 2px 0px rgba(0, 0, 0, 0.20)',

    sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',

    md: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',

    lg: '0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',

    xl: '0px 2px 4px 0px rgba(0, 0, 0, 0.30), 0px 8px 16px 0px rgba(0, 0, 0, 0.15)',

    '2xl': '0px 4px 6px 0px rgba(0, 0, 0, 0.35), 0px 16px 24px 0px rgba(0, 0, 0, 0.20)',
  },

  // Elevation Tints (Material Design 3 Innovation)
  // Use color overlays instead of just shadows for subtle depth
  // Apply these as background-image or overlay on elevated surfaces
  elevationTint: {
    light: {
      // Light mode uses subtle primary color tints
      level0: 'transparent',                              // Base surface
      level1: 'linear-gradient(rgba(14, 165, 233, 0.05), rgba(14, 165, 233, 0.05))', // 5% tint
      level2: 'linear-gradient(rgba(14, 165, 233, 0.08), rgba(14, 165, 233, 0.08))', // 8% tint
      level3: 'linear-gradient(rgba(14, 165, 233, 0.11), rgba(14, 165, 233, 0.11))', // 11% tint
      level4: 'linear-gradient(rgba(14, 165, 233, 0.12), rgba(14, 165, 233, 0.12))', // 12% tint
      level5: 'linear-gradient(rgba(14, 165, 233, 0.14), rgba(14, 165, 233, 0.14))', // 14% tint
    },
    dark: {
      // Dark mode uses lighter overlays (white tint)
      level0: 'transparent',                              // Base surface
      level1: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
      level2: 'linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))',
      level3: 'linear-gradient(rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.11))',
      level4: 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
      level5: 'linear-gradient(rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.14))',
    },
  },

  // Focus Rings (Accessibility - :focus-visible)
  // Meets WCAG 2.1 SC 2.4.7 (minimum 3px, 3:1 contrast)
  focus: {
    // Default focus ring (primary color)
    // Use with :focus-visible (keyboard only)
    default: {
      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.25)',
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },

    // Error focus ring
    error: {
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.25)',
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },

    // Success focus ring
    success: {
      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },

    // Warning focus ring
    warning: {
      boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.25)',
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },

    // Inverse focus ring (for dark backgrounds)
    inverse: {
      boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.25)',
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },
  },

  // Colored Glows (Subtle interaction feedback)
  // Use sparingly for hover states or success confirmations
  glow: {
    // Primary brand glow
    primary: {
      subtle: '0 0 8px rgba(14, 165, 233, 0.15)',
      medium: '0 0 16px rgba(14, 165, 233, 0.25)',
      strong: '0 0 24px rgba(14, 165, 233, 0.35)',
    },

    // Success glow
    success: {
      subtle: '0 0 8px rgba(34, 197, 94, 0.15)',
      medium: '0 0 16px rgba(34, 197, 94, 0.25)',
      strong: '0 0 24px rgba(34, 197, 94, 0.35)',
    },

    // Warning glow
    warning: {
      subtle: '0 0 8px rgba(245, 158, 11, 0.15)',
      medium: '0 0 16px rgba(245, 158, 11, 0.25)',
      strong: '0 0 24px rgba(245, 158, 11, 0.35)',
    },

    // Error glow
    error: {
      subtle: '0 0 8px rgba(239, 68, 68, 0.15)',
      medium: '0 0 16px rgba(239, 68, 68, 0.25)',
      strong: '0 0 24px rgba(239, 68, 68, 0.35)',
    },
  },

  // Inner Shadows (Inset/pressed effects)
  // For input fields, pressed buttons, recessed elements
  inner: {
    // Subtle inset (input fields)
    sm: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',

    // Medium inset (active states)
    md: 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',

    // Strong inset (pressed buttons)
    lg: 'inset 0 2px 6px rgba(0, 0, 0, 0.12)',
  },
} as const;

export type ShadowToken = typeof shadows;

/**
 * Semantic Elevation Scale
 * Use these names for clarity in components
 */
export const elevation = {
  // Level 0: Flat on surface (z=0)
  // Use for: Base surface, no elevation
  flat: {
    light: shadows.light.none,
    dark: shadows.dark.none,
  },

  // Level 1: Slightly raised (z=1)
  // Use for: Buttons (resting), input fields
  raised: {
    light: shadows.light.sm,
    dark: shadows.dark.sm,
  },

  // Level 2: Floating above (z=2)
  // Use for: Cards, panels, sections
  floating: {
    light: shadows.light.md,
    dark: shadows.dark.md,
  },

  // Level 3: Overlay (z=3)
  // Use for: Dropdowns, tooltips, menus
  overlay: {
    light: shadows.light.lg,
    dark: shadows.dark.lg,
  },

  // Level 4: Modal (z=4)
  // Use for: Dialogs, drawers, sheets
  modal: {
    light: shadows.light.xl,
    dark: shadows.dark.xl,
  },

  // Level 5: Top (z=5)
  // Use for: Command palette, full-screen overlays
  top: {
    light: shadows.light['2xl'],
    dark: shadows.dark['2xl'],
  },
} as const;

export type ElevationToken = typeof elevation;

/**
 * Design Philosophy - Shadows
 *
 * 1. Dual-Shadow System (Material Design 3)
 *    - Sharp shadow (key light from above)
 *    - Soft blur (ambient light diffusion)
 *    - More realistic, sophisticated look
 *
 * 2. Subtlety is Key
 *    - Shadows should barely be noticed
 *    - Heavy shadows = amateur look
 *    - Subtle shadows = professional, expensive
 *
 * 3. Dark Mode Considerations
 *    - Higher opacity (more contrast needed)
 *    - Still subtle, just stronger
 *    - Example: light mode 0.06 → dark mode 0.30
 *
 * 4. Elevation Through Color (MD3)
 *    - Add subtle color tints for depth
 *    - 5-14% opacity overlays
 *    - Creates depth without heavy shadows
 *
 * 5. Focus Rings (Accessibility)
 *    - Use :focus-visible (keyboard only)
 *    - Minimum 3px width (WCAG requirement)
 *    - 3:1 contrast ratio minimum
 *    - Never remove focus without replacement
 *
 * Usage Example:
 *
 * ```tsx
 * // Button with elevation
 * <button style={{
 *   boxShadow: shadows.light.sm,
 *   backgroundImage: shadows.elevationTint.light.level1,
 * }}>
 *   Click me
 * </button>
 *
 * // Card with floating elevation
 * <div style={{
 *   boxShadow: isDark ? shadows.dark.md : shadows.light.md,
 *   backgroundImage: isDark
 *     ? shadows.elevationTint.dark.level2
 *     : shadows.elevationTint.light.level2,
 * }}>
 *   Card content
 * </div>
 *
 * // Button with focus-visible
 * <button css={css`
 *   &:focus-visible {
 *     box-shadow: ${shadows.focus.default.boxShadow};
 *     outline: ${shadows.focus.default.outline};
 *     outline-offset: ${shadows.focus.default.outlineOffset};
 *   }
 * `}>
 *   Accessible button
 * </button>
 * ```
 */
