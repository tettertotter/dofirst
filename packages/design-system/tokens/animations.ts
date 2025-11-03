/**
 * Design Tokens: Animations
 *
 * Motion design system for smooth, purposeful animations.
 * Every animation should feel natural and enhance the experience.
 */

/**
 * Duration Scale
 * Consistent timing for all animations
 */
export const duration = {
  // No animation (for accessibility preferences)
  instant: '0ms',

  // Very fast (75ms)
  // Use for: Immediate feedback, micro-interactions
  fastest: '75ms',

  // Fast (150ms)
  // Use for: Hover states, tooltips, simple transitions
  fast: '150ms',

  // Normal (250ms)
  // Use for: Most UI transitions, button states, dropdowns
  normal: '250ms',

  // Slow (350ms)
  // Use for: Complex transitions, modals opening
  slow: '350ms',

  // Slower (500ms)
  // Use for: Page transitions, drawer animations
  slower: '500ms',

  // Slowest (700ms)
  // Use for: Large content changes, major state transitions
  slowest: '700ms',
} as const;

/**
 * Easing Functions
 * Natural motion curves based on real-world physics
 */
export const easing = {
  // Linear - constant speed (rarely used)
  linear: 'linear',

  // Default easing - balanced in/out
  // Use for: Most transitions
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Ease in - slow start, fast end
  // Use for: Elements exiting the screen
  in: 'cubic-bezier(0.4, 0, 1, 1)',

  // Ease out - fast start, slow end
  // Use for: Elements entering the screen
  out: 'cubic-bezier(0, 0, 0.2, 1)',

  // Ease in-out - slow start and end
  // Use for: Elements moving within the screen
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Sharp - quick and precise
  // Use for: Small, snappy movements
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',

  // Smooth - gentle and flowing
  // Use for: Large, graceful movements
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',

  // Bounce - playful overshoot
  // Use for: Attention-grabbing animations (use sparingly)
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Spring - natural elastic feel
  // Use for: Interactive elements, satisfying feedback
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * Preset Transitions
 * Common combinations ready to use
 */
export const transition = {
  // Quick fade for subtle changes
  fade: {
    duration: duration.fast,
    easing: easing.out,
    property: 'opacity',
    value: `opacity ${duration.fast} ${easing.out}`,
  },

  // Transform for movement
  transform: {
    duration: duration.normal,
    easing: easing.default,
    property: 'transform',
    value: `transform ${duration.normal} ${easing.default}`,
  },

  // Color changes (backgrounds, borders, text)
  color: {
    duration: duration.fast,
    easing: easing.default,
    property: 'color, background-color, border-color',
    value: `color ${duration.fast} ${easing.default}, background-color ${duration.fast} ${easing.default}, border-color ${duration.fast} ${easing.default}`,
  },

  // All properties (use sparingly)
  all: {
    duration: duration.normal,
    easing: easing.default,
    property: 'all',
    value: `all ${duration.normal} ${easing.default}`,
  },

  // Shadow changes
  shadow: {
    duration: duration.normal,
    easing: easing.default,
    property: 'box-shadow',
    value: `box-shadow ${duration.normal} ${easing.default}`,
  },

  // Button interaction
  button: {
    duration: duration.fast,
    easing: easing.out,
    property: 'background-color, border-color, box-shadow, transform',
    value: `background-color ${duration.fast} ${easing.out}, border-color ${duration.fast} ${easing.out}, box-shadow ${duration.fast} ${easing.out}, transform ${duration.fastest} ${easing.out}`,
  },

  // Modal/Drawer entrance
  modal: {
    duration: duration.slow,
    easing: easing.out,
    property: 'opacity, transform',
    value: `opacity ${duration.slow} ${easing.out}, transform ${duration.slow} ${easing.out}`,
  },

  // Dropdown/Popover
  dropdown: {
    duration: duration.normal,
    easing: easing.out,
    property: 'opacity, transform',
    value: `opacity ${duration.normal} ${easing.out}, transform ${duration.normal} ${easing.out}`,
  },
} as const;

/**
 * Keyframe Animations
 * Reusable animation definitions
 */
export const keyframes = {
  // Fade in
  fadeIn: {
    name: 'fadeIn',
    definition: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },

  // Fade out
  fadeOut: {
    name: 'fadeOut',
    definition: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  },

  // Slide up
  slideUp: {
    name: 'slideUp',
    definition: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  },

  // Slide down
  slideDown: {
    name: 'slideDown',
    definition: {
      from: { transform: 'translateY(-10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  },

  // Slide in from left
  slideInLeft: {
    name: 'slideInLeft',
    definition: {
      from: { transform: 'translateX(-100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
  },

  // Slide in from right
  slideInRight: {
    name: 'slideInRight',
    definition: {
      from: { transform: 'translateX(100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
  },

  // Scale in (zoom in)
  scaleIn: {
    name: 'scaleIn',
    definition: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
  },

  // Scale out (zoom out)
  scaleOut: {
    name: 'scaleOut',
    definition: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.95)', opacity: 0 },
    },
  },

  // Bounce in
  bounceIn: {
    name: 'bounceIn',
    definition: {
      '0%': { transform: 'scale(0.3)', opacity: 0 },
      '50%': { transform: 'scale(1.05)' },
      '70%': { transform: 'scale(0.9)' },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
  },

  // Spin (loading spinner)
  spin: {
    name: 'spin',
    definition: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },

  // Pulse (attention grabber)
  pulse: {
    name: 'pulse',
    definition: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },

  // Shake (error indication)
  shake: {
    name: 'shake',
    definition: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
    },
  },

  // Wiggle (playful attention)
  wiggle: {
    name: 'wiggle',
    definition: {
      '0%, 100%': { transform: 'rotate(0deg)' },
      '25%': { transform: 'rotate(-3deg)' },
      '75%': { transform: 'rotate(3deg)' },
    },
  },

  // Skeleton shimmer (loading state)
  shimmer: {
    name: 'shimmer',
    definition: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
  },
} as const;

/**
 * Animation Presets
 * Complete animation configurations ready to apply
 */
export const animation = {
  // Fade animations
  fadeIn: `${keyframes.fadeIn.name} ${duration.normal} ${easing.out}`,
  fadeOut: `${keyframes.fadeOut.name} ${duration.normal} ${easing.in}`,

  // Slide animations
  slideUp: `${keyframes.slideUp.name} ${duration.normal} ${easing.out}`,
  slideDown: `${keyframes.slideDown.name} ${duration.normal} ${easing.out}`,
  slideInLeft: `${keyframes.slideInLeft.name} ${duration.slow} ${easing.out}`,
  slideInRight: `${keyframes.slideInRight.name} ${duration.slow} ${easing.out}`,

  // Scale animations
  scaleIn: `${keyframes.scaleIn.name} ${duration.normal} ${easing.out}`,
  scaleOut: `${keyframes.scaleOut.name} ${duration.normal} ${easing.in}`,

  // Special animations
  bounceIn: `${keyframes.bounceIn.name} ${duration.slow} ${easing.out}`,
  spin: `${keyframes.spin.name} 1s ${easing.linear} infinite`,
  pulse: `${keyframes.pulse.name} 2s ${easing.default} infinite`,
  shake: `${keyframes.shake.name} ${duration.slow} ${easing.default}`,
  wiggle: `${keyframes.wiggle.name} ${duration.normal} ${easing.default}`,
  shimmer: `${keyframes.shimmer.name} 2s ${easing.linear} infinite`,
} as const;

/**
 * Reduced Motion Support
 * Respect user preferences for reduced motion
 */
export const reducedMotion = {
  // Disable animations
  duration: duration.instant,
  easing: easing.linear,

  // Simple transitions only
  transition: {
    fade: `opacity ${duration.instant} ${easing.linear}`,
    color: `color ${duration.instant} ${easing.linear}`,
  },
} as const;

export type DurationToken = typeof duration;
export type EasingToken = typeof easing;
export type TransitionToken = typeof transition;
export type KeyframesToken = typeof keyframes;
export type AnimationToken = typeof animation;
