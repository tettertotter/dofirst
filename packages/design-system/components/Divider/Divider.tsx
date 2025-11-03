/**
 * Divider Component
 *
 * Premium divider for visual separation.
 * Simple, elegant, purposeful.
 */

'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Divider Orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider Variant
 */
export type DividerVariant = 'solid' | 'dashed';

/**
 * Divider Props
 */
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Divider orientation
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;

  /**
   * Divider variant
   * @default 'solid'
   */
  variant?: DividerVariant;

  /**
   * Label/text in the middle of divider
   */
  label?: string;

  /**
   * Spacing around divider
   */
  spacing?: string;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Divider Component
 *
 * Premium divider with:
 * - Horizontal and vertical orientations
 * - Solid and dashed variants
 * - Optional label in the middle
 * - Flexible spacing
 * - Dark mode support
 * - Accessibility (role="separator")
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      label,
      spacing,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, resolvedColors } = useTheme();

    const isHorizontal = orientation === 'horizontal';

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: isHorizontal ? '100%' : 'auto',
      height: isHorizontal ? 'auto' : '100%',
      margin: spacing || (isHorizontal ? `${theme.spacing.lg} 0` : `0 ${theme.spacing.lg}`),
      flexDirection: isHorizontal ? 'row' : 'column',
      gap: label ? theme.spacing.md : 0,
    };

    // Line styles
    const lineStyles: React.CSSProperties = {
      flex: 1,
      border: 'none',
      borderTop: isHorizontal
        ? `1px ${variant} ${resolvedColors.border.default}`
        : 'none',
      borderLeft: !isHorizontal
        ? `1px ${variant} ${resolvedColors.border.default}`
        : 'none',
      margin: 0,
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: resolvedColors.text.tertiary,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    };

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={className}
        style={containerStyles}
        {...props}
      >
        {/* Line before label (or full line if no label) */}
        <div style={lineStyles} />

        {/* Label */}
        {label && <span style={labelStyles}>{label}</span>}

        {/* Line after label */}
        {label && <div style={lineStyles} />}
      </div>
    );
  }
);

Divider.displayName = 'Divider';
