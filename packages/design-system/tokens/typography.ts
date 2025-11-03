/**
 * Design Tokens: Typography - 2025 Professional Standards
 *
 * Premium type system with optimal readability and hierarchy.
 * Based on research from Linear, Material Design 3, and modern SaaS apps.
 *
 * Key Principles:
 * - Body text: 1.5-1.6x line-height (optimal readability)
 * - Headings: 1.2-1.3x line-height (visual breathing room)
 * - Display: 1.1-1.2x line-height (tight but not cramped)
 * - Negative letter-spacing for large text (optical balance)
 * - Positive letter-spacing for small text (readability)
 */

export const typography = {
  // Font Families
  // Using system fonts for performance and native feel
  fonts: {
    primary: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(', '),

    mono: [
      'JetBrains Mono',
      'SF Mono',
      'Monaco',
      'Inconsolata',
      'Fira Code',
      'Consolas',
      'monospace',
    ].join(', '),
  },

  // Type Scale - 2025 Professional Standards
  // Every size has a purpose and maintains hierarchy
  // Line-heights optimized for readability (not mathematical perfection)
  sizes: {
    // 12px - Captions, labels, timestamps
    // Line-height: 1.5x (18px) - Small text needs MORE breathing room ⭐
    xs: {
      fontSize: '12px',
      lineHeight: '18px',      // Was: 16px (1.33x) → Now: 18px (1.5x) ⭐
      letterSpacing: '0.01em', // Positive for readability at small sizes
    },

    // 14px - Small body text, form labels
    // Line-height: 1.5x (21px) - Comfortable reading ⭐
    sm: {
      fontSize: '14px',
      lineHeight: '21px',      // Was: 20px (1.43x) → Now: 21px (1.5x) ⭐
      letterSpacing: '0.005em',
    },

    // 16px - Default body text (most readable)
    // Line-height: 1.5x (24px) - Perfect for long-form reading ⭐
    base: {
      fontSize: '16px',
      lineHeight: '24px',      // Kept at 1.5x (already good) ⭐
      letterSpacing: '0',
    },

    // 18px - Large body text, important information
    // Line-height: 1.56x (28px) - Slightly more generous ⭐
    lg: {
      fontSize: '18px',
      lineHeight: '28px',      // Kept at 1.56x (already generous) ⭐
      letterSpacing: '-0.005em',
    },

    // 20px - Section headers, card titles
    // Line-height: 1.3x (26px) - Headings need less space ⭐
    xl: {
      fontSize: '20px',
      lineHeight: '26px',      // Was: 28px (1.4x) → Now: 26px (1.3x) ⭐
      letterSpacing: '-0.01em',
    },

    // 24px - Page headers, modal titles
    // Line-height: 1.3x (31px) - Comfortable heading space ⭐
    '2xl': {
      fontSize: '24px',
      lineHeight: '31px',      // Was: 32px (1.33x) → Now: 31px (1.29x) ⭐
      letterSpacing: '-0.015em',
    },

    // 30px - Hero text, landing pages
    // Line-height: 1.2x (36px) - Display needs less but not cramped ⭐
    '3xl': {
      fontSize: '30px',
      lineHeight: '36px',      // Kept at 1.2x (already good for display) ⭐
      letterSpacing: '-0.02em',
    },

    // 36px - Display text, major headings
    // Line-height: 1.2x (43px) - Was way too tight! ⭐
    '4xl': {
      fontSize: '36px',
      lineHeight: '43px',      // Was: 40px (1.11x) → Now: 43px (1.2x) ⭐
      letterSpacing: '-0.025em',
    },

    // 48px - Extra large display
    // Line-height: 1.15x (55px) - Was 1x, way too cramped! ⭐
    '5xl': {
      fontSize: '48px',
      lineHeight: '55px',      // Was: '1' (48px) → Now: 55px (1.15x) ⭐
      letterSpacing: '-0.03em',
    },
  },

  // Font Weights - 2025 Standards
  // Semantic naming for consistent usage
  // Based on Inter font (variable font with precise weights)
  weights: {
    regular: 400,    // Body text, normal content (default readability)
    medium: 500,     // Subtle emphasis, button text, labels
    semibold: 600,   // Strong emphasis, subheadings, important UI text
    bold: 700,       // Headings, call-to-action text, primary emphasis
  },

  // Line Heights (unitless) - 2025 Professional Standards
  // For when you need more control than the preset sizes
  // Updated to match modern readability research (see PROFESSIONAL_UI_DESIGN_GUIDE.md)
  lineHeights: {
    none: 1,         // Display text only (rare, tight headlines)
    tight: 1.2,      // Display text, large headings (was 1.25) ⭐
    snug: 1.3,       // Headings, section titles (was 1.375) ⭐
    normal: 1.5,     // Body text, optimal readability ⭐ (kept - already perfect)
    relaxed: 1.6,    // Long-form reading, articles (was 1.625) ⭐
    loose: 1.75,     // Maximum readability, accessibility (was 2) ⭐
  },

  // Letter Spacing - 2025 Professional Standards
  // Optical adjustments for different sizes
  // Negative spacing for large text, positive for small (see design guide)
  letterSpacing: {
    tighter: '-0.03em',  // Extra large display (48px+)
    tight: '-0.02em',    // Large display (30-48px)
    normal: '0',         // Body text (16-20px) - no adjustment needed
    wide: '0.01em',      // Small text (12-14px) - improves readability
    wider: '0.02em',     // Uppercase text, all-caps labels
    widest: '0.05em',    // Tracking for design effect (rare)
  },
} as const;

