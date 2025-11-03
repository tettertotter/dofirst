/**
 * Progress Component
 *
 * Premium progress indicators with smooth animations.
 * Linear and circular variants for different contexts.
 */

'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Progress Variant
 */
export type ProgressVariant = 'primary' | 'success' | 'warning' | 'error';

/**
 * Progress Size (for circular)
 */
export type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Linear Progress Props
 */
export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   * If undefined, shows indeterminate animation
   */
  value?: number;

  /**
   * Progress variant
   * @default 'primary'
   */
  variant?: ProgressVariant;

  /**
   * Height of progress bar
   * @default '4px'
   */
  height?: string;

  /**
   * Show label with percentage
   * @default false
   */
  showLabel?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Circular Progress Props
 */
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   * If undefined, shows indeterminate animation
   */
  value?: number;

  /**
   * Progress variant
   * @default 'primary'
   */
  variant?: ProgressVariant;

  /**
   * Size
   * @default 'md'
   */
  size?: ProgressSize;

  /**
   * Stroke width
   */
  strokeWidth?: number;

  /**
   * Show label with percentage
   * @default false
   */
  showLabel?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Linear Progress Component
 *
 * Premium linear progress with:
 * - Determinate and indeterminate modes
 * - Four color variants
 * - Smooth animations
 * - Optional percentage label
 * - Dark mode support
 * - Accessibility (ARIA)
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    {
      value,
      variant = 'primary',
      height = '4px',
      showLabel = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();

    const isIndeterminate = value === undefined;
    const percentage = Math.min(100, Math.max(0, value || 0));

    // Get variant color
    const getColor = () => {
      switch (variant) {
        case 'primary':
          return theme.colors.primary[500];
        case 'success':
          return theme.colors.accent[500];
        case 'warning':
          return theme.colors.warning[500];
        case 'error':
          return theme.colors.error[500];
      }
    };

    const color = getColor();

    // Container styles - 2025 Professional Standards
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing.xs = 4px) ⭐ More breathing room
      width: '100%',
    };

    // Track styles
    const trackStyles: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      height,
      backgroundColor: isDark ? resolvedColors.surface.hover : theme.colors.gray[200],
      borderRadius: theme.radius.full,
      overflow: 'hidden',
    };

    // Bar styles
    const barStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      backgroundColor: color,
      borderRadius: theme.radius.full,
      transition: isIndeterminate ? 'none' : `width ${theme.duration.normal} ${theme.easing.default}`,
      width: isIndeterminate ? '30%' : `${percentage}%`,
      animation: isIndeterminate
        ? `linearIndeterminate 1.5s ${theme.easing.default} infinite`
        : undefined,
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: resolvedColors.text.secondary,
      textAlign: 'right',
    };

    // Keyframes
    const keyframesStyle = `
      @keyframes linearIndeterminate {
        0% {
          left: -30%;
        }
        100% {
          left: 100%;
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
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          {...props}
        >
          <div style={trackStyles}>
            <div style={barStyles} />
          </div>

          {showLabel && !isIndeterminate && (
            <span style={labelStyles}>{percentage}%</span>
          )}
        </div>
      </>
    );
  }
);

LinearProgress.displayName = 'LinearProgress';

/**
 * Circular Progress Component
 *
 * Premium circular progress with:
 * - Determinate and indeterminate modes
 * - Four color variants
 * - Multiple sizes
 * - Smooth animations
 * - Optional percentage label
 * - Dark mode support
 * - Accessibility (ARIA)
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      variant = 'primary',
      size = 'md',
      strokeWidth,
      showLabel = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();

    const isIndeterminate = value === undefined;
    const percentage = Math.min(100, Math.max(0, value || 0));

    // Size configurations
    const sizeConfig = {
      sm: {
        size: 32,
        strokeWidth: strokeWidth || 3,
        fontSize: theme.typography.sizes.xs.fontSize,
      },
      md: {
        size: 48,
        strokeWidth: strokeWidth || 4,
        fontSize: theme.typography.sizes.sm.fontSize,
      },
      lg: {
        size: 64,
        strokeWidth: strokeWidth || 4,
        fontSize: theme.typography.sizes.base.fontSize,
      },
      xl: {
        size: 96,
        strokeWidth: strokeWidth || 5,
        fontSize: theme.typography.sizes.lg.fontSize,
      },
    };

    const config = sizeConfig[size];
    const radius = (config.size - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate ? circumference * 0.75 : circumference * (1 - percentage / 100);

    // Get variant color
    const getColor = () => {
      switch (variant) {
        case 'primary':
          return theme.colors.primary[500];
        case 'success':
          return theme.colors.accent[500];
        case 'warning':
          return theme.colors.warning[500];
        case 'error':
          return theme.colors.error[500];
      }
    };

    const color = getColor();

    // Container styles
    const containerStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${config.size}px`,
      height: `${config.size}px`,
    };

    // SVG styles
    const svgStyles: React.CSSProperties = {
      transform: 'rotate(-90deg)',
      animation: isIndeterminate
        ? `circularRotate 1.4s linear infinite`
        : undefined,
    };

    // Circle styles
    const circleStyles: React.CSSProperties = {
      transition: isIndeterminate ? 'none' : `stroke-dashoffset ${theme.duration.normal} ${theme.easing.default}`,
      animation: isIndeterminate
        ? `circularDash 1.4s ease-in-out infinite`
        : undefined,
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      position: 'absolute',
      fontFamily: theme.typography.fonts.primary,
      fontSize: config.fontSize,
      fontWeight: theme.typography.weights.semibold,
      color: resolvedColors.text.primary,
    };

    // Keyframes
    const keyframesStyle = `
      @keyframes circularRotate {
        0% {
          transform: rotate(-90deg);
        }
        100% {
          transform: rotate(270deg);
        }
      }

      @keyframes circularDash {
        0% {
          stroke-dasharray: 1, ${circumference};
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: ${circumference * 0.75}, ${circumference};
          stroke-dashoffset: -${circumference * 0.25};
        }
        100% {
          stroke-dasharray: ${circumference * 0.75}, ${circumference};
          stroke-dashoffset: -${circumference};
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
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          {...props}
        >
          <svg
            width={config.size}
            height={config.size}
            style={svgStyles}
          >
            {/* Background circle */}
            <circle
              cx={config.size / 2}
              cy={config.size / 2}
              r={radius}
              fill="none"
              stroke={isDark ? resolvedColors.surface.hover : theme.colors.gray[200]}
              strokeWidth={config.strokeWidth}
            />

            {/* Progress circle */}
            <circle
              cx={config.size / 2}
              cy={config.size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={config.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={circleStyles}
            />
          </svg>

          {showLabel && !isIndeterminate && (
            <span style={labelStyles}>{percentage}%</span>
          )}
        </div>
      </>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';
