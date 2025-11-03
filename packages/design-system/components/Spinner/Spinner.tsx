/**
 * Spinner/Loader Component
 *
 * Professional loading spinner with smooth animation.
 * Perfect for loading states and async operations.
 */

'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Spinner Size
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spinner Variant
 */
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

/**
 * Spinner Props
 */
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Spinner variant
   * @default 'primary'
   */
  variant?: SpinnerVariant;

  /**
   * Loading text label
   */
  label?: string;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Spinner Component
 *
 * Professional spinner with:
 * - Five sizes (xs to xl)
 * - Three variants (primary, secondary, white)
 * - Smooth rotation animation
 * - Optional loading label
 * - Dark mode support
 * - Accessibility (ARIA live region)
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', variant = 'primary', label, className, ...props }, ref) => {
    const { theme, isDark, resolvedColors } = useTheme();

    // Size configurations
    const sizeConfig = {
      xs: {
        size: '16px',
        strokeWidth: '3px',
      },
      sm: {
        size: '20px',
        strokeWidth: '3px',
      },
      md: {
        size: '24px',
        strokeWidth: '3px',
      },
      lg: {
        size: '32px',
        strokeWidth: '3px',
      },
      xl: {
        size: '48px',
        strokeWidth: '4px',
      },
    };

    const currentSize = sizeConfig[size];

    // Get color based on variant
    const getColor = () => {
      switch (variant) {
        case 'primary':
          return theme.colors.primary[500];
        case 'secondary':
          return resolvedColors.text.tertiary;
        case 'white':
          return theme.colors.gray[0];
        default:
          return theme.colors.primary[500];
      }
    };

    const color = getColor();

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing.sm,
    };

    // Spinner wrapper styles
    const spinnerStyles: React.CSSProperties = {
      display: 'inline-block',
      width: currentSize.size,
      height: currentSize.size,
      animation: `spin 1s linear infinite`,
    };

    // Circle styles
    const circleStyles: React.CSSProperties = {
      stroke: color,
      strokeWidth: currentSize.strokeWidth,
      strokeLinecap: 'round',
      fill: 'none',
      strokeDasharray: '80',
      strokeDashoffset: '60',
      animation: 'spinnerDash 1.5s ease-in-out infinite',
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      color: resolvedColors.text.secondary,
    };

    // Keyframes for animations
    const keyframesStyle = `
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes spinnerDash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }
    `;

    return (
      <>
        <style>{keyframesStyle}</style>
        <div
          ref={ref}
          className={className}
          style={containerStyles}
          role="status"
          aria-live="polite"
          aria-label={label || 'Loading'}
          {...props}
        >
          <div style={spinnerStyles}>
            <svg viewBox="0 0 50 50" width="100%" height="100%">
              <circle cx="25" cy="25" r="20" style={circleStyles} />
            </svg>
          </div>

          {label && <span style={labelStyles}>{label}</span>}
        </div>
      </>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Full Page Spinner Component
 * For page-level loading states
 */
export interface FullPageSpinnerProps {
  /**
   * Loading label
   */
  label?: string;

  /**
   * Custom class name
   */
  className?: string;
}

export const FullPageSpinner = forwardRef<HTMLDivElement, FullPageSpinnerProps>(
  ({ label = 'Loading...', className }, ref) => {
    const { theme, resolvedColors } = useTheme();

    const containerStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      backgroundColor: resolvedColors.bg.primary,
      zIndex: theme.zIndex.modal,
    };

    return (
      <div ref={ref} className={className} style={containerStyles}>
        <Spinner size="xl" label={label} />
      </div>
    );
  }
);

FullPageSpinner.displayName = 'FullPageSpinner';
