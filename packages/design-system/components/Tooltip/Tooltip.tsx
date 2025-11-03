/**
 * Tooltip Component
 *
 * Premium tooltip with smart positioning and smooth animations.
 * The kind of tooltip that feels natural and helpful, never intrusive.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';

/**
 * Tooltip Position
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip Props
 */
export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode;

  /**
   * Element that triggers the tooltip
   */
  children: React.ReactElement;

  /**
   * Preferred position (will auto-adjust if doesn't fit)
   * @default 'top'
   */
  position?: TooltipPosition;

  /**
   * Delay before showing (ms)
   * @default 200
   */
  delay?: number;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Custom class name for tooltip content
   */
  className?: string;

  /**
   * Maximum width
   */
  maxWidth?: string;
}

/**
 * Calculate tooltip position
 */
function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: TooltipPosition,
  arrowSize: number
): { top: number; left: number; position: TooltipPosition } {
  const margin = 8; // Space between trigger and tooltip
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Try preferred position first
  let top = 0;
  let left = 0;
  let finalPosition = preferredPosition;

  const positions = {
    top: () => ({
      top: triggerRect.top - tooltipRect.height - arrowSize - margin,
      left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
    }),
    bottom: () => ({
      top: triggerRect.bottom + arrowSize + margin,
      left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
    }),
    left: () => ({
      top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
      left: triggerRect.left - tooltipRect.width - arrowSize - margin,
    }),
    right: () => ({
      top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
      left: triggerRect.right + arrowSize + margin,
    }),
  };

  // Calculate position
  const pos = positions[preferredPosition]();
  top = pos.top;
  left = pos.left;

  // Check if tooltip fits in viewport, if not try other positions
  const fitsTop = top >= margin;
  const fitsBottom = top + tooltipRect.height <= viewportHeight - margin;
  const fitsLeft = left >= margin;
  const fitsRight = left + tooltipRect.width <= viewportWidth - margin;

  // If preferred position doesn't fit, try alternatives
  if (!fitsTop || !fitsBottom || !fitsLeft || !fitsRight) {
    const alternatives: TooltipPosition[] = ['top', 'bottom', 'left', 'right'];

    for (const altPosition of alternatives) {
      if (altPosition === preferredPosition) continue;

      const altPos = positions[altPosition]();
      const altFitsTop = altPos.top >= margin;
      const altFitsBottom = altPos.top + tooltipRect.height <= viewportHeight - margin;
      const altFitsLeft = altPos.left >= margin;
      const altFitsRight = altPos.left + tooltipRect.width <= viewportWidth - margin;

      if (altFitsTop && altFitsBottom && altFitsLeft && altFitsRight) {
        top = altPos.top;
        left = altPos.left;
        finalPosition = altPosition;
        break;
      }
    }
  }

  // Ensure tooltip stays within viewport
  if (left < margin) left = margin;
  if (left + tooltipRect.width > viewportWidth - margin) {
    left = viewportWidth - tooltipRect.width - margin;
  }
  if (top < margin) top = margin;
  if (top + tooltipRect.height > viewportHeight - margin) {
    top = viewportHeight - tooltipRect.height - margin;
  }

  return { top, left, position: finalPosition };
}

/**
 * Tooltip Component
 *
 * Premium tooltip with:
 * - Smart positioning with auto-adjustment
 * - Arrow pointer
 * - Configurable delay
 * - Smooth fade + slide animation
 * - Portal rendering (no overflow clipping)
 * - Dark mode support
 * - Accessibility (ARIA)
 * - Max width control
 */
export function Tooltip({
  content,
  children,
  position: preferredPosition = 'top',
  delay = 200,
  disabled = false,
  className,
  maxWidth = '300px',
}: TooltipProps) {
  const { theme, isDark, resolvedColors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(preferredPosition);

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update tooltip position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const arrowSize = 6;

    const { top, left, position } = calculatePosition(
      triggerRect,
      tooltipRect,
      preferredPosition,
      arrowSize
    );

    setTooltipPosition({ top, left });
    setActualPosition(position);
  }, [preferredPosition]);

  // Show tooltip with delay
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Update position after showing
      setTimeout(updatePosition, 0);
    }, delay);
  }, [disabled, delay, updatePosition]);

  // Hide tooltip immediately
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, updatePosition]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone child and add trigger props
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
    'aria-describedby': isVisible ? 'tooltip' : undefined,
  });

  // Arrow size
  const arrowSize = 6;

  // Get arrow position based on actual position
  const getArrowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    const borderColor = isDark ? resolvedColors.surface.tertiary : resolvedColors.text.primary;

    switch (actualPosition) {
      case 'top':
        return {
          ...base,
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: `${borderColor} transparent transparent transparent`,
        };
      case 'bottom':
        return {
          ...base,
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent ${borderColor} transparent`,
        };
      case 'left':
        return {
          ...base,
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent transparent ${borderColor}`,
        };
      case 'right':
        return {
          ...base,
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: `transparent ${borderColor} transparent transparent`,
        };
    }
  };

  // Tooltip container styles - 2025 Professional Standards
  const tooltipStyles: React.CSSProperties = {
    position: 'fixed',
    top: `${tooltipPosition.top}px`,
    left: `${tooltipPosition.left}px`,
    maxWidth,
    padding: `${theme.spacing[2]} ${theme.spacing.sm}`,  // 8px 16px (was 4px 16px) ⭐ More breathing room
    backgroundColor: isDark ? resolvedColors.surface.tertiary : resolvedColors.text.primary,
    color: isDark ? resolvedColors.text.primary : theme.colors.gray[0],
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.sm.fontSize,
    lineHeight: theme.typography.sizes.sm.lineHeight,
    borderRadius: theme.radius.sm,
    boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
    zIndex: theme.zIndex.tooltip,
    pointerEvents: 'none',
    wordWrap: 'break-word',
    animation: `tooltipFadeIn ${theme.duration.fast} ${theme.easing.out}`,
    opacity: isVisible ? 1 : 0,
  };

  // Keyframes
  const keyframesStyle = `
    @keyframes tooltipFadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      {trigger}
      {mounted &&
        isVisible &&
        createPortal(
          <>
            <style>{keyframesStyle}</style>
            <div
              ref={tooltipRef}
              id="tooltip"
              role="tooltip"
              className={className}
              style={tooltipStyles}
            >
              {content}
              <div style={getArrowStyles()} />
            </div>
          </>,
          document.body
        )}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
