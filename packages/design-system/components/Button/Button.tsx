/**
 * Button Component
 *
 * Professional button with all states and variants.
 * Every detail matters - this separates amateur from professional.
 */

'use client';

import React, { forwardRef, ButtonHTMLAttributes, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { springConfigs, getAccessibleTransition } from '../../utils/animations';
import { haptics } from '../../utils/haptics';
import type { ColorScheme } from '../../theme/types';

/**
 * Button Variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Button Sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button Props
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Button variant - controls color and style
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Loading state - shows spinner and disables interaction
   */
  loading?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Icon to show before text
   */
  iconLeft?: React.ReactNode;

  /**
   * Icon to show after text
   */
  iconRight?: React.ReactNode;

  /**
   * Button content
   */
  children?: React.ReactNode;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Loading Spinner Component
 */
function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
    </svg>
  );
}

/**
 * Button Component
 *
 * Professional button with:
 * - Multiple variants (primary, secondary, ghost, danger)
 * - Three sizes (sm, md, lg)
 * - Loading state with spinner
 * - Disabled state
 * - Icon support (left and right)
 * - Smooth animations
 * - Proper accessibility
 * - Dark mode support
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      iconLeft,
      iconRight,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();
    const isMobile = useIsMobile();

    // Track if component is mounted (client-side) to prevent hydration mismatch
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Compute disabled state (disabled or loading)
    const isDisabled = disabled || loading;

    // Size configurations - 2025 Professional Standards with Mobile-First Design
    // Mobile: 44x44px minimum touch targets (Apple/Android requirement)
    // Desktop: Standard sizes with generous padding
    const sizeStyles = {
      sm: {
        padding: isMobile
          ? theme.spacing.component.button.mobile.sm   // 15px 20px (44px height)
          : theme.spacing.component.button.sm,          // 8px 16px (desktop)
        fontSize: theme.typography.sizes.sm.fontSize,   // 14px
        gap: theme.spacing.component.gap.xs,            // 8px
        iconSize: 14,
        spinnerSize: 14,
      },
      md: {
        padding: isMobile
          ? theme.spacing.component.button.mobile.md   // 14px 24px (46px height)
          : theme.spacing.component.button.md,          // 12px 24px (desktop)
        fontSize: theme.typography.sizes.base.fontSize, // 16px
        gap: theme.spacing.component.gap.sm,            // 12px
        iconSize: 16,
        spinnerSize: 16,
      },
      lg: {
        padding: theme.spacing.component.button.lg,     // 16px 32px (same for mobile/desktop)
        fontSize: theme.typography.sizes.lg.fontSize,   // 18px
        gap: theme.spacing.component.gap.sm,            // 12px
        iconSize: 20,
        spinnerSize: 20,
      },
    };

    const currentSize = sizeStyles[size];

    // Generate unique class name for this button instance
    const buttonClass = `button-${variant}-${size}-${isDark ? 'dark' : 'light'}-${isDisabled ? 'disabled' : 'enabled'}`;

    // Use correct shadow based on theme
    const shadow = isDark ? theme.shadows.dark : theme.shadows.light;

    // Get focus shadow
    const focusShadow = variant === 'danger'
      ? theme.shadows.focus.error.boxShadow
      : theme.shadows.focus.default.boxShadow;

    // Generate CSS with working pseudo-classes
    // (Inline styles don't support :hover, :active, :focus-visible)
    const buttonCSS = `
      .${buttonClass} {
        /* Layout */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${currentSize.gap};
        padding: ${currentSize.padding};
        width: ${fullWidth ? '100%' : 'auto'};

        /* Typography */
        font-family: ${theme.typography.fonts.primary};
        font-size: ${currentSize.fontSize};
        font-weight: ${theme.typography.weights.semibold};
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;

        /* Visual */
        border-radius: ${theme.componentRadius.button.default};
        outline: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        /* Interaction */
        transition: all ${theme.transition.button.value};
        cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
        opacity: ${isDisabled ? 0.5 : 1};

        /* Variant-specific base styles */
        ${variant === 'primary' ? `
          background-color: ${theme.colors.primary[500]};
          color: ${theme.colors.gray[0]};
          border: none;
          box-shadow: ${shadow.sm};
        ` : ''}

        ${variant === 'secondary' ? `
          background-color: ${isDark ? resolvedColors.surface.default : theme.colors.gray[100]};
          color: ${resolvedColors.text.primary};
          border: 1px solid ${resolvedColors.border.default};
          box-shadow: none;
        ` : ''}

        ${variant === 'ghost' ? `
          background-color: transparent;
          color: ${resolvedColors.text.primary};
          border: none;
          box-shadow: none;
        ` : ''}

        ${variant === 'danger' ? `
          background-color: ${theme.colors.error[500]};
          color: ${theme.colors.gray[0]};
          border: none;
          box-shadow: ${shadow.sm};
        ` : ''}
      }

      /* Hover state - ACTUALLY WORKS NOW! */
      .${buttonClass}:not(:disabled):hover {
        ${variant === 'primary' ? `
          background-color: ${theme.colors.primary[600]};
          box-shadow: ${shadow.md};
          transform: translateY(-1px);
        ` : ''}

        ${variant === 'secondary' ? `
          background-color: ${isDark ? resolvedColors.surface.hover : theme.colors.gray[200]};
          border-color: ${resolvedColors.border.emphasis};
        ` : ''}

        ${variant === 'ghost' ? `
          background-color: ${isDark ? resolvedColors.surface.hover : theme.colors.gray[100]};
        ` : ''}

        ${variant === 'danger' ? `
          background-color: ${theme.colors.error[600]};
          box-shadow: ${shadow.md};
          transform: translateY(-1px);
        ` : ''}
      }

      /* Active state - ACTUALLY WORKS NOW! */
      .${buttonClass}:not(:disabled):active {
        ${variant === 'primary' ? `
          background-color: ${theme.colors.primary[700]};
          transform: translateY(0);
          box-shadow: ${shadow.sm};
        ` : ''}

        ${variant === 'secondary' ? `
          background-color: ${isDark ? resolvedColors.surface.active : theme.colors.gray[300]};
        ` : ''}

        ${variant === 'ghost' ? `
          background-color: ${isDark ? resolvedColors.surface.active : theme.colors.gray[200]};
        ` : ''}

        ${variant === 'danger' ? `
          background-color: ${theme.colors.error[700]};
          transform: translateY(0);
          box-shadow: ${shadow.sm};
        ` : ''}
      }

      /* Focus-visible state (keyboard only) - WCAG 2.1 compliant */
      .${buttonClass}:focus-visible {
        box-shadow: ${focusShadow};
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
    `;

    // Handle click with haptic feedback
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        haptics.impact();
        props.onClick?.(e);
      }
    };

    // Spring animation config
    const transition = getAccessibleTransition('button');

    return (
      <>
        {/* Inject CSS with working pseudo-classes (client-side only to prevent hydration mismatch) */}
        {isMounted && (
          <style>
            {buttonCSS}
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        )}
        <motion.button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={`${buttonClass} ${className || ''}`}
          onClick={handleClick}
          // Spring-based press animation
          whileTap={isDisabled ? {} : { scale: 0.95 }}
          transition={transition}
          {...props}
        >
          {/* Loading spinner */}
          {loading && <Spinner size={currentSize.spinnerSize} />}

          {/* Left icon */}
          {!loading && iconLeft && (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {iconLeft}
            </span>
          )}

          {/* Button text */}
          {children && <span>{children}</span>}

          {/* Right icon */}
          {!loading && iconRight && (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {iconRight}
            </span>
          )}
        </motion.button>
      </>
    );
  }
);

Button.displayName = 'Button';
