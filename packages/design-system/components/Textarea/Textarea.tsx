/**
 * Textarea Component
 *
 * Professional multiline text input with auto-resize.
 * Perfect for descriptions, comments, and long-form content.
 */

'use client';

import React, { forwardRef, TextareaHTMLAttributes, useRef, useEffect, useState, useId } from 'react';
import { useTheme } from '../../theme';

/**
 * Textarea Props
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Error state - shows error styling
   */
  error?: boolean;

  /**
   * Error message to display below textarea
   */
  errorMessage?: string;

  /**
   * Helper text to display below textarea
   */
  helperText?: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Auto-resize to fit content
   * @default true
   */
  autoResize?: boolean;

  /**
   * Minimum height (in pixels)
   */
  minHeight?: number;

  /**
   * Maximum height (in pixels)
   */
  maxHeight?: number;

  /**
   * Character limit
   */
  maxLength?: number;

  /**
   * Show character count
   * @default false
   */
  showCount?: boolean;

  /**
   * Full width textarea
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Custom class name for container
   */
  containerClassName?: string;

  /**
   * Custom class name for textarea element
   */
  className?: string;
}

/**
 * Textarea Component
 *
 * Professional textarea with:
 * - Auto-resize to fit content
 * - Character limit and counter
 * - Error state with message
 * - Helper text support
 * - Label support
 * - Min/max height constraints
 * - Focus states
 * - Disabled state
 * - Dark mode support
 * - Smooth animations
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error = false,
      errorMessage,
      helperText,
      label,
      autoResize = true,
      minHeight = 80,
      maxHeight = 400,
      maxLength,
      showCount = false,
      fullWidth = true,
      disabled = false,
      containerClassName,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');
    // Use React's useId for stable SSR-compatible IDs (replaces Math.random to fix hydration)
    const reactId = useId();
    const textareaId = `textarea-${reactId.replace(/:/g, '')}`;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Use controlled value if provided, otherwise internal state
    const currentValue = value !== undefined ? value : internalValue;
    const charCount = String(currentValue).length;

    // Auto-resize effect
    useEffect(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;

      // Reset height to get accurate scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height within min/max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }, [currentValue, autoResize, minHeight, maxHeight]);

    // Handle internal value change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    // Container styles - 2025 Professional Standards
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ More breathing room
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

    // Wrapper styles
    const wrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    };

    // Textarea styles
    const textareaStyles: React.CSSProperties = {
      width: '100%',
      minHeight: `${minHeight}px`,
      maxHeight: autoResize ? `${maxHeight}px` : undefined,
      padding: theme.spacing.md,
      backgroundColor: disabled
        ? resolvedColors.surface.disabled
        : resolvedColors.surface.default,
      border: `1px solid ${error
          ? theme.colors.error[500]
          : isFocused
            ? theme.colors.primary[500]
            : resolvedColors.border.default
        }`,
      borderRadius: theme.componentRadius.input.textarea,  // 16px (not pill - tall rectangles) ⭐
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.base.fontSize,
      lineHeight: theme.typography.sizes.base.lineHeight,
      color: disabled ? resolvedColors.text.disabled : resolvedColors.text.primary,
      resize: autoResize ? 'none' : 'vertical',
      outline: 'none',
      transition: theme.transition.color.value + ', ' + theme.transition.shadow.value,
      boxShadow: isFocused && !error ? theme.shadows.focus.default.boxShadow : 'none',
      cursor: disabled ? 'not-allowed' : 'text',
    };

    // Scrollbar styling (moved to <style> tag to fix hydration error)
    const scrollbarStyles = isDark ? `
      #${textareaId}::-webkit-scrollbar {
        width: 8px;
      }
      #${textareaId}::-webkit-scrollbar-track {
        background: ${theme.colors.dark.bg.secondary};
      }
      #${textareaId}::-webkit-scrollbar-thumb {
        background: ${theme.colors.dark.border.default};
        border-radius: ${theme.radius.sm};
      }
      #${textareaId}::-webkit-scrollbar-thumb:hover {
        background: ${theme.colors.dark.border.emphasis};
      }
    ` : '';

    // Footer styles (for helper text and character count) - 2025 Professional Standards
    const footerStyles: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,  // 16px - good spacing for footer items
      marginTop: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ More breathing room
    };

    // Helper/Error text styles
    const messageStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.xs.fontSize,
      color: error ? theme.colors.error[500] : resolvedColors.text.secondary,
      flex: 1,
    };

    // Character count styles
    const countStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.mono,
      fontSize: theme.typography.sizes.xs.fontSize,
      color:
        maxLength && charCount > maxLength
          ? theme.colors.error[500]
          : resolvedColors.text.tertiary,
      whiteSpace: 'nowrap',
    };

    return (
      <div style={containerStyles} className={containerClassName}>
        {/* Scrollbar styles (dark mode) */}
        {scrollbarStyles && <style>{scrollbarStyles}</style>}

        {/* Label */}
        {label && <label style={labelStyles}>{label}</label>}

        {/* Textarea wrapper */}
        <div style={wrapperStyles}>
          <textarea
            id={textareaId}
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            }}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            maxLength={maxLength}
            className={className}
            style={textareaStyles}
            {...props}
          />
        </div>

        {/* Footer (error/helper text and character count) */}
        {(errorMessage || helperText || showCount || maxLength) && (
          <div style={footerStyles}>
            {/* Helper/Error message */}
            <span style={messageStyles}>
              {error && errorMessage ? errorMessage : helperText || ''}
            </span>

            {/* Character count */}
            {(showCount || maxLength) && (
              <span style={countStyles}>
                {charCount}
                {maxLength && ` / ${maxLength}`}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
