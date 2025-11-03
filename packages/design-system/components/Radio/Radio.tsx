/**
 * Radio Component
 *
 * Professional radio button with smooth animations.
 * Clean design, accessible, satisfying interaction.
 */

'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Radio Size
 */
export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * Radio Props
 */
export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Radio label
   */
  label?: string;

  /**
   * Helper text below label
   */
  helperText?: string;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Size
   * @default 'md'
   */
  size?: RadioSize;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Radio Component
 *
 * Professional radio with:
 * - Smooth scale animation on select
 * - Three sizes
 * - Error states
 * - Full accessibility
 * - Dark mode support
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      helperText,
      error = false,
      size = 'md',
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, resolvedColors } = useTheme();
    const isMobile = useIsMobile();

    // Size configurations - Mobile-First Design
    // Visual radio stays same size, but tap area is 44x44px minimum on mobile
    const sizeConfig = {
      sm: {
        radioSize: '16px',
        dotSize: '8px',
        tapArea: isMobile ? '44px' : '16px',  // Mobile: 44x44px tap area
        fontSize: theme.typography.sizes.sm.fontSize,
        gap: theme.spacing.xs,
      },
      md: {
        radioSize: '20px',
        dotSize: '10px',
        tapArea: isMobile ? '44px' : '20px',  // Mobile: 44x44px tap area
        fontSize: theme.typography.sizes.base.fontSize,
        gap: theme.spacing.sm,
      },
      lg: {
        radioSize: '24px',
        dotSize: '12px',
        tapArea: isMobile ? '48px' : '24px',  // Mobile: 48x48px tap area
        fontSize: theme.typography.sizes.lg.fontSize,
        gap: theme.spacing.md,
      },
    };

    const currentSize = sizeConfig[size];

    // Container styles - 2025 Professional Standards
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing.xs = 4px) ⭐ More breathing room
    };

    // Label container styles
    const labelContainerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',  // Align to top to prevent stretching radio ⭐
      gap: currentSize.gap,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    };

    // Radio wrapper styles - Mobile-First Design
    // Creates larger tap area on mobile (44x44px) while keeping visual radio small
    const radioWrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: currentSize.tapArea,       // Mobile: 44px, Desktop: matches radio size
      height: currentSize.tapArea,      // Mobile: 44px, Desktop: matches radio size
      minWidth: currentSize.tapArea,
      minHeight: currentSize.tapArea,
      maxWidth: currentSize.tapArea,    // Prevent stretching
      maxHeight: currentSize.tapArea,   // Prevent stretching
      flexShrink: 0,                    // Don't shrink in flex container
    };

    // Hidden input styles
    const hiddenInputStyles: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0,
    };

    // Custom radio styles
    const customRadioStyles: React.CSSProperties = {
      width: currentSize.radioSize,
      height: currentSize.radioSize,
      borderRadius: theme.radius.full,
      border: `2px solid ${
        error
          ? theme.colors.error[500]
          : props.checked
          ? theme.colors.primary[500]
          : resolvedColors.border.default
      }`,
      backgroundColor: resolvedColors.surface.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: `all ${theme.duration.fast} ${theme.easing.easeOut}`,
    };

    // Dot styles
    const dotStyles: React.CSSProperties = {
      width: currentSize.dotSize,
      height: currentSize.dotSize,
      borderRadius: theme.radius.full,
      backgroundColor: error ? theme.colors.error[500] : theme.colors.primary[500],
      transform: props.checked ? 'scale(1)' : 'scale(0)',
      transition: `transform ${theme.duration.fast} ${theme.easing.spring}`,
    };

    // Label text styles
    const labelTextStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: currentSize.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: resolvedColors.text.primary,
      lineHeight: '1.5',  // Normal line height for text (was currentSize.radioSize) ⭐
      userSelect: 'none',
    };

    // Helper text styles
    const helperTextStyles: React.CSSProperties = {
      fontSize: theme.typography.sizes.sm.fontSize,
      color: error ? theme.colors.error[500] : resolvedColors.text.secondary,
      marginLeft: `calc(${currentSize.tapArea} + ${currentSize.gap})`,  // Use tap area, not radio size
    };

    return (
      <div className={className} style={containerStyles}>
        <label style={labelContainerStyles}>
          <div style={radioWrapperStyles}>
            <input
              ref={ref}
              type="radio"
              disabled={disabled}
              style={hiddenInputStyles}
              {...props}
            />
            <div style={customRadioStyles}>
              <div style={dotStyles} />
            </div>
          </div>
          {label && <span style={labelTextStyles}>{label}</span>}
        </label>
        {helperText && <span style={helperTextStyles}>{helperText}</span>}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * RadioGroup Component
 * For managing multiple radios together
 */
export interface RadioGroupProps {
  /**
   * Selected value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Radio options
   */
  options: Array<{
    value: string;
    label: string;
    helperText?: string;
    disabled?: boolean;
  }>;

  /**
   * Group name (for HTML radio group)
   */
  name: string;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Size
   */
  size?: RadioSize;

  /**
   * Orientation
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Custom class name
   */
  className?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value,
      onChange,
      options,
      name,
      error = false,
      size = 'md',
      orientation = 'vertical',
      className,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      gap: orientation === 'vertical' ? theme.spacing.md : theme.spacing.xl,
      flexWrap: orientation === 'horizontal' ? 'wrap' : undefined,
    };

    return (
      <div ref={ref} className={className} style={containerStyles} role="radiogroup">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            helperText={option.helperText}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={option.disabled}
            error={error}
            size={size}
          />
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
