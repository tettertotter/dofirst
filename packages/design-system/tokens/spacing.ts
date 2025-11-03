/**
 * Design Tokens: Spacing - 2025 Professional Standards
 *
 * GENEROUS SPACING = Professional
 * Rule: "Double your whitespace" - most common amateur mistake is cramped spacing
 *
 * Based on Tailwind CSS scale (4px base) with increased component defaults
 */

export const spacing = {
  // Base spacing scale (4px base unit - industry standard)
  0: '0px',       // No spacing
  px: '1px',      // Single pixel (borders)
  0.5: '2px',     // Hairline
  1: '4px',       // Minimal
  1.5: '6px',     // Subtle
  2: '8px',       // Base unit
  2.5: '10px',    // Between states
  3: '12px',      // Compact
  3.5: '14px',    // Slightly larger
  4: '16px',      // Comfortable - MINIMUM for component gaps
  5: '20px',      // Generous
  6: '24px',      // Section spacing - PREFER THIS for gaps
  7: '28px',      // Between sections
  8: '32px',      // Large spacing - DEFAULT for card padding
  9: '36px',      // Very spacious
  10: '40px',     // Extra large
  11: '44px',     // Generous section
  12: '48px',     // Major sections
  14: '56px',     // Very large sections
  16: '64px',     // Hero sections
  20: '80px',     // Extra spacious
  24: '96px',     // Maximum spacing
  28: '112px',    // Hero sections
  32: '128px',    // Extra large hero
  36: '144px',    // Massive spacing
  40: '160px',    // Architectural spacing
  48: '192px',    // Extra architectural

  // Semantic spacing (optimized for readability)
  hairline: '1px',      // Borders, dividers (only)
  xxs: '8px',           // Tight groups - INCREASED from 4px
  xs: '12px',           // Small spacing - INCREASED from 8px
  sm: '16px',           // Comfortable - INCREASED from 12px
  md: '24px',           // Section spacing - INCREASED from 16px (NEW DEFAULT)
  lg: '32px',           // Large sections - INCREASED from 24px
  xl: '48px',           // Extra large - INCREASED from 32px
  '2xl': '64px',        // Very large - INCREASED from 48px
  '3xl': '96px',        // Hero spacing - INCREASED from 64px
  '4xl': '128px',       // Architectural - INCREASED from 96px

  // Component-specific spacing (DOUBLED for professional feel)
  component: {
    // Button padding - feels spacious and clickable
    button: {
      // Desktop sizes (unchanged)
      sm: '8px 16px',      // Small (was 8px 12px) - INCREASED
      md: '12px 24px',     // Medium/Default (was 12px 16px) - INCREASED 50%
      lg: '16px 32px',     // Large (was 16px 20px) - DOUBLED
      // Mobile sizes - meet 44x44px minimum touch target (Apple/Android)
      mobile: {
        sm: '15px 20px',   // 44px height minimum (15px + 15px + 14px font = 44px)
        md: '14px 24px',   // 46px height minimum (14px + 14px + 16px font = 44px+)
        lg: '16px 32px',   // 50px height (same as desktop lg - already passes)
      },
      icon: {
        sm: '8px',         // Icon-only small
        md: '12px',        // Icon-only medium
        lg: '16px',        // Icon-only large
        // Mobile icon button sizes (square for 44x44px minimum)
        mobile: {
          sm: '15px',      // 44px square (15px + 15px + 14px icon = 44px)
          md: '14px',      // 44px square (14px + 14px + 16px icon = 44px)
          lg: '16px',      // 48px square (same as desktop)
        },
      },
    },

    // Input padding - needs breathing room
    input: {
      sm: '8px 12px',      // Small inputs
      md: '12px 16px',     // Default (was 8px 12px) - INCREASED 50%
      lg: '16px 20px',     // Large inputs
      withIcon: '12px 40px 12px 16px', // With icon on right
    },

    // Card padding - generous is premium
    card: {
      xs: '12px',          // Tight cards (rare)
      sm: '16px',          // Small cards (was 12px)
      md: '24px',          // Default (was 16px) - INCREASED 50% ⭐
      lg: '32px',          // Large cards (was 20px) - INCREASED 60% ⭐
      xl: '40px',          // Hero cards (was 24px) - DOUBLED ⭐
      '2xl': '48px',       // Maximum padding
    },

    // Modal/Dialog padding
    modal: {
      sm: '20px',          // Small modals
      md: '24px',          // Default modals
      lg: '32px',          // Large modals (NEW)
      header: '24px',      // Modal header
      footer: '20px',      // Modal footer
    },

    // List/Menu items - vertical rhythm
    list: {
      itemPadding: '12px 16px',   // List item (was 8px 12px) - INCREASED
      itemGap: '4px',              // Gap between items (tight)
      sectionGap: '16px',          // Gap between sections
    },

    // Gap between UI elements
    gap: {
      xs: '8px',           // Tight (related items) - INCREASED from 4px
      sm: '12px',          // Small gap - INCREASED from 8px
      md: '16px',          // Default gap - INCREASED from 12px ⭐
      lg: '24px',          // Section gap - INCREASED from 16px ⭐
      xl: '32px',          // Large section - INCREASED from 24px ⭐
      '2xl': '48px',       // Major sections
    },

    // Form spacing
    form: {
      fieldGap: '20px',         // Between form fields (was 16px)
      labelGap: '8px',          // Label to input
      helperGap: '6px',         // Input to helper text
      sectionGap: '32px',       // Between form sections (was 24px)
    },

    // Stack spacing (vertical)
    stack: {
      xs: '8px',           // Tight stack
      sm: '12px',          // Small stack
      md: '16px',          // Default stack ⭐
      lg: '24px',          // Large stack ⭐
      xl: '32px',          // Extra large stack
    },

    // Inline spacing (horizontal)
    inline: {
      xs: '8px',           // Tight inline
      sm: '12px',          // Small inline
      md: '16px',          // Default inline
      lg: '20px',          // Large inline
      xl: '24px',          // Extra large inline
    },
  },

  // Container max-widths (unchanged - these are good)
  container: {
    xs: '320px',          // Mobile
    sm: '640px',          // Small screens
    md: '768px',          // Tablets
    lg: '1024px',         // Laptops
    xl: '1280px',         // Desktops
    '2xl': '1536px',      // Large desktops
    full: '100%',         // Full width
  },

  // Safe areas for mobile (iOS/Android notches)
  safe: {
    top: '44px',          // iOS status bar + safe area
    bottom: '34px',       // iOS home indicator
    horizontal: '20px',   // Safe side padding (was 16px) - INCREASED
  },

  // Page/Section padding
  page: {
    mobile: '16px',       // Mobile page padding
    tablet: '24px',       // Tablet page padding
    desktop: '32px',      // Desktop page padding (was 24px) - INCREASED
  },
} as const;

