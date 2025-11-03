# START HERE - New Agent Onboarding

**Last Updated**: 2025-11-02

Welcome! This document provides the **essential context** you need to understand this project and continue work efficiently.

---

## What Is This Project?

**TodayPool/DoFirst** - A cross-platform task management application with a world-class design system.

**Current Focus**: Mobile-first UX improvements using 2025 professional standards.

---

## Project Structure

```
todaypool/
├── apps/
│   ├── web/              # Next.js 15 web app
│   └── mobile/           # Expo React Native app
├── packages/
│   └── design-system/    # Professional component library (21 components, 10 hooks)
├── supabase/             # Database migrations
└── docs/                 # Documentation (you are here)
```

---

## Current Status (2025-11-02)

### ✅ Completed

1. **Design System Foundation** (100%)
   - 21 production-ready components
   - 10 utility hooks
   - Complete token system (colors, typography, spacing, shadows, animations)
   - Light/dark mode with SSR-safe implementation

2. **Mobile UX Phase 1** (100%)
   - All touch targets meet 44x44px minimum (Apple/Android requirements)
   - Button, Radio, Checkbox, Toggle components now mobile-optimized
   - Responsive breakpoints: 0-767px (mobile), 768-1023px (tablet), 1024px+ (desktop)
   - Zero hydration errors

3. **2025 UX Research** (100%)
   - Comprehensive research from iOS 18, Material 3 Expressive
   - Spring physics animations documented
   - Haptic feedback best practices
   - PWA standards, voice interfaces, gesture navigation
   - All documented in `PROFESSIONAL_UI_DESIGN_GUIDE.md`

3. **Mobile UX Phase 2** (100%)
   - Spring physics animations (4 configs, 15+ variants)
   - Skeleton loading states with pulse animation
   - Swipe gesture support (3x faster than buttons on mobile)
   - Voice input component with Web Speech API
   - FAB (Floating Action Button) with speed dial
   - All components use haptic feedback
   - Natural language parsing for task creation
   - **Feature Complete**: Voice-to-task flow fully functional

### 🚀 Next Steps

**Mobile UX Phase 3** - Advanced mobile features:

1. Pull-to-refresh gesture
2. Offline mode with optimistic updates
3. Push notifications (Web Push API)
4. Share sheet integration
5. iOS/Android home screen widgets

---

## Essential Reading (In Order)

Read these **5 documents** to get complete context:

### 1. **README.md** (Project overview)
High-level overview of the entire project.

### 2. **PROFESSIONAL_UI_DESIGN_GUIDE.md** (2025 standards)
**WHY IT MATTERS**: Contains all research-backed 2025 standards for mobile UX.
- Spring physics configs
- Haptic feedback patterns
- iOS 18 & Material 3 Expressive guidelines
- PWA standards
- Performance metrics (60fps baseline, 120fps premium)

### 3. **MOBILE_UX_IMPROVEMENTS_COMPLETED.md** (What's done)
**WHY IT MATTERS**: Documents Phase 1 completion with exact metrics.
- Touch target sizes (before/after)
- Files modified
- Testing checklist
- Phase 2 preview

### 4. **packages/design-system/README.md** (Component usage)
**WHY IT MATTERS**: How to use the 21 components and 10 hooks.
- All exported tokens and components
- Usage examples
- Best practices

### 5. **VOICE_INPUT.md** (Voice-to-task feature)
**WHY IT MATTERS**: Complete guide to the #1 priority use case.
- User flow and examples
- Natural language parsing patterns
- Technical implementation
- Testing checklist
- Performance metrics

### 6. **QUICK_REFERENCE.md** (Development standards)
**WHY IT MATTERS**: Quality standards and workflow.
- No stubs/TODOs policy
- Testing requirements
- Security checklist

---

## Quick Facts

**Tech Stack**:
- Frontend: Next.js 15 (web), Expo (mobile)
- Backend: Supabase (PostgreSQL + Auth)
- Design System: Custom (packages/design-system)
- Styling: CSS-in-JS with design tokens

