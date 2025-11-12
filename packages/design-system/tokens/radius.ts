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
  // Buttons - 8px (Linear Standard)
  button: {
    default: radius.md,     // Standard buttons (8px) ⭐ Professional, modern
    large: radius.md,       // Large CTAs (8px) - consistent
    pill: radius.full,      // Pill buttons (fully rounded) - special case only
  },

  // Input fields - 8px (Linear Standard)
  input: {
    default: radius.md,     // Text inputs (8px) ⭐ Matches buttons
    large: radius.md,       // Large inputs (8px) - consistent
    textarea: radius.lg,    // Textareas (12px) - consistent with cards
  },

  // Cards and containers - 12px (Linear Standard)
  card: {
    default: radius.lg,     // Standard cards (12px) ⭐ Linear standard
    large: radius.lg,       // Feature cards (12px)
    compact: radius.lg,     // Compact cards (12px)
  },

  // Modals and overlays - 16px (Standard)
  modal: {
    default: radius.xl,     // Modal dialogs (16px) ⭐
    large: radius.xl,       // Large modals (16px) - consistent
    sheet: radius.xl,       // Bottom sheets (16px top corners only)
  },

  // Badges and tags - 8px (Linear Standard)
  badge: {
    default: radius.md,     // Standard badges (8px) ⭐ Matches buttons
    rounded: radius.md,     // Rounded badges (8px)
    pill: radius.full,      // Pill badges (fully rounded) - special case
  },

  // Avatars
  avatar: {
    square: radius.md,      // Rounded square (8px) ⭐ Matches buttons
    rounded: radius.md,     // More rounded (8px)
    circle: radius.full,    // Circle (fully rounded)
  },

  // Tooltips and popovers - 12px
  popover: {
    default: radius.lg,     // Tooltips, small popovers (12px)
    large: radius.lg,       // Large popovers (12px)
    menu: radius.lg,        // Dropdown menus (12px) - matches cards
  },

  // Images - 8px (Linear Standard)
  image: {
    default: radius.md,     // Standard images (8px) ⭐ Linear standard
    thumbnail: radius.md,   // Thumbnails (8px) - consistent
    avatar: radius.full,    // Avatar images (circle)
    hero: radius.lg,        // Hero images (12px) - larger context
  },

  // Alerts and notifications - 12px
  alert: {
    default: radius.lg,     // Standard alerts (12px)
    inline: radius.lg,      // Inline alerts (12px)
    toast: radius.lg,       // Toast notifications (12px)
  },

  // Progress indicators
  progress: {
    bar: radius.full,       // Progress bars (pill)
    track: radius.full,     // Progress track (pill)
    circular: radius.full,  // Circular progress (full round)
  },

  // Form elements
  form: {
    checkbox: radius.xs,    // Checkboxes (4px) - too small for 8px
    radio: radius.full,     // Radio buttons (full round)
    toggle: radius.full,    // Toggle switches (pill)
    select: radius.md,      // Select dropdowns (8px) ⭐ Matches inputs
  },

  // Tabs and navigation
  tabs: {
    default: radius.md,     // Standard tabs (8px)
    pill: radius.full,      // Pill-style tabs (full round) - special case
    enclosed: radius.md,    // Enclosed tabs (8px)
  },

  // Dividers (rarely rounded)
  divider: {
    default: radius.none,   // Standard dividers (sharp)
    rounded: radius.xxs,    // Rounded ends (2px)
  },

  // Accordion
  accordion: {
    item: radius.lg,        // Accordion items (12px) - matches cards
    compact: radius.lg,     // Compact accordion (12px)
  },

  // Menu items
  menu: {
    container: radius.lg,   // Menu container (12px) - matches cards
    item: radius.md,        // Menu items (8px) - matches buttons
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