export type TypographyToken = typeof typography;

// Preset Text Styles
// Common combinations for quick use
export const textStyles = {
  // Display styles (large, attention-grabbing)
  displayLarge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['5xl'].fontSize,
    lineHeight: typography.sizes['5xl'].lineHeight,
    letterSpacing: typography.sizes['5xl'].letterSpacing,
    fontWeight: typography.weights.bold,
  },

  display: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['4xl'].fontSize,
    lineHeight: typography.sizes['4xl'].lineHeight,
    letterSpacing: typography.sizes['4xl'].letterSpacing,
    fontWeight: typography.weights.bold,
  },

  // Heading styles
  h1: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['3xl'].fontSize,
    lineHeight: typography.sizes['3xl'].lineHeight,
    letterSpacing: typography.sizes['3xl'].letterSpacing,
    fontWeight: typography.weights.bold,
  },

  h2: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'].fontSize,
    lineHeight: typography.sizes['2xl'].lineHeight,
    letterSpacing: typography.sizes['2xl'].letterSpacing,
    fontWeight: typography.weights.bold,
  },

  h3: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl.fontSize,
    lineHeight: typography.sizes.xl.lineHeight,
    letterSpacing: typography.sizes.xl.letterSpacing,
    fontWeight: typography.weights.semibold,
  },

  h4: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg.fontSize,
    lineHeight: typography.sizes.lg.lineHeight,
    letterSpacing: typography.sizes.lg.letterSpacing,
    fontWeight: typography.weights.semibold,
  },

  // Body styles
  bodyLarge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg.fontSize,
    lineHeight: typography.sizes.lg.lineHeight,
    letterSpacing: typography.sizes.lg.letterSpacing,
    fontWeight: typography.weights.regular,
  },

  body: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    letterSpacing: typography.sizes.base.letterSpacing,
    fontWeight: typography.weights.regular,
  },

  bodySmall: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm.fontSize,
    lineHeight: typography.sizes.sm.lineHeight,
    letterSpacing: typography.sizes.sm.letterSpacing,
    fontWeight: typography.weights.regular,
  },

  // Label styles (medium weight)
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    letterSpacing: typography.sizes.base.letterSpacing,
    fontWeight: typography.weights.medium,
  },

  labelSmall: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm.fontSize,
    lineHeight: typography.sizes.sm.lineHeight,
    letterSpacing: typography.sizes.sm.letterSpacing,
    fontWeight: typography.weights.medium,
  },

  // Caption styles (small, secondary)
  caption: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs.fontSize,
    lineHeight: typography.sizes.xs.lineHeight,
    letterSpacing: typography.sizes.xs.letterSpacing,
    fontWeight: typography.weights.regular,
  },

  captionBold: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs.fontSize,
    lineHeight: typography.sizes.xs.lineHeight,
    letterSpacing: typography.sizes.xs.letterSpacing,
    fontWeight: typography.weights.semibold,
  },

  // Button styles
  button: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base.fontSize,
    lineHeight: typography.sizes.base.lineHeight,
    letterSpacing: '0.01em',
    fontWeight: typography.weights.semibold,
  },

  buttonSmall: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm.fontSize,
    lineHeight: typography.sizes.sm.lineHeight,
    letterSpacing: '0.01em',
    fontWeight: typography.weights.semibold,
  },

  buttonLarge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg.fontSize,
    lineHeight: typography.sizes.lg.lineHeight,
    letterSpacing: '0.01em',
    fontWeight: typography.weights.semibold,
  },

  // Code/monospace styles
  code: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm.fontSize,
    lineHeight: typography.sizes.sm.lineHeight,
    letterSpacing: '0',
    fontWeight: typography.weights.regular,
  },
} as const;

