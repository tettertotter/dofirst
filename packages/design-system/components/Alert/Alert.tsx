/**
 * Alert Component
 *
 * Premium alert for important messages and feedback.
 * Clear, actionable, never annoying.
 */

'use client';

import React, { forwardRef, HTMLAttributes, useState } from 'react';
import { useTheme } from '../../theme';

/**
 * Alert Variant
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Alert Props
 */
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Alert variant
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Alert title
   */
  title?: string;

  /**
   * Alert message/description
   */
  children: React.ReactNode;

  /**
   * Show close button
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;

  /**
   * Action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Custom icon (overrides default variant icon)
   */
  icon?: React.ReactNode;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Info Icon
 */
function InfoIcon({ size }: { size: number }) {
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
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/**
 * Success Icon
 */
function SuccessIcon({ size }: { size: number }) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/**
 * Warning Icon
 */
function WarningIcon({ size }: { size: number }) {
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
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Error Icon
 */
function ErrorIcon({ size }: { size: number }) {
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
 * Close Icon
 */
function CloseIcon({ size }: { size: number }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Alert Component
 *
 * Premium alert with:
 * - Four variants (info, success, warning, error)
 * - Optional title and description
 * - Dismissible with smooth exit animation
 * - Action button support
 * - Automatic icons for each variant
 * - Custom icon support
 * - Dark mode support
 * - Accessibility (role="alert", ARIA)
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      children,
      dismissible = false,
      onDismiss,
      action,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    // Get variant configuration
    const getVariantConfig = () => {
      const iconSize = 20;

      switch (variant) {
        case 'info':
          return {
            icon: icon || <InfoIcon size={iconSize} />,
            bg: isDark ? theme.colors.info[900] : theme.colors.info[50],
            border: isDark ? theme.colors.info[700] : theme.colors.info[200],
            text: isDark ? theme.colors.info[100] : theme.colors.info[900],
            iconColor: isDark ? theme.colors.info[400] : theme.colors.info[600],
          };
        case 'success':
          return {
            icon: icon || <SuccessIcon size={iconSize} />,
            bg: isDark ? theme.colors.accent[900] : theme.colors.accent[50],
            border: isDark ? theme.colors.accent[700] : theme.colors.accent[200],
            text: isDark ? theme.colors.accent[100] : theme.colors.accent[900],
            iconColor: isDark ? theme.colors.accent[400] : theme.colors.accent[600],
          };
        case 'warning':
          return {
            icon: icon || <WarningIcon size={iconSize} />,
            bg: isDark ? theme.colors.warning[900] : theme.colors.warning[50],
            border: isDark ? theme.colors.warning[700] : theme.colors.warning[200],
            text: isDark ? theme.colors.warning[100] : theme.colors.warning[900],
            iconColor: isDark ? theme.colors.warning[400] : theme.colors.warning[600],
          };
        case 'error':
          return {
            icon: icon || <ErrorIcon size={iconSize} />,
            bg: isDark ? theme.colors.error[900] : theme.colors.error[50],
            border: isDark ? theme.colors.error[700] : theme.colors.error[200],
            text: isDark ? theme.colors.error[100] : theme.colors.error[900],
            iconColor: isDark ? theme.colors.error[400] : theme.colors.error[600],
          };
      }
    };

    const config = getVariantConfig();

    // Handle dismiss
    const handleDismiss = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 200);
    };

    // Don't render if dismissed
    if (!isVisible) return null;

    // Container styles - 2025 Professional Standards
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      gap: theme.spacing.component.gap.md,  // 16px gap ⭐
      padding: theme.spacing.component.card.md,  // 24px padding ⭐
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: theme.componentRadius.alert.default,  // 16px rounded ⭐
      animation: isExiting
        ? `alertSlideOut ${theme.duration.fast} ${theme.easing.in}`
        : `alertSlideIn ${theme.duration.normal} ${theme.easing.out}`,
    };

    // Icon container styles
    const iconContainerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      color: config.iconColor,
      flexShrink: 0,
      paddingTop: title ? '2px' : '0', // Align with first line of text
    };

    // Content container styles - 2025 Professional Standards
    const contentStyles: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ Better breathing room
    };

    // Title styles
    const titleStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.base.fontSize,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.sizes.base.lineHeight,
      color: config.text,
      margin: 0,
    };

    // Message styles
    const messageStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      lineHeight: theme.typography.sizes.sm.lineHeight,
      color: config.text,
      margin: 0,
      opacity: title ? 0.9 : 1,
    };

    // Actions container styles
    const actionsStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: action ? theme.spacing.xs : 0,
    };

    // Action button styles - 2025 Professional Standards
    const actionButtonStyles: React.CSSProperties = {
      padding: theme.spacing.component.button.sm,  // 8px 16px - proper button padding ⭐
      border: `1px solid ${config.border}`,
      borderRadius: theme.componentRadius.button.default,  // Pill-shaped like other buttons ⭐
      backgroundColor: 'transparent',
      color: config.text,
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      fontWeight: theme.typography.weights.semibold,
      cursor: 'pointer',
      transition: theme.transition.color.value,
    };

    // Close button styles - 2025 Professional Standards
    const closeButtonStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing[1],  // 4px - small icon button
      border: 'none',
      borderRadius: theme.radius.md,  // 8px for small interactive element ⭐
      backgroundColor: 'transparent',
      color: config.text,
      opacity: 0.7,
      cursor: 'pointer',
      transition: theme.transition.color.value,
      flexShrink: 0,
    };

    // Keyframes
    const keyframesStyle = `
      @keyframes alertSlideIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes alertSlideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-8px);
        }
      }
    `;

    return (
      <>
        <style>{keyframesStyle}</style>
        <div
          ref={ref}
          role="alert"
          className={className}
          style={containerStyles}
          {...props}
        >
          {/* Icon */}
          <div style={iconContainerStyles}>{config.icon}</div>

          {/* Content */}
          <div style={contentStyles}>
            {/* Title */}
            {title && <div style={titleStyles}>{title}</div>}

            {/* Message */}
            <div style={messageStyles}>{children}</div>

            {/* Actions */}
            {action && (
              <div style={actionsStyles}>
                <button type="button" onClick={action.onClick} style={actionButtonStyles}>
                  {action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              style={closeButtonStyles}
              aria-label="Dismiss alert"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      </>
    );
  }
);

Alert.displayName = 'Alert';
