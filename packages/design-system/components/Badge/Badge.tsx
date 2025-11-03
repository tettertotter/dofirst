/**
 * Badge Component
 *
 * Professional badge for status, labels, and counts.
 * Small but mighty - every pixel counts.
 */

'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Badge Variants
 */
export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * Badge Sizes
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge Shape
 */
export type BadgeShape = 'rounded' | 'pill';

/**
 * Badge Props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant - controls color scheme
   * @default 'primary'
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Badge shape
   * @default 'rounded'
   */
  shape?: BadgeShape;

  /**
   * Show as dot (minimal badge)
   */
  dot?: boolean;

  /**
   * Badge content
   */
  children?: React.ReactNode;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Badge Component
 *
 * Professional badge with:
 * - Six semantic variants
 * - Three sizes
 * - Two shapes (rounded, pill)
 * - Dot variant for minimal indicators
 * - Perfect typography and spacing
 * - Dark mode support
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'rounded',
      dot = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();

    // Size configurations - 2025 Professional Standards
    const sizeStyles = {
      sm: {
        height: dot ? '6px' : '20px',         // Increased from 18px ⭐
        padding: dot ? '0' : '2px 8px',       // Increased from 0 6px ⭐
        fontSize: theme.typography.sizes.xs.fontSize,
        lineHeight: theme.typography.sizes.xs.lineHeight,
        gap: theme.spacing.component.gap.xs,  // 8px (was spacing[1] = 4px) ⭐
        dotSize: '6px',
      },
      md: {
        height: dot ? '8px' : '24px',         // Increased from 20px ⭐
        padding: dot ? '0' : '4px 12px',      // Increased from 0 8px ⭐
        fontSize: theme.typography.sizes.xs.fontSize,
        lineHeight: theme.typography.sizes.xs.lineHeight,
        gap: theme.spacing.component.gap.xs,  // 8px (was spacing[1] = 4px) ⭐
        dotSize: '8px',
      },
      lg: {
        height: dot ? '10px' : '28px',        // Increased from 24px ⭐
        padding: dot ? '0' : '6px 16px',      // Increased from 0 10px ⭐
        fontSize: theme.typography.sizes.sm.fontSize,
        lineHeight: theme.typography.sizes.sm.lineHeight,
        gap: theme.spacing.component.gap.xs,  // 8px (was spacing[1] = 4px) ⭐
        dotSize: '10px',
      },
    };

    const currentSize = sizeStyles[size];

    // Variant color schemes
    const getVariantColors = () => {
      switch (variant) {
        case 'primary':
          return {
            background: isDark ? theme.colors.primary[900] : theme.colors.primary[100],
            color: isDark ? theme.colors.primary[100] : theme.colors.primary[700],
            border: isDark ? theme.colors.primary[700] : theme.colors.primary[200],
          };

        case 'secondary':
          return {
            background: isDark ? theme.colors.gray[800] : theme.colors.gray[100],
            color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            border: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
          };

        case 'success':
          return {
            background: isDark ? theme.colors.accent[900] : theme.colors.accent[100],
            color: isDark ? theme.colors.accent[100] : theme.colors.accent[700],
            border: isDark ? theme.colors.accent[700] : theme.colors.accent[200],
          };

        case 'warning':
          return {
            background: isDark ? theme.colors.warning[900] : theme.colors.warning[100],
            color: isDark ? theme.colors.warning[100] : theme.colors.warning[700],
            border: isDark ? theme.colors.warning[700] : theme.colors.warning[200],
          };

        case 'error':
          return {
            background: isDark ? theme.colors.error[900] : theme.colors.error[100],
            color: isDark ? theme.colors.error[100] : theme.colors.error[700],
            border: isDark ? theme.colors.error[700] : theme.colors.error[200],
          };

        case 'info':
          return {
            background: isDark ? theme.colors.info[900] : theme.colors.info[100],
            color: isDark ? theme.colors.info[100] : theme.colors.info[700],
            border: isDark ? theme.colors.info[700] : theme.colors.info[200],
          };

        default:
          return {
            background: theme.colors.gray[100],
            color: theme.colors.gray[700],
            border: theme.colors.gray[200],
          };
      }
    };

    const colors = getVariantColors();

    // Dot-specific styles
    if (dot) {
      const dotStyles: React.CSSProperties = {
        display: 'inline-block',
        width: currentSize.dotSize,
        height: currentSize.dotSize,
        borderRadius: theme.radius.full,
        backgroundColor: colors.color, // Use the main color for dots
        border: 'none',
        flexShrink: 0,
      };

      return <span ref={ref} style={dotStyles} className={className} {...props} />;
    }

    // Regular badge styles
    const baseStyles: React.CSSProperties = {
      // Layout
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: currentSize.gap,
      height: currentSize.height,
      padding: currentSize.padding,
      minWidth: currentSize.height, // Ensure circular for single characters

      // Typography
      fontFamily: theme.typography.fonts.primary,
      fontSize: currentSize.fontSize,
      fontWeight: theme.typography.weights.medium,
      lineHeight: '1',
      whiteSpace: 'nowrap',

      // Visual
      backgroundColor: colors.background,
      color: colors.color,
      border: `1px solid ${colors.border}`,
      borderRadius: shape === 'pill' ? theme.radius.full : theme.componentRadius.badge.default,
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    };

    return (
      <span ref={ref} style={baseStyles} className={className} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