export type TextStyle = keyof typeof textStyles;

/**
 * Design Philosophy - Typography (2025 Professional Standards)
 *
 * This typography system is based on extensive research documented in
 * docs/PROFESSIONAL_UI_DESIGN_GUIDE.md. Key findings and principles:
 *
 * 1. Line-Height Science (Cognitive Psychology)
 *    - Body text (16-18px): 1.5-1.6x line-height is OPTIMAL
 *      • Research shows 150-160% maximizes reading speed and comprehension
 *      • Below 1.4x = cramped, amateur, hard to read
 *      • Above 1.7x = disconnected, hard to follow lines
 *    - Headings (20-30px): 1.2-1.3x line-height
 *      • Tighter for visual hierarchy, but not cramped
 *      • Creates clear distinction from body text
 *    - Display (36-48px+): 1.1-1.2x line-height
 *      • Can be tighter, but NEVER 1x (too cramped)
 *      • Old value of '1' for 5xl was unprofessional
 *    - Small text (12-14px): 1.5x line-height
 *      • Counterintuitively needs MORE space, not less
 *      • Improves readability at small sizes
 *
 * 2. Letter-Spacing (Optical Adjustments)
 *    - Large text (30px+): Negative spacing (-0.02em to -0.03em)
 *      • Prevents text from feeling "spread out"
 *      • Maintains visual cohesion at large sizes
 *    - Small text (12-14px): Positive spacing (+0.01em)
 *      • Improves readability by giving letters breathing room
 *      • Critical for accessibility
 *    - Body text (16-20px): No adjustment (0)
 *      • Natural spacing is already optimal
 *
 * 3. Why This Matters (Amateur vs Professional)
 *    AMATEUR MISTAKES:
 *    - Line-height: 1.2 for body text (too tight, hard to read)
 *    - Line-height: 1 for display text (cramped, cheap-looking)
 *    - Inconsistent spacing across text sizes
 *    - No optical letter-spacing adjustments
 *
 *    PROFESSIONAL APPROACH:
 *    - Body text: 1.5-1.6x (optimal readability, expensive feel)
 *    - Display text: 1.15-1.2x (tight but not cramped)
 *    - Systematic approach to hierarchy
 *    - Optical adjustments for different sizes
 *
 * 4. Inter Font (Variable Font)
 *    - Modern SaaS standard (Linear, Vercel, Stripe all use it)
 *    - Variable font with precise weight control
 *    - Optical size adjustments built-in
 *    - Excellent readability at all sizes
 *    - Fallback to system fonts for performance
 *
 * 5. Font Weight Strategy
 *    - Regular (400): Body text, default
 *    - Medium (500): Buttons, labels, subtle emphasis
 *    - Semibold (600): Subheadings, strong emphasis
 *    - Bold (700): Headings only (don't overuse)
 *    - Avoid light weights (300) for body text (poor contrast)
 *
 * 6. Type Scale Ratios
 *    - Based on modular scale (1.2 ratio)
 *    - 12, 14, 16, 18, 20, 24, 30, 36, 48
 *    - Avoids arbitrary sizes (13px, 15px, 17px)
 *    - Creates clear visual hierarchy
 *    - Aligns with 8px grid system
 *
 * 7. Accessibility Considerations
 *    - Minimum body text: 16px (WCAG recommendation)
 *    - Never below 14px for critical content
 *    - 12px only for secondary info (timestamps, captions)
 *    - Line-height aids dyslexic users (1.5x minimum)
 *    - Sufficient letter-spacing for small text
 *
 * 8. Performance Optimizations
 *    - System font fallbacks (-apple-system, etc.)
 *    - Load only weights we use (400, 500, 600, 700)
 *    - Variable fonts reduce file size
 *    - Font-display: swap for fast rendering
 *
 * Usage Examples:
 *
 * ```tsx
 * // Heading (tight line-height, negative spacing)
 * <h1 style={{
 *   fontSize: typography.sizes['4xl'].fontSize,     // 36px
 *   lineHeight: typography.sizes['4xl'].lineHeight, // 43px (1.2x) ⭐
 *   letterSpacing: typography.sizes['4xl'].letterSpacing, // -0.025em
 *   fontWeight: typography.weights.bold,
 * }}>
 *   Professional Headline
 * </h1>
 *
 * // Body text (optimal readability)
 * <p style={{
 *   fontSize: typography.sizes.base.fontSize,       // 16px
 *   lineHeight: typography.sizes.base.lineHeight,   // 24px (1.5x) ⭐
 *   letterSpacing: typography.sizes.base.letterSpacing, // 0
 *   fontWeight: typography.weights.regular,
 * }}>
 *   This paragraph has optimal readability with 1.5x line-height.
 *   Research shows this is the sweet spot for reading speed and
 *   comprehension. Notice how comfortable it feels to read.
 * </p>
 *
 * // Small text (needs MORE space, not less)
 * <span style={{
 *   fontSize: typography.sizes.xs.fontSize,         // 12px
 *   lineHeight: typography.sizes.xs.lineHeight,     // 18px (1.5x) ⭐
 *   letterSpacing: typography.sizes.xs.letterSpacing, // +0.01em
 *   fontWeight: typography.weights.regular,
 * }}>
 *   Posted 2 hours ago
 * </span>
 *
 * // Using preset text styles (recommended)
 * <h2 style={textStyles.h2}>Page Header</h2>
 * <p style={textStyles.body}>Body content with perfect readability</p>
 * <button style={textStyles.button}>Click Me</button>
 * ```
 *
 * WRONG (amateur, cramped):
 * ```tsx
 * // ❌ Line-height too tight for body text
 * fontSize: '16px',
 * lineHeight: '20px', // 1.25x - TOO TIGHT
 *
 * // ❌ Display text at line-height 1 (cramped)
 * fontSize: '48px',
 * lineHeight: '1', // Looks cheap and cramped
 *
 * // ❌ No letter-spacing adjustments
 * fontSize: '48px',
 * letterSpacing: '0', // Should be negative
 * ```
 *
 * RIGHT (professional, readable):
 * ```tsx
 * // ✅ Optimal body text line-height
 * fontSize: '16px',
 * lineHeight: '24px', // 1.5x - PERFECT ⭐
 *
 * // ✅ Display text with breathing room
 * fontSize: '48px',
 * lineHeight: '55px', // 1.15x - Professional ⭐
 *
 * // ✅ Optical letter-spacing
 * fontSize: '48px',
 * letterSpacing: '-0.03em', // Tightens large text ⭐
 * ```
 *
 * Research Sources (see PROFESSIONAL_UI_DESIGN_GUIDE.md):
 * - Linear Design System (2025)
 * - Material Design 3 Typography
 * - Vercel/shadcn/ui Typography System
 * - "Butterick's Practical Typography" (Matthew Butterick)
 * - WCAG 2.1 Readability Guidelines
 * - "The Elements of Typographic Style" (Robert Bringhurst)
 */
