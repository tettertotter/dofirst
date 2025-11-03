/**
 * Avatar Component
 *
 * Professional avatar with initials fallback and status indicators.
 * Perfect user representation with every detail polished.
 */

'use client';

import React, { forwardRef, ImgHTMLAttributes, useState } from 'react';
import { useTheme } from '../../theme';

/**
 * Avatar Size
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Avatar Status
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * Avatar Props
 */
export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /**
   * Image source URL
   */
  src?: string;

  /**
   * Alt text for image
   */
  alt?: string;

  /**
   * Name for initials fallback
   */
  name?: string;

  /**
   * Avatar size
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Status indicator
   */
  status?: AvatarStatus;

  /**
   * Custom background color for initials
   */
  color?: string;

  /**
   * Square shape instead of circle
   */
  square?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate consistent color from name
 */
function getColorFromName(name: string): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Avatar Component
 *
 * Professional avatar with:
 * - Six sizes (xs to 2xl)
 * - Image support with graceful fallback
 * - Initials fallback (auto-generated from name)
 * - Status indicator (online, offline, away, busy)
 * - Consistent color generation from name
 * - Square or circle shape
 * - Dark mode support
 * - Accessibility (alt text, ARIA)
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      status,
      color,
      square = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, resolvedColors } = useTheme();
    const [imageError, setImageError] = useState(false);

    // Size configurations
    const sizeConfig = {
      xs: {
        size: '24px',
        fontSize: theme.typography.sizes.xs.fontSize,
        statusSize: '6px',
        statusBorder: '2px',
      },
      sm: {
        size: '32px',
        fontSize: theme.typography.sizes.sm.fontSize,
        statusSize: '8px',
        statusBorder: '2px',
      },
      md: {
        size: '40px',
        fontSize: theme.typography.sizes.base.fontSize,
        statusSize: '10px',
        statusBorder: '2px',
      },
      lg: {
        size: '48px',
        fontSize: theme.typography.sizes.lg.fontSize,
        statusSize: '12px',
        statusBorder: '2px',
      },
      xl: {
        size: '64px',
        fontSize: theme.typography.sizes.xl.fontSize,
        statusSize: '14px',
        statusBorder: '3px',
      },
      '2xl': {
        size: '96px',
        fontSize: theme.typography.sizes['2xl'].fontSize,
        statusSize: '16px',
        statusBorder: '3px',
      },
    };

    const currentSize = sizeConfig[size];

    // Status colors
    const statusColors = {
      online: theme.colors.accent[500],
      offline: theme.colors.gray[400],
      away: theme.colors.warning[500],
      busy: theme.colors.error[500],
    };

    // Determine background color
    const bgColor = color || (name ? getColorFromName(name) : theme.colors.gray[400]);

    // Get initials
    const initials = name ? getInitials(name) : '?';

    // Show image if src is provided and hasn't errored
    const showImage = src && !imageError;

    // Container styles
    const containerStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: currentSize.size,
      height: currentSize.size,
      backgroundColor: showImage ? 'transparent' : bgColor,
      borderRadius: square ? theme.componentRadius.avatar.square : theme.radius.full,
      overflow: 'hidden',
      flexShrink: 0,
      userSelect: 'none',
    };

    // Image styles
    const imageStyles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    };

    // Initials styles
    const initialsStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: currentSize.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.gray[0],
      lineHeight: 1,
    };

    // Status indicator styles
    const statusStyles: React.CSSProperties = {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: currentSize.statusSize,
      height: currentSize.statusSize,
      backgroundColor: status ? statusColors[status] : 'transparent',
      border: `${currentSize.statusBorder} solid ${resolvedColors.bg.primary}`,
      borderRadius: theme.radius.full,
    };

    return (
      <div
        ref={ref}
        className={className}
        style={containerStyles}
        role="img"
        aria-label={alt || name || 'Avatar'}
      >
        {/* Image */}
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            style={imageStyles}
            onError={() => setImageError(true)}
            {...props}
          />
        ) : (
          /* Initials */
          <span style={initialsStyles}>{initials}</span>
        )}

        {/* Status indicator */}
        {status && <div style={statusStyles} />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

/**
 * Avatar Group Component
 * For displaying multiple avatars in a stack
 */
export interface AvatarGroupProps {
  /**
   * Avatar children
   */
  children: React.ReactNode;

  /**
   * Maximum avatars to show before "+X"
   */
  max?: number;

  /**
   * Size of avatars in group
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Custom class name
   */
  className?: string;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = 'md', className }, ref) => {
    const { theme, resolvedColors } = useTheme();

    // Get avatar size for overlap calculation
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      '2xl': 96,
    };

    const avatarSize = sizeMap[size];
    const overlap = avatarSize * 0.25; // 25% overlap

    // Convert children to array
    const childArray = React.Children.toArray(children);
    const visibleChildren = childArray.slice(0, max);
    const remainingCount = Math.max(0, childArray.length - max);

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
    };

    // Avatar wrapper styles
    const getAvatarWrapperStyles = (index: number): React.CSSProperties => ({
      marginLeft: index > 0 ? `-${overlap}px` : '0',
      border: `2px solid ${resolvedColors.bg.primary}`,
      borderRadius: theme.radius.full,
      zIndex: visibleChildren.length - index,
    });

    // Remaining count styles
    const remainingStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${avatarSize}px`,
      height: `${avatarSize}px`,
      backgroundColor: resolvedColors.surface.hover,
      border: `2px solid ${resolvedColors.bg.primary}`,
      borderRadius: theme.radius.full,
      marginLeft: `-${overlap}px`,
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: resolvedColors.text.secondary,
      zIndex: 0,
    };

    return (
      <div ref={ref} className={className} style={containerStyles}>
        {/* Remaining count */}
        {remainingCount > 0 && <div style={remainingStyles}>+{remainingCount}</div>}

        {/* Visible avatars */}
        {visibleChildren.map((child, index) => (
          <div key={index} style={getAvatarWrapperStyles(index)}>
            {child}
          </div>
        ))}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
