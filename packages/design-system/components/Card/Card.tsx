/**
 * Card Component
 *
 * Professional card container for grouping content.
 * Subtle elevation and perfect spacing.
 */

'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Card Variants
 */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/**
 * Card Padding
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card Props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Card padding
   * @default 'md'
   */
  padding?: CardPadding;

  /**
   * Make card interactive (adds hover state)
   */
  interactive?: boolean;

  /**
   * Click handler (makes card interactive automatically)
   */
  onClick?: () => void;

  /**
   * Card content
   */
  children?: React.ReactNode;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Card Component
 *
 * Professional card with:
 * - Three variants (default, outlined, elevated)
 * - Flexible padding options
 * - Interactive mode with hover states
 * - Dark mode support
 * - Smooth transitions
 * - Proper accessibility
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      onClick,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();

    // Card is interactive if onClick is provided
    const isInteractive = interactive || !!onClick;

    // Padding configurations
    const paddingStyles = {
      none: '0',
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
    };

    // Variant styles
    const getVariantStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        backgroundColor: resolvedColors.surface.default,
        borderRadius: theme.componentRadius.card.default,
        transition:
          theme.transition.color.value +
          ', ' +
          theme.transition.shadow.value +
          ', ' +
          theme.transition.transform.value,
      };

      switch (variant) {
        case 'default':
          return {
            ...baseStyles,
            border: 'none',
            boxShadow: 'none',
          };

        case 'outlined':
          return {
            ...baseStyles,
            border: `1px solid ${resolvedColors.border.default}`,
            boxShadow: 'none',
          };

        case 'elevated':
          return {
            ...baseStyles,
            border: 'none',
            boxShadow: isDark ? theme.shadows.dark.md : theme.shadows.light.md,
          };

        default:
          return baseStyles;
      }
    };

    // Interactive hover states
    const getHoverStyles = (): React.CSSProperties => {
      if (!isInteractive) return {};

      switch (variant) {
        case 'default':
          return {
            backgroundColor: resolvedColors.surface.hover,
          };

        case 'outlined':
          return {
            backgroundColor: resolvedColors.surface.hover,
            borderColor: resolvedColors.border.emphasis,
          };

        case 'elevated':
          return {
            boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
            transform: 'translateY(-2px)',
          };

        default:
          return {};
      }
    };

    // Active/pressed states
    const getActiveStyles = (): React.CSSProperties => {
      if (!isInteractive) return {};

      switch (variant) {
        case 'default':
          return {
            backgroundColor: resolvedColors.surface.active,
          };

        case 'outlined':
          return {
            backgroundColor: resolvedColors.surface.active,
          };

        case 'elevated':
          return {
            boxShadow: isDark ? theme.shadows.dark.sm : theme.shadows.light.sm,
            transform: 'translateY(0)',
          };

        default:
          return {};
      }
    };

    const variantStyles = getVariantStyles();

    // Base styles
    const baseStyles: React.CSSProperties = {
      // Layout
      display: 'flex',
      flexDirection: 'column',
      padding: paddingStyles[padding],

      // Variant styles
      ...variantStyles,

      // Interactive styles
      cursor: isInteractive ? 'pointer' : 'default',
      userSelect: isInteractive ? 'none' : 'auto',
      WebkitTapHighlightColor: 'transparent',

      // Accessibility
      outline: 'none',
    };

    // Handle click
    const handleClick = () => {
      if (isInteractive && onClick) {
        onClick();
      }
    };

    // Handle keyboard interaction
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
        style={baseStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 * For consistent header styling within cards
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Header title
   */
  title?: string;

  /**
   * Header description/subtitle
   */
  description?: string;

  /**
   * Action element (button, menu, etc.)
   */
  action?: React.ReactNode;

  /**
   * Children (replaces title/description if provided)
   */
  children?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, action, children, ...props }, ref) => {
    const { theme, resolvedColors } = useTheme();

    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    };

    const contentStyles: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],  // 8px (was spacing[1] = 4px) ⭐ Title/description need breathing room
    };

    const titleStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.lg.fontSize,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.sizes.lg.lineHeight,
      color: resolvedColors.text.primary,
      margin: 0,
    };

    const descriptionStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      lineHeight: theme.typography.sizes.sm.lineHeight,
      color: resolvedColors.text.secondary,
      margin: 0,
    };

    return (
      <div ref={ref} style={headerStyles} {...props}>
        {children || (
          <>
            <div style={contentStyles}>
              {title && <h3 style={titleStyles}>{title}</h3>}
              {description && <p style={descriptionStyles}>{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Content Component
 * For consistent content spacing within cards
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, ...props }, ref) => {
    const { theme } = useTheme();

    const contentStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.md,
    };

    return (
      <div ref={ref} style={contentStyles} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 * For consistent footer styling within cards
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, ...props }, ref) => {
    const { theme, resolvedColors } = useTheme();

    const footerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTop: `1px solid ${resolvedColors.border.subtle}`,
    };

    return (
      <div ref={ref} style={footerStyles} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