export type SpacingToken = typeof spacing;
export type SpacingKey = keyof typeof spacing;

// Z-index scale
export const zIndex = {
  base: 0,              // Base layer - normal flow
  dropdown: 1000,       // Dropdowns, selects
  sticky: 1100,         // Sticky headers
  overlay: 1200,        // Modal backdrops
  modal: 1300,          // Modals, drawers
  fab: 1350,            // FAB (floating action button)
  popover: 1400,        // Popovers, menus
  toast: 1500,          // Toasts, snackbars
  tooltip: 1600,        // Tooltips (highest interactive)
  max: 9999,            // Maximum (emergency only)
} as const;

export type ZIndexToken = typeof zIndex;

/**
 * Design Philosophy - Spacing
 *
 * 1. "Double Your Whitespace"
 *    - Most amateur designs are cramped
 *    - Generous spacing = professional, expensive feel
 *    - When in doubt, add MORE space
 *
 * 2. Component Padding Principles
 *    - Buttons: Minimum 12px vertical, 24px horizontal
 *    - Inputs: Minimum 12px vertical, 16px horizontal
 *    - Cards: Minimum 24px, prefer 32px
 *    - Modals: Minimum 24px padding
 *
 * 3. Gap Principles
 *    - Related items: 8-12px
 *    - Component groups: 16-24px (PREFER 24px)
 *    - Sections: 32-48px
 *    - Major sections: 64px+
 *
 * 4. Typography Spacing
 *    - Paragraph spacing = font size (16px text = 16px gap)
 *    - Heading spacing = 2x heading size
 *    - Line height: 1.4-1.5x for body, 1.2x for headings
 *
 * 5. Mobile Considerations
 *    - Don't reduce spacing too much on mobile
 *    - Touch targets: minimum 44x44px (iOS) or 48x48px (Material)
 *    - Generous tap areas feel premium
 */
