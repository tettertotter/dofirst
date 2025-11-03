# DoFirst - UI/UX Design System Plan

**Goal:** Create a world-class, polished UI that feels the same on Web, iPhone, and Android with a "wow factor" that makes users smile.

---

## 🎯 Design Philosophy

### Core Principles
1. **Calm & Intentional** - No visual noise, every element has purpose
2. **Fast & Responsive** - Instant feedback, smooth animations
3. **Beautiful & Functional** - Form follows function, but both matter
4. **Consistent & Predictable** - Same patterns everywhere
5. **Accessible & Inclusive** - WCAG AA minimum, keyboard navigation

### Inspiration
- **Apple Reminders** - Clean, simple, purposeful
- **Linear** - Beautiful gradients, smooth interactions
- **Things 3** - Thoughtful details, polish everywhere
- **Notion** - Flexible, powerful, clean

---

## 🎨 Phase 1: Design System Foundation

### 1.1 Color System

**Brand Colors:**
```
Primary (Action/Focus):
  - primary-50:  #f0f9ff  (lightest)
  - primary-100: #e0f2fe
  - primary-200: #bae6fd
  - primary-300: #7dd3fc
  - primary-400: #38bdf8
  - primary-500: #0ea5e9  (main brand)
  - primary-600: #0284c7
  - primary-700: #0369a1
  - primary-800: #075985
  - primary-900: #0c4a6e  (darkest)

Accent (Success/Positive):
  - accent-50:  #f0fdf4
  - accent-500: #22c55e  (main)
  - accent-900: #14532d

Warning:
  - warning-50:  #fffbeb
  - warning-500: #f59e0b  (main)
  - warning-900: #78350f

Error:
  - error-50:  #fef2f2
  - error-500: #ef4444  (main)
  - error-900: #7f1d1d
```

**Neutrals (Light Mode):**
```
- gray-0:   #ffffff  (pure white)
- gray-50:  #fafafa  (backgrounds)
- gray-100: #f5f5f5  (subtle bg)
- gray-200: #e5e5e5  (borders)
- gray-300: #d4d4d4  (disabled)
- gray-400: #a3a3a3  (placeholder)
- gray-500: #737373  (secondary text)
- gray-600: #525252  (body text)
- gray-700: #404040  (emphasis)
- gray-800: #262626  (headings)
- gray-900: #171717  (max contrast)
- gray-1000: #000000 (pure black)
```

**Dark Mode:**
```
- dark-bg-primary:   #0a0a0a  (main bg)
- dark-bg-secondary: #171717  (cards)
- dark-bg-tertiary:  #262626  (elevated)
- dark-border:       #404040  (borders)
- dark-text-primary: #fafafa  (main text)
- dark-text-secondary: #a3a3a3  (secondary)
```

**Semantic Colors:**
```
Priority Colors:
  - priority-1: #ef4444  (Urgent - red)
  - priority-2: #f97316  (High - orange)
  - priority-3: #3b82f6  (Medium - blue)
  - priority-4: #8b5cf6  (Low - purple)
  - priority-5: #6b7280  (Very Low - gray)

Status Colors:
  - status-proposed:  #fbbf24 (yellow)
  - status-accepted:  #10b981 (green)
  - status-declined:  #ef4444 (red)
  - status-completed: #8b5cf6 (purple)
```

### 1.2 Typography System

**Font Families:**
```
Primary: Inter (fallback: system-ui, -apple-system, sans-serif)
Monospace: 'JetBrains Mono' (fallback: 'SF Mono', Monaco, monospace)
```

**Type Scale:**
```
- xs:   12px / 16px line-height (captions, labels)
- sm:   14px / 20px (body, small)
- base: 16px / 24px (body, default)
- lg:   18px / 28px (large body)
- xl:   20px / 28px (section headers)
- 2xl:  24px / 32px (page headers)
- 3xl:  30px / 36px (hero)
- 4xl:  36px / 40px (display)
```

