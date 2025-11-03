/**
 * DatePicker Component
 *
 * Mobile-optimized date picker with quick shortcuts.
 * Replaces browser prompt() for better mobile UX.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { haptics } from '../../utils/haptics';
import { fadeVariants, slideUpVariants, scaleVariants, getAccessibleTransition } from '../../utils/animations';

/**
 * Date Shortcut
 */
export interface DateShortcut {
  label: string;
  date: Date;
}

/**
 * DatePicker Props
 */
export interface DatePickerProps {
  /**
   * Whether modal is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Date selected handler
   */
  onSelect: (date: Date) => void;

  /**
   * Title text
   * @default "Select Date"
   */
  title?: string;

  /**
   * Quick date shortcuts
   */
  shortcuts?: DateShortcut[];

  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Default selected date
   */
  defaultDate?: Date;
}

/**
 * Default Shortcuts
 */
const getDefaultShortcuts = (): DateShortcut[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    {
      label: 'Today',
      date: today,
    },
    {
      label: 'Tomorrow',
      date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      label: 'Next Week',
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      label: 'Next Month',
      date: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    },
  ];
};

/**
 * Format date as YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * DatePicker Component
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  open,
  onClose,
  onSelect,
  title = 'Select Date',
  shortcuts = getDefaultShortcuts(),
  minDate,
  maxDate,
  defaultDate,
}) => {
  const { theme, isDark, resolvedColors } = useTheme();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate ? formatDate(defaultDate) : formatDate(new Date())
  );

  // Animation config
  const backdropTransition = getAccessibleTransition('modal');
  const modalTransition = getAccessibleTransition('sheet');
  const modalVariants = isMobile ? slideUpVariants : scaleVariants;

  // Handle shortcut click
  const handleShortcutClick = (date: Date) => {
    haptics.selection();
    onSelect(date);
    onClose();
  };

  // Handle manual date input
  const handleManualSelect = () => {
    haptics.impact();
    const date = new Date(selectedDate);
    if (!isNaN(date.getTime())) {
      onSelect(date);
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      haptics.soft();
      onClose();
    }
  };

  // Backdrop styles
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
  };

  // Modal styles (bottom sheet on mobile, centered modal on desktop)
  const modalStyles: React.CSSProperties = {
    backgroundColor: resolvedColors.bg.primary,
    borderRadius: isMobile ? '16px 16px 0 0' : theme.radius.lg,
    boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
    width: isMobile ? '100%' : '400px',
    maxWidth: isMobile ? '100%' : '90vw',
    maxHeight: isMobile ? '80vh' : '600px',
    display: 'flex',
    flexDirection: 'column',
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${resolvedColors.border.default}`,
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.xl.fontSize,
    fontWeight: theme.typography.weights.semibold,
    color: resolvedColors.text.primary,
    margin: 0,
  };

  // Content styles
  const contentStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    overflowY: 'auto',
    flex: 1,
  };

  // Shortcuts grid
  const shortcutsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  };

  // Shortcut button styles
  const shortcutButtonStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    backgroundColor: isDark ? theme.colors.dark.bg.secondary : theme.colors.gray[50],
    border: `1px solid ${resolvedColors.border.default}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.base.fontSize,
    fontWeight: theme.typography.weights.medium,
    color: resolvedColors.text.primary,
    cursor: 'pointer',
    transition: theme.transition.button.value,
    minHeight: '48px', // Touch target
  };

  // Manual input container
  const manualInputStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.sm.fontSize,
    fontWeight: theme.typography.weights.medium,
    color: resolvedColors.text.secondary,
  };

  const inputStyles: React.CSSProperties = {
    padding: isMobile ? '15px 16px' : '12px 16px',
    backgroundColor: isDark ? theme.colors.dark.bg.secondary : theme.colors.gray[0],
    border: `1px solid ${resolvedColors.border.default}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.base.fontSize,
    color: resolvedColors.text.primary,
    minHeight: '44px', // Touch target
    outline: 'none',
  };

  // Footer styles
  const footerStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderTop: `1px solid ${resolvedColors.border.default}`,
    display: 'flex',
    gap: theme.spacing.md,
  };

  const buttonBaseStyles: React.CSSProperties = {
    flex: 1,
    padding: isMobile ? '15px 24px' : '12px 24px',
    borderRadius: theme.radius.md,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.base.fontSize,
    fontWeight: theme.typography.weights.semibold,
    cursor: 'pointer',
    transition: theme.transition.button.value,
    border: 'none',
    minHeight: '48px', // Touch target
  };

  const cancelButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    backgroundColor: isDark ? theme.colors.dark.bg.secondary : theme.colors.gray[100],
    color: resolvedColors.text.primary,
  };

  const confirmButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    backgroundColor: theme.colors.primary[500],
    color: theme.colors.gray[0],
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={backdropStyles}
          onClick={handleBackdropClick}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={backdropTransition}
        >
          <motion.div
            style={modalStyles}
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={modalTransition}
          >
          {/* Header */}
          <div style={headerStyles}>
            <h2 style={titleStyles}>{title}</h2>
          </div>

          {/* Content */}
          <div style={contentStyles}>
            {/* Quick Shortcuts */}
            <div style={shortcutsGridStyles}>
              {shortcuts.map((shortcut, index) => (
                <button
                  key={index}
                  style={shortcutButtonStyles}
                  onClick={() => handleShortcutClick(shortcut.date)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = isDark
                      ? theme.colors.dark.bg.tertiary
                      : theme.colors.gray[100];
                    (e.target as HTMLElement).style.borderColor = theme.colors.primary[500];
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = isDark
                      ? theme.colors.dark.bg.secondary
                      : theme.colors.gray[50];
                    (e.target as HTMLElement).style.borderColor = resolvedColors.border.default;
                  }}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            {/* Manual Date Input */}
            <div style={manualInputStyles}>
              <label style={labelStyles}>Or choose a specific date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate ? formatDate(minDate) : undefined}
                max={maxDate ? formatDate(maxDate) : undefined}
                style={inputStyles}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = theme.colors.primary[500];
                  (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${
                    isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
                  }`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = resolvedColors.border.default;
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={footerStyles}>
            <button
              style={cancelButtonStyles}
              onClick={() => {
                haptics.soft();
                onClose();
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = isDark
                  ? theme.colors.dark.bg.tertiary
                  : theme.colors.gray[200];
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = isDark
                  ? theme.colors.dark.bg.secondary
                  : theme.colors.gray[100];
              }}
            >
              Cancel
            </button>
            <button
              style={confirmButtonStyles}
              onClick={handleManualSelect}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = theme.colors.primary[600];
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = theme.colors.primary[500];
              }}
            >
              Select
            </button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

DatePicker.displayName = 'DatePicker';
