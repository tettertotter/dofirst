/**
 * Design Tokens: Border Radius - 2025 Professional Standards
 *
 * Linear-Inspired Systematic Approach
 * - 8px for small interactive elements (buttons, inputs, images)
 * - 12px for cards and panels
 * - 16px for large containers (modals, drawers)
 *
 * Based on Linear's design system (refined 2024-2025)
 */

export const radius = {
  // No rounding - sharp corners
  // Use for: Data tables, grids, strict layouts (rare)
  none: '0px',

  // Minimal rounding (2px)
  // Use for: Dividers, very subtle softening (rare)
  xxs: '2px',

  // Extra small rounding (4px)
  // Use for: Checkboxes, small badges, tight UI
  xs: '4px',

  // Small rounding (6px)
  // Use for: Subtle intermediate state (rare)
  sm: '6px',

  // Medium rounding (8px) - DEFAULT for interactive elements ⭐
  // Use for: Buttons, inputs, badges, chips, images (Linear standard)
  md: '8px',

  // Large rounding (12px) - Cards & panels ⭐
  // Use for: Cards, panels, sections (Linear standard)
  lg: '12px',

  // Extra large rounding (16px) - Modals & containers ⭐
  // Use for: Modals, drawers, large containers (Linear standard)
  xl: '16px',

  // 2X large rounding (20px)
  // Use for: Hero sections, special features
  '2xl': '20px',

  // 3X large rounding (24px)
  // Use for: Very large containers, full-page experiences
  '3xl': '24px',

  // Full rounding (pill shape)
  // Use for: Pills, tags, avatar groups, toggle switches
  full: '9999px',
} as const;

/**
 * Component-Specific Radius (2025 Standards)
 * Following Linear's systematic 8/12/16px approach
 */
export const componentRadius = {
  // Buttons - PILL (Fully Rounded)
  button: {
    default: radius.full,   // Standard buttons (pill) ⭐ Friendly, approachable
    large: radius.full,     // Large CTAs (pill) - consistent
    pill: radius.full,      // Pill buttons (fully rounded)
  },

  // Input fields - PILL (Fully Rounded)
  input: {
    default: radius.full,   // Text inputs (pill) ⭐ Matches buttons
    large: radius.full,     // Large inputs (pill) - consistent
    textarea: radius.xl,    // Textareas (16px) - pills look weird on tall rectangles
  },

  // Cards and containers - 16px (Standard)
  card: {
    default: radius.xl,     // Standard cards (16px) ⭐ Universal consistency
    large: radius.xl,       // Feature cards (16px)
    compact: radius.xl,     // Compact cards (16px)
  },

  // Modals and overlays - 16px (Standard)
  modal: {
    default: radius.xl,     // Modal dialogs (16px) ⭐
    large: radius.xl,       // Large modals (16px) - consistent
    sheet: radius.xl,       // Bottom sheets (16px top corners only)
  },

  // Badges and tags - PILL (Fully Rounded)
  badge: {
    default: radius.full,   // Standard badges (pill) ⭐ Matches buttons
    rounded: radius.full,   // Rounded badges (pill)
    pill: radius.full,      // Pill badges (fully rounded)
  },

  // Avatars
  avatar: {
    square: radius.xl,      // Rounded square (16px) ⭐ Universal standard
    rounded: radius.xl,     // More rounded (16px)
    circle: radius.full,    // Circle (fully rounded)
  },

  // Tooltips and popovers - 16px
  popover: {
    default: radius.xl,     // Tooltips, small popovers (16px)
    large: radius.xl,       // Large popovers (16px)
    menu: radius.xl,        // Dropdown menus (16px) - matches Select
  },

  // Images - 16px
  image: {
    default: radius.xl,     // Standard images (16px) ⭐ Universal standard
    thumbnail: radius.xl,   // Thumbnails (16px) - consistent
    avatar: radius.full,    // Avatar images (circle)
    hero: radius.xl,        // Hero images (16px)
  },

  // Alerts and notifications - 16px
  alert: {
    default: radius.xl,     // Standard alerts (16px)
    inline: radius.xl,      // Inline alerts (16px)
    toast: radius.xl,       // Toast notifications (16px)
  },

  // Progress indicators
  progress: {
    bar: radius.full,       // Progress bars (pill)
    track: radius.full,     // Progress track (pill)
    circular: radius.full,  // Circular progress (full round)
  },

  // Form elements
  form: {
    checkbox: radius.xs,    // Checkboxes (4px) - too small for 16px
    radio: radius.full,     // Radio buttons (full round)
    toggle: radius.full,    // Toggle switches (pill)
    select: radius.xl,      // Select dropdowns (16px) ⭐ Matches inputs
  },

  // Tabs and navigation
  tabs: {
    default: radius.xl,     // Standard tabs (16px)
    pill: radius.full,      // Pill-style tabs (full round)
    enclosed: radius.xl,    // Enclosed tabs (16px)
  },

  // Dividers (rarely rounded)
  divider: {
    default: radius.none,   // Standard dividers (sharp)
    rounded: radius.xxs,    // Rounded ends (2px)
  },

  // Accordion
  accordion: {
    item: radius.xl,        // Accordion items (16px)
    compact: radius.xl,     // Compact accordion (16px)
  },

  // Menu items
  menu: {
    container: radius.xl,   // Menu container (16px) - matches Select dropdown
    item: radius.xl,        // Menu items (16px)
  },
} as const;

