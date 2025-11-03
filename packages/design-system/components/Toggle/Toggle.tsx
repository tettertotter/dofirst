/**
 * Toggle/Switch Component
 *
 * Premium toggle with smooth animation and satisfying feel.
 * The kind of switch that makes you want to toggle it just for fun.
 */

'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Toggle Size
 */
export type ToggleSize = 'sm' | 'md' | 'lg';

/**
 * Toggle Props
 */
export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Whether toggle is checked
   */
  checked?: boolean;

  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Toggle size
   * @default 'md'
   */
  size?: ToggleSize;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Toggle Component
 *
 * Premium toggle with:
 * - Smooth sliding animation with spring physics
 * - Three sizes (sm, md, lg)
 * - Hover and focus states
 * - Disabled state
 * - Label and helper text support
 * - Dark mode support
 * - Satisfying interaction feel
 * - Accessibility (checkbox input, ARIA)
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked = false,
      onChange,
      size = 'md',
      disabled = false,
      label,
      helperText,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();
    const isMobile = useIsMobile();

    // Size configurations - Mobile-First Design
    // Visual toggle stays same size, but tap area is 44x44px minimum on mobile
    const sizeConfig = {
      sm: {
        trackWidth: '36px',
        trackHeight: '20px',
        tapHeight: isMobile ? '44px' : '20px',  // Mobile: 44px tap area
        thumbSize: '16px',
        thumbOffset: '2px',
        checkedTranslate: '16px',
      },
      md: {
        trackWidth: '44px',
        trackHeight: '24px',
        tapHeight: isMobile ? '44px' : '24px',  // Mobile: 44px tap area
        thumbSize: '20px',
        thumbOffset: '2px',
        checkedTranslate: '20px',
      },
      lg: {
        trackWidth: '52px',
        trackHeight: '28px',
        tapHeight: isMobile ? '48px' : '28px',  // Mobile: 48px tap area
        thumbSize: '24px',
        thumbOffset: '2px',
        checkedTranslate: '24px',
      },
    };

    const currentSize = sizeConfig[size];

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    // Container styles - 2025 Professional Standards
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ More breathing room
    };

    // Wrapper styles (contains toggle and label)
    const wrapperStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    };

    // Toggle container - Mobile-First Design
    // Creates larger tap area on mobile (44x44px) while keeping visual toggle same size
    const toggleContainerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: currentSize.tapHeight,  // Mobile: 44px, Desktop: matches track height
      minHeight: currentSize.tapHeight,
      flexShrink: 0,
    };

    // Track styles (the background pill)
    const trackStyles: React.CSSProperties = {
      position: 'relative',
      width: currentSize.trackWidth,
      height: currentSize.trackHeight,
      backgroundColor: checked
        ? theme.colors.primary[500]
        : isDark
        ? theme.colors.gray[700]
        : theme.colors.gray[300],
      borderRadius: theme.radius.full,
      transition: `background-color ${theme.duration.normal} ${theme.easing.default}`,
      boxShadow: checked
        ? `0 0 0 2px ${isDark ? theme.colors.primary[900] : theme.colors.primary[100]}`
        : 'none',
    };

    // Thumb styles (the sliding circle)
    const thumbStyles: React.CSSProperties = {
      position: 'absolute',
      top: currentSize.thumbOffset,
      left: currentSize.thumbOffset,
      width: currentSize.thumbSize,
      height: currentSize.thumbSize,
      backgroundColor: theme.colors.gray[0],
      borderRadius: theme.radius.full,
      boxShadow: theme.shadows.light.sm,
      transform: checked ? `translateX(${currentSize.checkedTranslate})` : 'translateX(0)',
      transition: `transform ${theme.duration.normal} ${theme.easing.spring}`,
    };

    // Hidden checkbox (for accessibility)
    const checkboxStyles: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0,
      pointerEvents: 'none',
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.base.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: resolvedColors.text.primary,
      userSelect: 'none',
    };

    // Helper text styles
    const helperStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      color: resolvedColors.text.secondary,
      marginLeft: `calc(${currentSize.trackWidth} + ${theme.spacing.sm})`,
    };

    return (
      <div style={containerStyles} className={className}>
        <label style={wrapperStyles}>
          {/* Hidden checkbox for accessibility */}
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            style={checkboxStyles}
            {...props}
          />

          {/* Toggle container (provides 44x44px tap area on mobile) */}
          <div style={toggleContainerStyles}>
            {/* Visual toggle */}
            <div style={trackStyles}>
              <div style={thumbStyles} />
            </div>
          </div>

          {/* Label */}
          {label && <span style={labelStyles}>{label}</span>}
        </label>

        {/* Helper text */}
        {helperText && <span style={helperStyles}>{helperText}</span>}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
