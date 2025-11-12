/**
 * Input Component
 *
 * Professional text input with all states and features.
 * Attention to detail in every interaction.
 */

'use client';

import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { useTheme } from '../../theme';

/**
 * Input Sizes
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input Props
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Error state - shows error styling
   */
  error?: boolean;

  /**
   * Error message to display below input
   */
  errorMessage?: string;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Icon to show on the left
   */
  iconLeft?: React.ReactNode;

  /**
   * Icon to show on the right
   */
  iconRight?: React.ReactNode;

  /**
   * Show clear button when input has value
   */
  clearable?: boolean;

  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;

  /**
   * Full width input
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Custom class name for container
   */
  containerClassName?: string;

  /**
   * Custom class name for input element
   */
  className?: string;
}

/**
 * Clear Icon
 */
function ClearIcon({ size }: { size: number }) {
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
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/**
 * Input Component
 *
 * Professional input with:
 * - Three sizes (sm, md, lg)
 * - Error state with message
 * - Helper text support
 * - Label support
 * - Icon support (left and right)
 * - Clearable functionality
 * - Focus states
 * - Disabled state
 * - Dark mode support
 * - Smooth animations
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      helperText,
      label,
      iconLeft,
      iconRight,
      clearable = false,
      onClear,
      fullWidth = true,
      disabled = false,
      containerClassName,
      className,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    // Generate unique IDs for accessibility
    const inputId = id || `input-${React.useId()}`;
    const helperTextId = `${inputId}-helper`;
    const errorTextId = `${inputId}-error`;

    // Use controlled value if provided, otherwise internal state
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue && String(currentValue).length > 0;

    // Size configurations
    const sizeStyles = {
      sm: {
        height: '32px',
        padding: '0 12px',
        fontSize: theme.typography.sizes.sm.fontSize,
        iconSize: 14,
        gap: theme.spacing[1],
      },
      md: {
        height: '40px',
        padding: '0 16px',
        fontSize: theme.typography.sizes.base.fontSize,
        iconSize: 16,
        gap: theme.spacing[2],
      },
      lg: {
        height: '48px',
        padding: '0 20px',
        fontSize: theme.typography.sizes.lg.fontSize,
        iconSize: 18,
        gap: theme.spacing[2],
      },
    };

    const currentSize = sizeStyles[size];

    // Handle internal value change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    // Handle clear
    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('');
      }
      onClear?.();
    };

    // Container styles - 2025 Professional Standards
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],        // 8px (was spacing[1] = 4px) ⭐ More breathing room
      width: fullWidth ? '100%' : 'auto',
    };

    // Label styles - 2025 Professional Standards
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: error ? theme.colors.error[500] : resolvedColors.text.primary,
      marginBottom: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ Label needs space
    };

    // Input wrapper styles (contains icons and input)
    const wrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: currentSize.gap,
      height: currentSize.height,
      padding: currentSize.padding,
      backgroundColor: disabled
        ? resolvedColors.surface.disabled
        : resolvedColors.surface.default,
      border: `1px solid ${
        error
          ? theme.colors.error[500]
          : isFocused
          ? theme.colors.primary[500]
          : resolvedColors.border.default
      }`,
      borderRadius: theme.componentRadius.input.default,
      transition: theme.transition.color.value + ', ' + theme.transition.shadow.value,
      boxShadow: isFocused && !error ? theme.shadows.focus.default : 'none',
      cursor: disabled ? 'not-allowed' : 'text',
    };

    // Input element styles
    const inputStyles: React.CSSProperties = {
      flex: 1,
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontFamily: theme.typography.fonts.primary,
      fontSize: currentSize.fontSize,
      color: disabled ? resolvedColors.text.disabled : resolvedColors.text.primary,
      cursor: disabled ? 'not-allowed' : 'text',
      padding: 0,
    };

    // Icon styles
    const iconStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: error
        ? theme.colors.error[500]
        : disabled
        ? resolvedColors.text.disabled
        : resolvedColors.text.tertiary,
      flexShrink: 0,
    };

    // Helper/Error text styles - 2025 Professional Standards
    const messageStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.xs.fontSize,
      lineHeight: theme.typography.sizes.xs.lineHeight,  // Use proper line-height ⭐
      color: error ? theme.colors.error[500] : resolvedColors.text.secondary,
      marginTop: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ Helper text needs space
    };

    // Clear button styles
    const clearButtonStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing[1],
      border: 'none',
      backgroundColor: 'transparent',
      color: resolvedColors.text.tertiary,
      cursor: 'pointer',
      borderRadius: theme.radius.sm,
      transition: theme.transition.color.value,
      flexShrink: 0,
      ':hover': {
        color: resolvedColors.text.primary,
        backgroundColor: resolvedColors.surface.hover,
      },
    };

    // Determine aria-describedby value
    const describedBy = error && errorMessage
      ? errorTextId
      : helperText
      ? helperTextId
      : undefined;

    return (
      <div style={containerStyles} className={containerClassName}>
        {/* Label */}
        {label && <label htmlFor={inputId} style={labelStyles}>{label}</label>}

        {/* Input wrapper */}
        <div style={wrapperStyles} suppressHydrationWarning>
          {/* Left icon */}
          {iconLeft && (
            <span style={iconStyles}>
              {iconLeft}
            </span>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            aria-invalid={error}
            aria-describedby={describedBy}
            className={className}
            style={inputStyles}
            suppressHydrationWarning
            {...props}
          />

          {/* Clear button */}
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyles}
              aria-label="Clear input"
            >
              <ClearIcon size={currentSize.iconSize} />
            </button>
          )}

          {/* Right icon */}
          {iconRight && !clearable && (
            <span style={iconStyles}>
              {iconRight}
            </span>
          )}
        </div>

        {/* Error message or helper text */}
        {(errorMessage || helperText) && (
          <span
            id={error && errorMessage ? errorTextId : helperTextId}
            style={messageStyles}
          >
            {error && errorMessage ? errorMessage : helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
