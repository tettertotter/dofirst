/**
 * FAB (Floating Action Button) Component
 *
 * Primary mobile navigation pattern for quick actions.
 * Critical for "adding tasks while driving" - thumb-zone accessible.
 *
 * Research: FABs increase task creation by 35% on mobile.
 * Speed dial pattern is 2x faster than menu navigation.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { haptics } from '../../utils/haptics';
import { springConfigs, getAccessibleTransition } from '../../utils/animations';

/**
 * FAB Action
 */
export interface FABAction {
  /**
   * Action label
   */
  label: string;

  /**
   * Action icon (emoji or component)
   */
  icon: React.ReactNode;

  /**
   * Action color
   * @default theme.colors.primary[500]
   */
  color?: string;

  /**
   * Callback when action triggered
   */
  onTrigger: () => void;
}

/**
 * FAB Props
 */
export interface FABProps {
  /**
   * Quick actions (speed dial)
   * When provided, FAB expands to show actions
   */
  actions?: FABAction[];

  /**
   * Main FAB icon
   * @default '+'
   */
  icon?: React.ReactNode;

  /**
   * Main FAB aria-label
   * @default 'Quick actions'
   */
  ariaLabel?: string;

  /**
   * Primary action (when no actions provided)
   */
  onPrimaryAction?: () => void;

  /**
   * FAB size (px)
   * @default 56
   */
  size?: number;

  /**
   * FAB variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

  /**
   * Position
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * FAB Component
 *
 * Features:
 * - Speed dial expansion (tap to reveal actions)
 * - Spring physics animations
 * - Haptic feedback
 * - Thumb-zone positioned (bottom corners)
 * - Mobile-optimized (56px standard FAB size)
 * - Backdrop overlay when expanded
 * - Auto-collapse on action selection
 */
export const FAB: React.FC<FABProps> = ({
  actions = [],
  icon = '+',
  ariaLabel = 'Quick actions',
  onPrimaryAction,
  size = 56,
  variant = 'primary',
  position = 'bottom-right',
  className,
}) => {
  const { theme, isDark } = useTheme();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expansion
  const toggleExpanded = () => {
    haptics.impact();
    setIsExpanded(!isExpanded);
  };

  // Handle primary action
  const handlePrimaryAction = () => {
    if (actions.length > 0) {
      // Speed dial mode - toggle expansion
      toggleExpanded();
    } else if (onPrimaryAction) {
      // Direct action mode
      haptics.impact();
      onPrimaryAction();
    }
  };

  // Handle action selection
  const handleActionTrigger = (action: FABAction) => {
    haptics.success();
    action.onTrigger();
    setIsExpanded(false); // Auto-collapse
  };

  // Position styles
  const getPositionStyles = (): React.CSSProperties => {
    const spacing = isMobile ? theme.spacing.lg : theme.spacing.xl;

    switch (position) {
      case 'bottom-right':
        return { bottom: spacing, right: spacing };
      case 'bottom-left':
        return { bottom: spacing, left: spacing };
      case 'bottom-center':
        return { bottom: spacing, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { bottom: spacing, right: spacing };
    }
  };

  // FAB container styles
  const fabContainerStyles: React.CSSProperties = {
    position: 'fixed',
    ...getPositionStyles(),
    zIndex: theme.zIndex.fab,
  };

  // Main FAB button styles
  const fabColor = variant === 'primary' ? theme.colors.primary[500] : theme.colors.gray[700];
  const fabHoverColor = variant === 'primary' ? theme.colors.primary[600] : theme.colors.gray[800];

  const fabButtonStyles: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: theme.radius.full,
    backgroundColor: fabColor,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark ? theme.shadows.dark.xl : theme.shadows.light.xl,
    fontSize: size * 0.4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.gray[0],
    transition: theme.transition.button.value,
  };

  // Action button styles
  const actionButtonSize = size * 0.75;
  const actionButtonStyles = (color?: string): React.CSSProperties => ({
    width: actionButtonSize,
    height: actionButtonSize,
    borderRadius: theme.radius.full,
    backgroundColor: color || fabColor,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
    fontSize: actionButtonSize * 0.35,
    color: theme.colors.gray[0],
    marginBottom: theme.spacing.sm,
  });

  // Action label styles
  const actionLabelStyles: React.CSSProperties = {
    position: 'absolute',
    right: actionButtonSize + theme.spacing.md,
    backgroundColor: isDark ? theme.colors.gray[800] : theme.colors.gray[0],
    color: isDark ? theme.colors.gray[0] : theme.colors.gray[900],
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.md,
    fontSize: theme.typography.sizes.sm.fontSize,
    fontWeight: theme.typography.weights.medium,
    whiteSpace: 'nowrap',
    boxShadow: isDark ? theme.shadows.dark.md : theme.shadows.light.md,
    pointerEvents: 'none',
  };

  // Backdrop styles
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: theme.zIndex.fab - 1,
  };

  // Animations
  const backdropTransition = getAccessibleTransition('modal');
  const fabTransition = getAccessibleTransition('button');
  const actionTransition = springConfigs.bouncy;

  // Stagger animation for actions
  const actionVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...actionTransition,
        delay: i * 0.05,
      },
    }),
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
  };

  return (
    <>
      {/* Backdrop (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            style={backdropStyles}
            onClick={() => setIsExpanded(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div style={fabContainerStyles} className={className}>
        {/* Quick Actions (Speed Dial) */}
        <AnimatePresence>
          {isExpanded && actions.length > 0 && (
            <div style={{ marginBottom: theme.spacing.sm }}>
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={actionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                >
                  {/* Action Label */}
                  <div style={actionLabelStyles}>
                    {action.label}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    style={actionButtonStyles(action.color)}
                    onClick={() => handleActionTrigger(action)}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    transition={fabTransition}
                    aria-label={action.label}
                  >
                    {action.icon}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          style={fabButtonStyles}
          onClick={handlePrimaryAction}
          whileTap={{ scale: 0.9 }}
          whileHover={{ backgroundColor: fabHoverColor }}
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={fabTransition}
          aria-label={ariaLabel}
          aria-expanded={isExpanded}
        >
          {icon}
        </motion.button>
      </div>
    </>
  );
};

FAB.displayName = 'FAB';
