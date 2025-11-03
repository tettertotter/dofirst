# @todaypool/design-system

Professional design system for DoFirst (TodayPool) with comprehensive design tokens and theme support.

## Overview

This design system provides everything needed to build beautiful, consistent UIs across Web, iOS, and Android:

- **Design Tokens**: Colors, typography, spacing, shadows, animations, and border radius
- **Theme System**: Light/dark mode with auto detection and persistence
- **Type Safety**: Full TypeScript support with exported types
- **Platform Support**: Works with React (Web) and React Native

## Installation

```bash
# This is an internal package - already available in the monorepo
import { ThemeProvider, useTheme, colors, spacing } from '@todaypool/design-system';
```

## Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@todaypool/design-system';

function App() {
  return (
    <ThemeProvider config={{ colorScheme: 'auto', persistPreference: true }}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Use theme tokens in components

```tsx
import { useTheme, useColors } from '@todaypool/design-system';

function MyComponent() {
  const { theme, isDark } = useTheme();
  const colors = useColors();

  return (
    <div
      style={{
        backgroundColor: colors.bg.primary,
        color: colors.text.primary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        boxShadow: isDark ? theme.shadows.dark.md : theme.shadows.light.md,
      }}
    >
      Hello World
    </div>
  );
}
```

## Design Tokens

### Colors

Complete color system with semantic meaning:

```tsx
import { colors } from '@todaypool/design-system';

// Brand colors (50-900 scale)
colors.primary[500]  // Main brand color
colors.primary[600]  // Hover state
colors.primary[700]  // Active state

// Semantic colors
colors.accent[500]   // Success/positive
colors.warning[500]  // Warnings
colors.error[500]    // Errors/destructive
colors.info[500]     // Informational

// Neutrals
colors.gray[0]       // Pure white
colors.gray[600]     // Body text
colors.gray[900]     // Headings

// Dark mode
colors.dark.bg.primary    // Main background
colors.dark.text.primary  // Main text

// Task-specific
colors.priority[1]   // Urgent (red)
colors.priority[2]   // High (orange)
colors.priority[3]   // Medium (blue)

// Status colors
colors.status.proposed.bg
colors.status.accepted.bg
colors.status.completed.bg
```

### Typography

Professional type system with hierarchy:

```tsx
import { typography, textStyles } from '@todaypool/design-system';

// Font families
typography.fonts.primary  // Inter + system fallbacks
typography.fonts.mono     // JetBrains Mono + fallbacks

// Type scale
typography.sizes.xs       // 12px - captions
typography.sizes.base     // 16px - default body
typography.sizes['2xl']   // 24px - page headers
typography.sizes['5xl']   // 48px - display text

// Weights
typography.weights.regular   // 400
typography.weights.semibold  // 600
typography.weights.bold      // 700

// Preset text styles
textStyles.h1        // 30px bold heading
textStyles.body      // 16px regular body
textStyles.button    // 16px semibold button text
textStyles.caption   // 12px caption
```

### Spacing

8px grid system for consistent spacing:

```tsx
import { spacing } from '@todaypool/design-system';

// Grid scale
spacing[2]   // 8px - base unit
spacing[4]   // 16px - default spacing
spacing[6]   // 24px - section spacing

// Semantic spacing
spacing.xs   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px

// Component-specific
spacing.component.padding.sm  // '12px 16px'
spacing.component.padding.md  // '16px 20px'
spacing.component.gap.sm      // '8px'
```

### Shadows

Elevation system for depth:

```tsx
import { shadows, elevation } from '@todaypool/design-system';

// Light mode shadows
shadows.light.sm   // Buttons, inputs
shadows.light.md   // Cards, dropdowns
shadows.light.lg   // Modals, popovers

// Dark mode shadows (stronger)
shadows.dark.md

// Semantic elevation
elevation.raised   // Buttons
elevation.floating // Cards
elevation.modal    // Dialogs

// Focus rings (accessibility)
shadows.focus.default  // Keyboard focus
shadows.focus.error    // Error focus
```

### Animations

Motion design system:

```tsx
import { duration, easing, transition, animation } from '@todaypool/design-system';

// Durations
duration.fast    // 150ms - hover states
duration.normal  // 250ms - most transitions
duration.slow    // 350ms - modals

// Easing curves
easing.default  // Balanced
easing.out      // Elements entering
easing.in       // Elements exiting
easing.bounce   // Playful (use sparingly)

// Preset transitions
transition.fade.value      // 'opacity 150ms ease-out'
transition.button.value    // Complete button transition
transition.modal.value     // Modal entrance

// Animations
animation.fadeIn     // Fade in animation
animation.slideUp    // Slide up from bottom
animation.scaleIn    // Scale in (zoom)
animation.spin       // Loading spinner
```

### Border Radius

Consistent rounding:

```tsx
import { radius, componentRadius } from '@todaypool/design-system';

// Scale
radius.sm    // 4px - buttons, inputs
radius.md    // 8px - cards (default)
radius.lg    // 12px - prominent cards
radius.full  // 9999px - pills, badges

// Component-specific
componentRadius.button.default  // 4px
componentRadius.card.default    // 8px
componentRadius.badge.pill      // full rounding
```

## Theme System

### Color Scheme Management

```tsx
import { useColorScheme } from '@todaypool/design-system';

function ThemeToggle() {
  const { colorScheme, setColorScheme, toggleColorScheme, isDark } = useColorScheme();

  return (
    <button onClick={toggleColorScheme}>
      {isDark ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
}
```

### Resolved Colors

```tsx
import { useColors } from '@todaypool/design-system';

function StyledComponent() {
  const colors = useColors();

  // These automatically switch between light/dark
  return (
    <div
      style={{
        backgroundColor: colors.bg.primary,
        color: colors.text.primary,
        borderColor: colors.border.default,
      }}
    >
      Content
    </div>
  );
}
```

### CSS Variables

```tsx
import { generateCSSVariables } from '@todaypool/design-system';

// Generate CSS variables for use in vanilla CSS or CSS-in-JS
const cssVars = generateCSSVariables(theme, isDark);

// Apply to root
Object.entries(cssVars).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});
```

## Z-Index Scale

Organized layering system:

```tsx
import { zIndex } from '@todaypool/design-system';

zIndex.dropdown  // 1000
zIndex.sticky    // 1100
zIndex.modal     // 1300
zIndex.toast     // 1500
zIndex.tooltip   // 1600 (highest)
```

## Best Practices

### 1. Always Use Tokens

❌ **Don't** use arbitrary values:
```tsx
<div style={{ padding: '15px', color: '#3b82f6' }}>
```

✅ **Do** use design tokens:
```tsx
<div style={{ padding: spacing.md, color: colors.primary[500] }}>
```

### 2. Use Semantic Naming

❌ **Don't** use appearance-based names:
```tsx
<button style={{ backgroundColor: colors.primary[500] }}>Delete</button>
```

✅ **Do** use semantic colors:
```tsx
<button style={{ backgroundColor: colors.error[500] }}>Delete</button>
```

### 3. Respect Color Scheme

❌ **Don't** hardcode colors:
```tsx
<div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
```

✅ **Do** use resolved colors:
```tsx
const colors = useColors();
<div style={{ backgroundColor: colors.bg.primary, color: colors.text.primary }}>
```

### 4. Use Preset Text Styles

❌ **Don't** manually combine typography properties:
```tsx
<h1 style={{ fontSize: '30px', fontWeight: 700, lineHeight: '36px' }}>
```

✅ **Do** use preset text styles:
```tsx
<h1 style={textStyles.h1}>
```

### 5. Consistent Spacing

❌ **Don't** use arbitrary spacing:
```tsx
<div style={{ marginBottom: '18px', gap: '13px' }}>
```

✅ **Do** use 8px grid:
```tsx
<div style={{ marginBottom: spacing.lg, gap: spacing.md }}>
```

## Animation Guidelines

### When to Use Animations

- **Do**: Provide feedback on user actions
- **Do**: Guide user attention
- **Do**: Create smooth transitions
- **Don't**: Animate without purpose
- **Don't**: Use slow animations for common actions
- **Don't**: Overuse bounce/spring effects

### Respecting User Preferences

The theme system automatically respects `prefers-reduced-motion`:

```tsx
import { reducedMotion } from '@todaypool/design-system';

// Use reducedMotion when user prefers less motion
const transitionDuration = prefersReducedMotion
  ? reducedMotion.duration
  : duration.normal;
```

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:
- Primary text: 7:1 contrast ratio
- Secondary text: 4.5:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

### Focus Indicators

Always use visible focus indicators:

```tsx
import { shadows } from '@todaypool/design-system';

// On keyboard focus
<button style={{ outline: 'none', boxShadow: shadows.focus.default }}>
```

### Dark Mode

Dark mode colors carefully chosen for:
- Comfortable viewing in low light
- Sufficient contrast
- Reduced eye strain

## Platform-Specific Adaptations

The design system includes platform-specific optimizations:

```tsx
import { platformRadius } from '@todaypool/design-system';

// iOS prefers more rounding
platformRadius.ios.button    // 8px

// Android Material Design
platformRadius.android.button // 4px

// Web defaults
platformRadius.web.button     // 4px
```

## File Structure

```
packages/design-system/
├── index.ts                 # Main export file
├── package.json
├── tokens/
│   ├── colors.ts           # Color system
│   ├── typography.ts       # Type scale, fonts, text styles
│   ├── spacing.ts          # 8px grid, z-index
│   ├── shadows.ts          # Elevation system
│   ├── animations.ts       # Motion design
│   └── radius.ts           # Border radius
└── theme/
    ├── index.ts            # Theme exports
    ├── types.ts            # TypeScript types
    ├── utils.ts            # Theme utilities
    └── ThemeProvider.tsx   # React context provider
```

## What's Next

This is Phase 1 (Foundation) complete. Next phases:

- **Phase 2**: Base Component Library (30+ components)
- **Phase 3**: Task-Specific Components
- **Phase 4**: Micro-interactions and Polish
- **Phase 5**: Platform Optimizations
- **Phase 6**: Visual Testing

## Contributing

When adding new tokens:

1. Follow existing naming conventions
2. Add JSDoc comments explaining usage
3. Maintain type safety
4. Consider both light and dark modes
5. Test accessibility (contrast ratios)
6. Document in this README

## Philosophy

Every design decision in this system is intentional:

- **Calm & Intentional**: No visual noise
- **Fast & Responsive**: Instant feedback, smooth animations
- **Beautiful & Functional**: Form follows function
- **Consistent & Predictable**: Same patterns everywhere
- **Accessible & Inclusive**: WCAG AA minimum

This design system aims to create a "wow factor" that makes users smile while maintaining professional polish across all platforms.