**Quality Standards**:
- ✅ No stubs or TODOs
- ✅ Test on all platforms (iOS, Android, Web)
- ✅ SSR-safe components (no hydration errors)
- ✅ Full TypeScript coverage
- ✅ WCAG AA accessibility minimum

**Mobile-First Requirements**:
- Touch targets: ≥44x44px (Apple/Android standard)
- Font size: ≥16px (prevents iOS zoom)
- Responsive breakpoint: 767px (mobile), 1024px (desktop)
- Haptic feedback on all interactions
- Spring physics animations (200-500ms)

---

## Critical Files to Know

### Design System
- `packages/design-system/components/` - 21 production components
- `packages/design-system/tokens/` - Design tokens (colors, spacing, typography)
- `packages/design-system/hooks/` - 10 utility hooks (useIsMobile, useMediaQuery, etc.)

### Web App
- `apps/web/app/today/page.tsx` - **CRITICAL ISSUE**: Lines 106 & 143 use browser `prompt()` (terrible mobile UX)
- `apps/web/app/design-system-demo/page.tsx` - Component showcase

### Documentation
- `docs/PROFESSIONAL_UI_DESIGN_GUIDE.md` - **MASTER REFERENCE** for all UI/UX decisions
- `docs/MOBILE_UX_IMPROVEMENTS_COMPLETED.md` - Phase 1 completion report
- `docs/archive/` - Old docs (don't read unless researching history)

---

## What You Should Do Next

### If Continuing Mobile UX Phase 2:

1. **Review Current Todo List** - Check what's in progress
2. **Read PROFESSIONAL_UI_DESIGN_GUIDE.md** - Section "2025 Mobile UX Excellence" (lines 1108-1563)
3. **Install Dependencies**: `cd /Users/pc2/Desktop/vscode\ repo/todaypool && pnpm add framer-motion`
4. **Implement Features** in this order:
   - Haptic feedback service (universal, used by everything else)
   - Replace `prompt()` calls (critical UX blocker)
   - Spring animations (visual polish)
   - Voice input (user's #1 use case: "quick reminder while driving")
   - FAB component
   - Swipe gestures
   - Skeleton loading states

### If Starting Something New:

1. Read the 5 essential docs above
2. Check CHANGELOG.md for recent changes
3. Ask the user for clarification on goals

---

## Key User Preferences (IMPORTANT)

Based on conversation history:

1. **Mobile-First**: "Most people will be using this on their phones"
2. **Use Case**: "Adding tasks while driving/multitasking" (voice input critical)
3. **Documentation**: "Keep our documents organized" - update existing docs, don't create duplicates
4. **Quality**: "Bring our code up to a higher standard" - implement 2025 best practices
5. **No Placeholders**: User expects production-ready code on first try

---

## Common Mistakes to Avoid

❌ **Don't** create new docs when existing ones can be updated
❌ **Don't** use `npm` (this is a `pnpm` workspace)
❌ **Don't** use browser `prompt()` (terrible mobile UX)
❌ **Don't** use `Math.random()` for IDs (causes hydration errors - use `useId()`)
❌ **Don't** animate `width`, `height`, `top`, `left` (use `transform` and `opacity`)
❌ **Don't** use medium grays (400-600 range looks "wireframey")

✅ **Do** use `pnpm add` for dependencies
✅ **Do** use `useIsMobile()` hook for responsive components
✅ **Do** use spring physics for animations
✅ **Do** update CHANGELOG.md after completing work
✅ **Do** mark todos as complete immediately after finishing

---

## Need Help?

- **Component Usage**: Check `packages/design-system/README.md`
- **2025 Standards**: Check `PROFESSIONAL_UI_DESIGN_GUIDE.md`
- **Mobile UX Phase 1**: Check `MOBILE_UX_IMPROVEMENTS_COMPLETED.md`
- **Old Decisions**: Check `docs/archive/` (historical context only)

---

**You're now ready to continue work!** 🚀

Next step: Install animation libraries and implement haptic feedback service.
