/**
 * Skeleton Component
 *
 * Premium loading placeholder with smooth wave animation.
 * Makes loading states feel fast and polished.
 */

'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { skeletonPulseVariants } from '../../utils/animations';

/**
 * Skeleton Variant
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

/**
 * Skeleton Props
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Skeleton variant
   * @default 'text'
   */
  variant?: SkeletonVariant;

  /**
   * Width
   */
  width?: string | number;

  /**
   * Height
   */
  height?: string | number;

  /**
   * Disable wave animation
   * @default false
   */
  disableAnimation?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Skeleton Component
 *
 * Premium skeleton with:
 * - Three variants (text, circular, rectangular)
 * - Smooth wave animation
 * - Flexible sizing
 * - Dark mode support
 * - Can disable animation for performance
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      disableAnimation = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();

    // Default dimensions based on variant
    const getDefaultDimensions = () => {
      switch (variant) {
        case 'text':
          return {
            width: width || '100%',
            height: height || '1em',
            borderRadius: theme.radius.sm,
          };
        case 'circular':
          return {
            width: width || '40px',
            height: height || '40px',
            borderRadius: theme.radius.full,
          };
        case 'rectangular':
          return {
            width: width || '100%',
            height: height || '200px',
            borderRadius: theme.radius.md,
          };
      }
    };

    const dimensions = getDefaultDimensions();

    // Base styles
    const baseStyles: React.CSSProperties = {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: isDark ? resolvedColors.surface.hover : theme.colors.gray[200],
      borderRadius: dimensions.borderRadius,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,

      // Wave animation overlay
      ...(disableAnimation
        ? {}
        : {
            '::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${
                isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)'
              }, transparent)`,
              animation: `skeletonWave 1.5s ease-in-out infinite`,
            },
          }),
    };

    // Keyframes for wave animation
    const keyframesStyle = `
      @keyframes skeletonWave {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `;

    // Create wave overlay element
    const waveStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${
        isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)'
      }, transparent)`,
      animation: disableAnimation
        ? undefined
        : `skeletonWave 1.5s ease-in-out infinite`,
    };

    return (
      <>
        <style>{keyframesStyle}</style>
        <motion.div
          ref={ref}
          className={className}
          style={baseStyles}
          aria-busy="true"
          aria-live="polite"
          variants={disableAnimation ? undefined : skeletonPulseVariants}
          animate={disableAnimation ? undefined : 'pulse'}
          {...props}
        >
          {!disableAnimation && <div style={waveStyles} />}
        </motion.div>
      </>
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton Group Component
 * For common loading patterns
 */
export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton lines
   * @default 3
   */
  lines?: number;

  /**
   * Gap between lines
   */
  gap?: string;

  /**
   * Custom class name
   */
  className?: string;
}

export const SkeletonGroup = forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ lines = 3, gap, className, ...props }, ref) => {
    const { theme } = useTheme();

    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: gap || theme.spacing.sm,
      width: '100%',
    };

    return (
      <div ref={ref} className={className} style={containerStyles} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '70%' : '100%'}
            variant="text"
          />
        ))}
      </div>
    );
  }
);

SkeletonGroup.displayName = 'SkeletonGroup';
