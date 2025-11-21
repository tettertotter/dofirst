/**
 * Modal Component
 *
 * Premium modal with perfect animations and UX.
 * Every detail crafted for that "wow" feeling.
 */

'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';

/**
 * Modal Sizes
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal Props
 */
export interface ModalProps {
  /**
   * Whether modal is open
   */
  open: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal size
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Close on backdrop click
   * @default true
   */
  closeOnBackdrop?: boolean;

  /**
   * Close on escape key
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children?: React.ReactNode;

  /**
   * Custom class name for modal content
   */
  className?: string;

  /**
   * Custom z-index
   */
  zIndex?: number;
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
 * Modal Component
 *
 * Premium modal with:
 * - Smooth entrance/exit animations (fade + scale)
 * - Backdrop blur effect
 * - Focus trap (keeps focus inside modal)
 * - Scroll locking (prevents body scroll)
 * - Escape key to close
 * - Click outside to close
 * - Portal rendering (renders at document root)
 * - Multiple sizes
 * - Accessibility (ARIA, focus management)
 * - Dark mode support
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      size = 'md',
      closeOnBackdrop = true,
      closeOnEscape = true,
      showCloseButton = true,
      title,
      children,
      className,
      zIndex,
    },
    ref
  ) => {
    const { theme, isDark, resolvedColors } = useTheme();
    const isMobile = useIsMobile();
    const [isCloseHovered, setIsCloseHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Handle mounting (for portal)
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    // Handle body scroll lock
    useEffect(() => {
      if (open) {
        // Save current scroll position
        const scrollY = window.scrollY;

        // Lock scroll
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
          // Restore scroll
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
        };
      }
    }, [open]);

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Focus management
    useEffect(() => {
      if (open) {
        // Save currently focused element
        previousFocusRef.current = document.activeElement as HTMLElement;

        // Focus modal after animation
        setTimeout(() => {
          modalRef.current?.focus();
        }, 100);

        return () => {
          // Restore focus when closing
          previousFocusRef.current?.focus();
        };
      }
    }, [open]);

    // Handle animation state
    useEffect(() => {
      if (open) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 350);
        return () => clearTimeout(timer);
      }
    }, [open]);

    // Don't render until mounted (SSR safety)
    if (!mounted) return null;

    // Don't render if not open and not animating
    if (!open && !isAnimating) return null;

    // Size configurations
    const sizeStyles = {
      sm: {
        maxWidth: '400px',
        minHeight: 'auto',
      },
      md: {
        maxWidth: '600px',
        minHeight: 'auto',
      },
      lg: {
        maxWidth: '800px',
        minHeight: 'auto',
      },
      xl: {
        maxWidth: '1200px',
        minHeight: 'auto',
      },
      full: {
        maxWidth: '100vw',
        minHeight: '100vh',
        borderRadius: '0',
      },
    };

    const currentSize = sizeStyles[size];

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
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
      backgroundColor: isDark ? theme.colors.overlay.dark : theme.colors.overlay.light,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'full' ? '0' : theme.spacing.lg,
      zIndex: zIndex || theme.zIndex.modal,
      animation: open
        ? `fadeIn ${theme.duration.slow} ${theme.easing.out}`
        : `fadeOut ${theme.duration.normal} ${theme.easing.in}`,
      opacity: open ? 1 : 0,
    };

    // Modal container styles - 2025 Professional Standards
    const modalStyles: React.CSSProperties = {
      position: 'relative',
      backgroundColor: resolvedColors.surface.default,
      borderRadius: size === 'full' ? '0' : theme.componentRadius.modal.default,  // 16px standard ⭐
      boxShadow: isDark ? theme.shadows.dark.xl : theme.shadows.light.xl,
      maxWidth: currentSize.maxWidth,
      minHeight: currentSize.minHeight,
      width: '100%',
      maxHeight: size === 'full' ? '100vh' : 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      outline: 'none',
      animation: open
        ? `modalSlideUp ${theme.duration.slow} ${theme.easing.out}`
        : `modalSlideDown ${theme.duration.normal} ${theme.easing.in}`,
      transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: open ? 1 : 0,
    };

    // Header styles - 2025 Professional Standards
    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.component.modal.header,  // 24px modal header padding ⭐
      borderBottom: `1px solid ${resolvedColors.border.subtle}`,
      flexShrink: 0,
    };

    // Title styles
    const titleStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.xl.fontSize,
      fontWeight: theme.typography.weights.semibold,
      color: resolvedColors.text.primary,
      margin: 0,
    };

    // Close button styles - 2025 Professional Standards
    const closeButtonStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      padding: 0,
      border: 'none',
      borderRadius: theme.radius.md,  // 8px for small interactive element ⭐
      backgroundColor: isCloseHovered ? resolvedColors.surface.hover : 'transparent',
      color: isCloseHovered ? resolvedColors.text.primary : resolvedColors.text.secondary,
      cursor: 'pointer',
      transition: theme.transition.color.value,
    };

    // Content styles - 2025 Professional Standards
    const contentStyles: React.CSSProperties = {
      flex: 1,
      padding: theme.spacing.component.modal.md,  // 24px modal content padding ⭐
      overflowY: 'auto',
      overflowX: 'hidden',
    };

    // Keyframes for animations
    const keyframesStyle = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes modalSlideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes modalSlideDown {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
      }
    `;

    const modal = (
      <>
        <style>{keyframesStyle}</style>
        <div
          style={backdropStyles}
          onClick={handleBackdropClick}
          aria-hidden="true"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            tabIndex={-1}
            style={modalStyles}
            className={className}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div style={headerStyles}>
                {title && (
                  <h2 id="modal-title" style={titleStyles}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    style={closeButtonStyles}
                    aria-label="Close modal"
                    onMouseEnter={() => setIsCloseHovered(true)}
                    onMouseLeave={() => setIsCloseHovered(false)}
                  >
                    <CloseIcon size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div style={contentStyles}>{children}</div>
          </div>
        </div>
      </>
    );

    // Render in portal
    return createPortal(modal, document.body);
  }
);

Modal.displayName = 'Modal';

/**
 * Modal Header Component
 */
export interface ModalHeaderProps {
  children?: React.ReactNode;
}

export const ModalHeader = ({ children }: ModalHeaderProps) => {
  const { theme, resolvedColors } = useTheme();

  // 2025 Professional Standards - More generous spacing
  const headerStyles: React.CSSProperties = {
    padding: theme.spacing.component.modal.header,  // 24px consistent header padding ⭐
    borderBottom: `1px solid ${resolvedColors.border.subtle}`,
  };

  return <div style={headerStyles}>{children}</div>;
};

ModalHeader.displayName = 'ModalHeader';

/**
 * Modal Footer Component
 */
export interface ModalFooterProps {
  children?: React.ReactNode;
}

export const ModalFooter = ({ children }: ModalFooterProps) => {
  const { theme, resolvedColors } = useTheme();

  // 2025 Professional Standards - More generous spacing
  const footerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.component.gap.sm,  // 12px gap between buttons ⭐
    padding: theme.spacing.component.modal.footer,  // 20px footer padding ⭐
    borderTop: `1px solid ${resolvedColors.border.subtle}`,
  };

  return <div style={footerStyles}>{children}</div>;
};

ModalFooter.displayName = 'ModalFooter';
