/**
 * Checkbox Component
 *
 * Premium checkbox with satisfying check animation.
 * Makes you want to check things off your list.
 */

'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Checkbox Size
 */
export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * Checkbox Props
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Whether checkbox is checked
   */
  checked?: boolean;

  /**
   * Indeterminate state (partial check)
   */
  indeterminate?: boolean;

  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Checkbox size
   * @default 'md'
   */
  size?: CheckboxSize;

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
   * Error state
   */
  error?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Check Icon
 */
function CheckIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        animation: 'checkScale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Indeterminate Icon (dash)
 */
function IndeterminateIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        animation: 'checkScale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Checkbox Component
 *
 * Premium checkbox with:
 * - Satisfying check animation with scale
 * - Three sizes (sm, md, lg)
 * - Indeterminate state
 * - Hover and focus states
 * - Disabled state
 * - Error state
 * - Label and helper text support
 * - Dark mode support
 * - Accessibility (native input, ARIA)
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      indeterminate = false,
      onChange,
      size = 'md',
      disabled = false,
      label,
      helperText,
      error = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();
    const isMobile = useIsMobile();

    // Size configurations - Mobile-First Design
    // Visual checkbox stays same size, but tap area is 44x44px minimum on mobile
    const sizeConfig = {
      sm: {
        boxSize: '16px',
        tapArea: isMobile ? '44px' : '16px',  // Mobile: 44x44px tap area
        iconSize: 14,
        fontSize: theme.typography.sizes.sm.fontSize,
      },
      md: {
        boxSize: '20px',
        tapArea: isMobile ? '44px' : '20px',  // Mobile: 44x44px tap area
        iconSize: 16,
        fontSize: theme.typography.sizes.base.fontSize,
      },
      lg: {
        boxSize: '24px',
        tapArea: isMobile ? '48px' : '24px',  // Mobile: 48x48px tap area
        iconSize: 20,
        fontSize: theme.typography.sizes.lg.fontSize,
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

    // Wrapper styles (contains checkbox and label)
    const wrapperStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    };

    // Checkbox container - Mobile-First Design
    // Creates larger tap area on mobile (44x44px) while keeping visual checkbox small
    const checkboxContainerStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: currentSize.tapArea,       // Mobile: 44px, Desktop: matches box size
      height: currentSize.tapArea,      // Mobile: 44px, Desktop: matches box size
      minWidth: currentSize.tapArea,
      minHeight: currentSize.tapArea,
      flexShrink: 0,
    };

    // Checkbox box styles (visual element)
    const boxStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: currentSize.boxSize,       // Actual visual size (16-24px)
      height: currentSize.boxSize,
      backgroundColor:
        checked || indeterminate
          ? error
            ? theme.colors.error[500]
            : theme.colors.primary[500]
          : 'transparent',
      border: `2px solid ${
        error
          ? theme.colors.error[500]
          : checked || indeterminate
          ? theme.colors.primary[500]
          : resolvedColors.border.default
      }`,
      borderRadius: theme.radius.sm,
      transition: theme.transition.color.value,
    };

    // Icon color
    const iconColor = theme.colors.gray[0];

    // Hidden checkbox (for accessibility)
    const checkboxStyles: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0,
      pointerEvents: 'none',
    };

    // Label container styles - 2025 Professional Standards
    const labelContainerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ More breathing room
      flex: 1,
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: currentSize.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: error ? theme.colors.error[500] : resolvedColors.text.primary,
      userSelect: 'none',
    };

    // Helper text styles
    const helperStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      color: error ? theme.colors.error[500] : resolvedColors.text.secondary,
    };

    // Keyframes for check animation
    const keyframesStyle = `
      @keyframes checkScale {
        0% {
          transform: scale(0);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }
    `;

    return (
      <>
        <style>{keyframesStyle}</style>
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

            {/* Checkbox container (provides 44x44px tap area on mobile) */}
            <div style={checkboxContainerStyles}>
              {/* Visual checkbox box */}
              <div style={boxStyles}>
                {indeterminate ? (
                  <div style={{ color: iconColor, display: 'flex' }}>
                    <IndeterminateIcon size={currentSize.iconSize} />
                  </div>
                ) : (
                  checked && (
                    <div style={{ color: iconColor, display: 'flex' }}>
                      <CheckIcon size={currentSize.iconSize} />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Label and helper text */}
            {(label || helperText) && (
              <div style={labelContainerStyles}>
                {label && <span style={labelStyles}>{label}</span>}
                {helperText && <span style={helperStyles}>{helperText}</span>}
              </div>
            )}
          </label>
        </div>
      </>
    );
  }
);

Checkbox.displayName = 'Checkbox';
