/**
 * SwipeableCard Component
 *
 * Mobile-optimized swipeable card with gesture support.
 * Swipe left for primary action, right for secondary action.
 *
 * Research: Swipe gestures are 3x faster than button taps on mobile.
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { haptics } from '../../utils/haptics';
import { springConfigs } from '../../utils/animations';

/**
 * Swipe Action
 */
export interface SwipeAction {
  /**
   * Action label (shown when swiping)
   */
  label: string;

  /**
   * Action color
   */
  color: string;

  /**
   * Action icon (emoji or component)
   */
  icon?: React.ReactNode;

  /**
   * Callback when action triggered
   */
  onTrigger: () => void;
}

/**
 * SwipeableCard Props
 */
export interface SwipeableCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Left swipe action (e.g., complete, accept)
   */
  leftAction?: SwipeAction;

  /**
   * Right swipe action (e.g., delete, decline)
   */
  rightAction?: SwipeAction;

  /**
   * Swipe threshold (0-1, percentage of card width)
   * @default 0.4
   */
  threshold?: number;

  /**
   * Disable swipe gestures
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * SwipeableCard Component
 *
 * Features:
 * - Smooth drag gestures with spring physics
 * - Visual feedback (colored backgrounds)
 * - Haptic feedback on threshold
 * - Auto-return animation if threshold not met
 * - Desktop fallback (disabled on desktop)
 */
export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  threshold = 0.4,
  disabled = false,
  className,
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [cardWidth, setCardWidth] = useState(0);
  const [hasTriggeredLeft, setHasTriggeredLeft] = useState(false);
  const [hasTriggeredRight, setHasTriggeredRight] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values
  const x = useMotionValue(0);

  // Calculate opacity based on drag distance
  const leftOpacity = useTransform(x, [0, cardWidth * threshold], [0, 1]);
  const rightOpacity = useTransform(x, [-cardWidth * threshold, 0], [1, 0]);

  // Measure card width on mount
  React.useEffect(() => {
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth);
    }
  }, []);

  // Disable on desktop or when explicitly disabled
  const isSwipeEnabled = isMobile && !disabled && (leftAction || rightAction);

  // Handle drag
  const handleDrag = (_event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const thresholdPx = cardWidth * threshold;

    // Left swipe (positive offset)
    if (leftAction && offset > thresholdPx && !hasTriggeredLeft) {
      setHasTriggeredLeft(true);
      haptics.impact();
    } else if (leftAction && offset < thresholdPx && hasTriggeredLeft) {
      setHasTriggeredLeft(false);
    }

    // Right swipe (negative offset)
    if (rightAction && offset < -thresholdPx && !hasTriggeredRight) {
      setHasTriggeredRight(true);
      haptics.impact();
    } else if (rightAction && offset > -thresholdPx && hasTriggeredRight) {
      setHasTriggeredRight(false);
    }
  };

  // Handle drag end
  const handleDragEnd = (_event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const thresholdPx = cardWidth * threshold;

    // Check if threshold was met
    if (leftAction && offset > thresholdPx) {
      // Trigger left action
      haptics.success();
      leftAction.onTrigger();
    } else if (rightAction && offset < -thresholdPx) {
      // Trigger right action
      haptics.success();
      rightAction.onTrigger();
    }

    // Reset state
    setHasTriggeredLeft(false);
    setHasTriggeredRight(false);
  };

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
  };

  // Background action styles
  const actionBackgroundStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg.fontSize,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[0],
  };

  return (
    <div
      ref={cardRef}
      style={containerStyles}
      className={className}
    >
      {/* Left Action Background (Complete/Accept) */}
      {leftAction && (
        <motion.div
          style={{
            ...actionBackgroundStyles,
            left: 0,
            right: 0,
            backgroundColor: leftAction.color,
            opacity: leftOpacity,
            justifyContent: 'flex-start',
          }}
        >
          {leftAction.icon && <span style={{ marginRight: theme.spacing.sm }}>{leftAction.icon}</span>}
          {leftAction.label}
        </motion.div>
      )}

      {/* Right Action Background (Delete/Decline) */}
      {rightAction && (
        <motion.div
          style={{
            ...actionBackgroundStyles,
            left: 0,
            right: 0,
            backgroundColor: rightAction.color,
            opacity: rightOpacity,
            justifyContent: 'flex-end',
          }}
        >
          {rightAction.label}
          {rightAction.icon && <span style={{ marginLeft: theme.spacing.sm }}>{rightAction.icon}</span>}
        </motion.div>
      )}

      {/* Swipeable Card Content */}
      <motion.div
        drag={isSwipeEnabled ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        transition={springConfigs.smooth}
      >
        {children}
      </motion.div>
    </div>
  );
};

SwipeableCard.displayName = 'SwipeableCard';