**Font Weights:**
```
- regular: 400 (body text)
- medium:  500 (subtle emphasis)
- semibold: 600 (buttons, labels)
- bold:    700 (headings)
```

### 1.3 Spacing System (8px Grid)

```
- xs:   4px   (tight spacing)
- sm:   8px   (default gap)
- md:   16px  (section spacing)
- lg:   24px  (component spacing)
- xl:   32px  (page sections)
- 2xl:  48px  (major sections)
- 3xl:  64px  (hero sections)
```

### 1.4 Border Radius

```
- none: 0px     (sharp corners)
- sm:   4px     (subtle rounding)
- md:   8px     (default cards/buttons)
- lg:   12px    (prominent cards)
- xl:   16px    (large modals)
- full: 9999px  (pills, badges)
```

### 1.5 Shadow System

```
Light Mode:
- shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05)
- shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
- shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)
- shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
- shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)

Dark Mode:
- shadow-dark-sm: 0 1px 3px rgba(0, 0, 0, 0.3)
- shadow-dark-md: 0 4px 6px rgba(0, 0, 0, 0.4)
- shadow-dark-lg: 0 10px 15px rgba(0, 0, 0, 0.5)
```

### 1.6 Animation System

```
Timing Functions:
- ease-default: cubic-bezier(0.4, 0, 0.2, 1)
- ease-in:      cubic-bezier(0.4, 0, 1, 1)
- ease-out:     cubic-bezier(0, 0, 0.2, 1)
- ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55)

Durations:
- instant:  0ms
- fast:     150ms  (micro-interactions)
- normal:   250ms  (default)
- slow:     350ms  (complex transitions)
- slower:   500ms  (page transitions)

Common Animations:
- fade-in
- slide-up
- scale-in
- bounce-in
```

---

## 📦 Phase 2: Base Component Library

### 2.1 Layout Components

**Container**
- Max widths: sm (640px), md (768px), lg (1024px), xl (1280px)
- Horizontal padding: responsive
- Center alignment

**Stack**
- Vertical/horizontal stacking
- Gap control
- Alignment options

**Grid**
- 12-column grid system
- Responsive breakpoints
- Gap control

### 2.2 Form Components

**Input**
- Variants: default, error, disabled
- Sizes: sm, md, lg
- Icons: left/right
- Clear button
- Character count
- Helper text
- Error states

**Textarea**
- Auto-resize option
- Character limit
- Helper text

**Select**
- Native on mobile
- Custom dropdown on web
- Search/filter
- Multi-select option

**Checkbox/Radio**
- Custom styled
- Indeterminate state
- Disabled state

**Toggle/Switch**
- Smooth animation
- Disabled state
- Loading state

### 2.3 Button Components

**Primary Button**
- Default state
- Hover state
- Active/pressed state
- Disabled state
- Loading state with spinner
- Icon support (left/right)
- Sizes: sm, md, lg

**Secondary Button**
- Outlined style
- Same states as primary

**Ghost Button**
- Transparent background
- Hover background

**Icon Button**
- Square/circle variants
- Tooltip support

**Button Group**
- Connected buttons
- Single/multiple selection

### 2.4 Feedback Components

**Toast/Snackbar**
- Position: top/bottom, left/right/center
- Duration control
- Action button support
- Dismiss button
- Queue management
- Variants: success, error, warning, info

**Alert**
- Variants: info, warning, error, success
- Dismissible
- Icon support
- Action buttons

**Progress**
- Linear progress bar
- Circular spinner
- Determinate/indeterminate
- Size variants

**Skeleton**
- Text skeleton
- Card skeleton
- Custom shapes

### 2.5 Overlay Components

**Modal**
- Backdrop blur
- Click outside to close
- Escape to close
- Focus trap
- Sizes: sm, md, lg, xl, full
- Animation: fade + scale

**Drawer**
- Side: left, right, top, bottom
- Slide animation
- Overlay

**Popover**
- Positioning: top, bottom, left, right
- Arrow pointer
- Click/hover trigger

**Tooltip**
- Positioning
- Delay
- Max width

### 2.6 Display Components

