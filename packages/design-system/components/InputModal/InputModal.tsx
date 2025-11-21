/**
 * InputModal Component
 *
 * Mobile-optimized input modal for text entry.
 * Replaces browser prompt() for better mobile UX.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { haptics } from '../../utils/haptics';
import { fadeVariants, slideUpVariants, scaleVariants, getAccessibleTransition } from '../../utils/animations';

/**
 * InputModal Props
 */
export interface InputModalProps {
  /**
   * Whether modal is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Submit handler
   */
  onSubmit: (value: string) => void;

  /**
   * Title text
   */
  title: string;

  /**
   * Input label
   * @default "Value"
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Input type
   * @default "text"
   */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';

  /**
   * Default value
   */
  defaultValue?: string;

  /**
   * Required input
   * @default false
   */
  required?: boolean;

  /**
   * Validation pattern (regex)
   */
  pattern?: string;

  /**
   * Error message for validation
   */
  errorMessage?: string;
}

/**
 * InputModal Component
 */
export const InputModal: React.FC<InputModalProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  label = 'Value',
  placeholder,
  type = 'text',
  defaultValue = '',
  required = false,
  pattern,
  errorMessage,
}) => {
  const { theme, isDark, resolvedColors } = useTheme();
  const isMobile = useIsMobile();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation config
  const backdropTransition = getAccessibleTransition('modal');
  const modalTransition = getAccessibleTransition('sheet');
  const modalVariants = isMobile ? slideUpVariants : scaleVariants;

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Delay to allow animation to complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setError(undefined);
    }
  }, [open, defaultValue]);

  // Validate input
  const validate = (val: string): boolean => {
    if (required && !val.trim()) {
      setError('This field is required');
      return false;
    }

    if (pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(val)) {
        setError(errorMessage || 'Invalid format');
        return false;
      }
    }

    // Basic email validation
    if (type === 'email' && val.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    setError(undefined);
    return true;
  };

  // Handle submit
  const handleSubmit = () => {
    if (validate(value)) {
      haptics.impact();
      onSubmit(value);
      onClose();
    } else {
      haptics.error();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      haptics.soft();
      onClose();
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
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

  // Modal styles
  const modalStyles: React.CSSProperties = {
    backgroundColor: resolvedColors.bg.primary,
    borderRadius: isMobile ? '16px 16px 0 0' : theme.radius.lg,
    boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
    width: isMobile ? '100%' : '400px',
    maxWidth: isMobile ? '100%' : '90vw',
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
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.sm.fontSize,
    fontWeight: theme.typography.weights.medium,
    color: resolvedColors.text.secondary,
    marginBottom: theme.spacing[2],
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: isMobile ? '15px 16px' : '12px 16px',
    backgroundColor: isDark ? theme.colors.dark.bg.secondary : theme.colors.gray[0],
    border: `1px solid ${error ? theme.colors.error[500] : resolvedColors.border.default}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.base.fontSize,
    color: resolvedColors.text.primary,
    minHeight: '44px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const errorStyles: React.CSSProperties = {
    marginTop: theme.spacing[2],
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.sm.fontSize,
    color: theme.colors.error[500],
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
    minHeight: '48px',
  };

  const cancelButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    backgroundColor: isDark ? theme.colors.dark.bg.secondary : theme.colors.gray[100],
    color: resolvedColors.text.primary,
  };

  const submitButtonStyles: React.CSSProperties = {
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
              <label style={labelStyles}>{label}</label>
              <input
                ref={inputRef}
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                required={required}
                style={inputStyles}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = theme.colors.primary[500];
                  (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
                    }`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = error
                    ? theme.colors.error[500]
                    : resolvedColors.border.default;
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              />
              {error && <div style={errorStyles}>{error}</div>}
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
                style={submitButtonStyles}
                onClick={handleSubmit}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = theme.colors.primary[600];
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = theme.colors.primary[500];
                }}
              >
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

InputModal.displayName = 'InputModal';