/**
 * Platform-Specific Adjustments
 * Different platforms have different design languages
 */
export const platformRadius = {
  // iOS - More generous rounding (Apple HIG)
  ios: {
    button: radius.md,      // 8px for iOS buttons
    card: radius.lg,        // 12px for iOS cards
    modal: radius.xl,       // 16px for iOS modals
    sheet: radius.xl,       // 16px for iOS sheets
  },

  // Android Material Design 3
  android: {
    button: radius.md,      // 8px (MD3 updated from 4px)
    card: radius.lg,        // 12px (MD3 standard)
    modal: radius.xl,       // 16px (MD3 extra-large)
    fab: radius.xl,         // 16px for FABs
  },

  // Web - Balanced approach (Linear-inspired)
  web: {
    button: radius.md,      // 8px (modern standard)
    card: radius.lg,        // 12px (card standard)
    modal: radius.xl,       // 16px (modal standard)
  },
} as const;

export type RadiusToken = typeof radius;
export type ComponentRadiusToken = typeof componentRadius;
export type PlatformRadiusToken = typeof platformRadius;

/**
 * Design Philosophy - Border Radius
 *
 * 1. Linear's Systematic Approach (8/12/16px)
 *    - 8px: Interactive elements (buttons, inputs, images)
 *    - 12px: Cards and panels
 *    - 16px: Large containers (modals, drawers)
 *    - Creates visual consistency and sophistication
 *
 * 2. Psychology of Rounded Corners
 *    - 2-4px: Professional, minimal, restrained
 *    - 8-12px: Modern, friendly, balanced ⭐ (Most SaaS apps)
 *    - 16px+: Playful, casual, consumer-focused
 *    - Full round: Pills, avatars, special cases
 *
 * 3. Cognitive Load
 *    - Brain uses fewer neurons to process rounded corners
 *    - Rounded = approachable, safe, friendly
 *    - Sharp = formal, technical, precise
 *    - 8px is the sweet spot for modern SaaS
 *
 * 4. Consistency is Critical
 *    - Use systematic values (8/12/16), not arbitrary (7/10/14)
 *    - Same radius for same element type throughout app
 *    - Creates professional, intentional feel
 *
 * 5. Platform Considerations
 *    - iOS prefers more rounding (12-16px)
 *    - Material Design 3 uses 8-12px
 *    - Web can use either, Linear uses 8/16px
 *    - Choose one system and stick to it
 *
 * Usage Examples:
 *
 * ```tsx
 * // Button (8px - Linear standard)
 * <button style={{ borderRadius: radius.md }}>
 *   Click me
 * </button>
 *
 * // Card (12px - Linear standard)
 * <div style={{ borderRadius: radius.lg }}>
 *   Card content
 * </div>
 *
 * // Modal (16px - Linear standard for large elements)
 * <dialog style={{ borderRadius: radius.xl }}>
 *   Modal content
 * </dialog>
 *
 * // Image (8px - Linear uses 8px for images)
 * <img style={{ borderRadius: radius.md }} />
 *
 * // Bottom sheet (16px on top corners only)
 * <div style={{
 *   borderRadius: `${radius.xl} ${radius.xl} 0 0`
 * }}>
 *   Sheet content
 * </div>
 * ```
 *
 * WRONG (inconsistent, arbitrary):
 * ```tsx
 * button: 7px
 * card: 10px
 * modal: 14px
 * ```
 *
 * RIGHT (systematic, Linear-inspired):
 * ```tsx
 * button: 8px
 * card: 12px
 * modal: 16px
 * ```
 */