**Badge**
- Variants: primary, success, warning, error
- Sizes: sm, md, lg
- Dot variant
- Pill shaped

**Avatar**
- Sizes: xs, sm, md, lg, xl
- Initials fallback
- Status indicator
- Image support
- Group avatars

**Tag**
- Removable
- Color variants
- Sizes

**Divider**
- Horizontal/vertical
- With text/icon

---

## 🎯 Phase 3: Task-Specific Components

### 3.1 Task Components

**TaskCard**
- Priority indicator (color-coded left border)
- Title (editable inline)
- Description (expandable)
- Tags (horizontal scroll if many)
- Due date with relative time
- Completion checkbox (satisfying animation)
- Quick actions menu (swipe on mobile, hover on web)
- Recurring indicator
- Assignment indicator

**TaskList**
- Virtualized for performance
- Grouping: by date, by priority, by tag
- Sorting options
- Empty states with helpful CTAs
- Pull to refresh (mobile)
- Infinite scroll

**QuickAdd**
- Floating action button (mobile)
- Command bar style (web: cmd+k)
- Autocomplete for tags
- Date picker shortcut
- Priority quick select
- Voice input button (prominent on mobile)
- Smooth expansion animation

### 3.2 Snooze Components

**SnoozeSheet**
- Bottom sheet on mobile (native feel)
- Modal on web
- Quick action chips with haptic feedback
- Time wheel picker (iOS native feel)
- Custom date/time selector
- Visual feedback on selection
- Smooth transitions

### 3.3 Proposal Components

**ProposalCard**
- Clear visual hierarchy
- Proposer avatar + name
- Task details preview
- Action buttons (prominent accept)
- Status badge (top-right)
- Date prominence
- Swipe actions (mobile)

**ProposalList**
- Tabs for filtering (pending/accepted/declined)
- Badge count on tabs
- Empty states
- Pull to refresh

### 3.4 Navigation

**TabBar (Mobile)**
- Bottom navigation
- Icons + labels
- Active state indicator
- Haptic feedback
- Badge support for notifications

**Sidebar (Web)**
- Collapsible
- Section grouping
- Search integration
- Quick actions

**TopBar**
- Title
- Back button (mobile)
- Search (expandable)
- Profile menu
- Notification bell with badge

---

## 🌓 Phase 4: Theme System

### 4.1 Theme Provider

**Structure:**
```typescript
interface Theme {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  shadows: ShadowScale;
  animations: AnimationConfig;
}

type ColorScheme = 'light' | 'dark' | 'auto';
```

**Features:**
- Theme toggle (manual or auto based on system)
- Smooth transition between themes
- Persist user preference
- CSS variables for web
- Context provider for React Native

### 4.2 Responsive System

**Breakpoints:**
```
- xs:  0px    (mobile portrait)
- sm:  640px  (mobile landscape)
- md:  768px  (tablet)
- lg:  1024px (laptop)
- xl:  1280px (desktop)
- 2xl: 1536px (large desktop)
```

**Platform Detection:**
- Separate components for web/native where needed
- Shared logic via hooks
- Platform-specific behaviors

---

## ✨ Phase 5: Polish & Delight

### 5.1 Micro-interactions

- Task completion animation (satisfying checkmark)
- Pull to refresh with spring animation
- Swipe gestures with visual feedback
- Button press states with scale
- Loading states (skeleton → content)
- Empty states with illustrations
- Error states with helpful suggestions

### 5.2 Sound Design (Optional)

- Task complete sound (subtle, satisfying)
- Notification sound (calm, not annoying)
- Error sound (gentle alert)
- User can disable sounds

### 5.3 Haptics (Mobile)

- Button presses (light)
- Task completion (medium)
- Swipe actions (selection)
- Pull to refresh (impact)

### 5.4 Illustrations

- Empty states (custom SVG illustrations)
- Onboarding screens
- Error states (404, 500, offline)
- Success states (confirmation)

---

## 📱 Phase 6: Platform-Specific Adaptations

### 6.1 Web Specifics

- Hover states everywhere
- Keyboard shortcuts (cmd+k, escape, enter)
- Focus indicators (keyboard navigation)
- Drag and drop (reorder tasks)
- Right-click context menus
- Browser native features (autocomplete)

### 6.2 iOS Specifics

- Native navigation (swipe back)
- Bottom sheet (native feel)
- Pull to refresh (spring animation)
- Haptic feedback (UIFeedbackGenerator)
- Safe area insets
- Large title navigation
- Modal presentation styles

### 6.3 Android Specifics

- Material Design motion
- Floating action button
- Snackbar (Android style)
- Ripple effects on press
- Navigation drawer
- System back button handling
- Material elevation

---

## 🎨 Phase 7: Animation Library

### 7.1 Entrance Animations

- fade-in
- slide-up
- slide-down
- scale-in
- bounce-in

### 7.2 Exit Animations

- fade-out
- slide-out
- scale-out
- collapse

### 7.3 Attention Animations

- pulse
- shake
- bounce
- glow

### 7.4 Transition Animations

- page transitions
- modal transitions
- drawer transitions
- tab transitions

---

## 🧪 Phase 8: Testing & Refinement

### 8.1 Visual Testing

- Screenshot tests (key components)
- Visual regression (Percy/Chromatic)
- Theme switching (light/dark)
- Responsive breakpoints

### 8.2 Interaction Testing

- Touch targets (min 44x44px)
- Hover states
- Focus states
- Loading states
- Error states

### 8.3 Accessibility Testing

- Screen reader support
- Keyboard navigation
- Color contrast (WCAG AA)
- Focus indicators
- ARIA labels

### 8.4 Performance Testing

- Component render times
- Animation performance (60fps)
- Bundle size impact
- Image optimization

---

## 📋 Implementation Checklist

### Week 1: Foundation
- [ ] Set up design tokens (colors, typography, spacing)
- [ ] Create theme provider system
- [ ] Build base layout components (Container, Stack, Grid)
- [ ] Implement typography components

### Week 2: Base Components
- [ ] Form components (Input, Textarea, Select, Checkbox, Toggle)
- [ ] Button variants (Primary, Secondary, Ghost, Icon)
- [ ] Feedback components (Toast, Alert, Progress, Skeleton)

### Week 3: Advanced Components
- [ ] Overlay components (Modal, Drawer, Popover, Tooltip)
- [ ] Display components (Badge, Avatar, Tag, Divider)
- [ ] Navigation components (TabBar, Sidebar, TopBar)

### Week 4: Task Components
- [ ] TaskCard with all features
- [ ] TaskList with virtualization
- [ ] QuickAdd with animations
- [ ] SnoozeSheet with time picker
- [ ] ProposalCard with actions

### Week 5: Polish
- [ ] Animations and transitions
- [ ] Micro-interactions
- [ ] Empty states and illustrations
- [ ] Loading states
- [ ] Error states

### Week 6: Platform Optimization
- [ ] iOS-specific adaptations
- [ ] Android-specific adaptations
- [ ] Web-specific features
- [ ] Cross-platform testing

### Week 7: Testing & Refinement
- [ ] Visual regression tests
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] User testing and feedback

---

## 🎯 Success Metrics

### Quantitative
- Component render time < 16ms (60fps)
- Bundle size < 100KB (design system)
- Lighthouse score 95+ (web)
- Accessibility score 95+ (axe)

### Qualitative
- "Wow, this is beautiful" - user feedback
- Feels native on each platform
- Consistent design language
- Delightful interactions
- Professional polish

---

## 🚀 Next Steps

1. **Review this plan** - Get feedback and approval
2. **Create design tokens package** - Start with foundation
3. **Build Storybook** - Component playground and documentation
4. **Implement systematically** - One phase at a time
5. **Test continuously** - Visual and functional tests
6. **Refine iteratively** - Polish based on testing

This plan will take 6-7 weeks for full implementation, but will result in a design system that rivals the best apps in the market.

---

**Ready to execute when approved.** 🎨
