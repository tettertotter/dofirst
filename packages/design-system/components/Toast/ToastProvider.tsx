/**
 * Toast Notification System
 *
 * Premium toast notifications with queue management.
 * Smooth animations and perfect positioning.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';

/**
 * Toast Variant
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

/**
 * Toast Position
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast Item
 */
export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast Context
 */
interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast Provider Props
 */
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
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
 * Toast Item Component
 */
interface ToastItemProps extends Toast {
  onClose: () => void;
  position: ToastPosition;
}

function ToastItem({ id, message, variant = 'default', duration = 5000, action, onClose, position }: ToastItemProps) {
  const { theme, isDark, resolvedColors } = useTheme();
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto dismiss
  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(onClose, 300);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onClose]);

  // Get variant colors
  const getVariantConfig = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <SuccessIcon size={20} />,
          bg: isDark ? theme.colors.accent[900] : theme.colors.accent[50],
          border: isDark ? theme.colors.accent[700] : theme.colors.accent[200],
          text: isDark ? theme.colors.accent[100] : theme.colors.accent[900],
          progressBg: isDark ? theme.colors.accent[500] : theme.colors.accent[400],
        };
      case 'error':
        return {
          icon: <ErrorIcon size={20} />,
          bg: isDark ? theme.colors.error[900] : theme.colors.error[50],
          border: isDark ? theme.colors.error[700] : theme.colors.error[200],
          text: isDark ? theme.colors.error[100] : theme.colors.error[900],
          progressBg: isDark ? theme.colors.error[500] : theme.colors.error[400],
        };
      case 'warning':
        return {
          icon: <WarningIcon size={20} />,
          bg: isDark ? theme.colors.warning[900] : theme.colors.warning[50],
          border: isDark ? theme.colors.warning[700] : theme.colors.warning[200],
          text: isDark ? theme.colors.warning[100] : theme.colors.warning[900],
          progressBg: isDark ? theme.colors.warning[500] : theme.colors.warning[400],
        };
      case 'info':
        return {
          icon: <InfoIcon size={20} />,
          bg: isDark ? theme.colors.info[900] : theme.colors.info[50],
          border: isDark ? theme.colors.info[700] : theme.colors.info[200],
          text: isDark ? theme.colors.info[100] : theme.colors.info[900],
          progressBg: isDark ? theme.colors.info[500] : theme.colors.info[400],
        };
      default:
        return {
          icon: null,
          bg: resolvedColors.surface.default,
          border: resolvedColors.border.default,
          text: resolvedColors.text.primary,
          progressBg: theme.colors.primary[500],
        };
    }
  };

  const config = getVariantConfig();

  // Determine animation based on position
  const getAnimation = () => {
    const isTop = position.startsWith('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');

    if (isExiting) {
      if (isLeft) return 'toastSlideOutLeft';
      if (isRight) return 'toastSlideOutRight';
      return isTop ? 'toastSlideOutUp' : 'toastSlideOutDown';
    } else {
      if (isLeft) return 'toastSlideInLeft';
      if (isRight) return 'toastSlideInRight';
      return isTop ? 'toastSlideInDown' : 'toastSlideInUp';
    }
  };

  // Toast styles
  const toastStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    minWidth: '320px',
    maxWidth: '480px',
    padding: theme.spacing.md,
    backgroundColor: config.bg,
    border: `1px solid ${config.border}`,
    borderRadius: theme.componentRadius.card.default,
    boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,
    marginBottom: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
    animation: `${getAnimation()} ${theme.duration.slow} ${theme.easing.out}`,
  };

  // Progress bar styles
  const progressStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    width: `${progress}%`,
    backgroundColor: config.progressBg,
    transition: 'width 16ms linear',
  };

  // Message styles
  const messageStyles: React.CSSProperties = {
    flex: 1,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.sm.fontSize,
    lineHeight: theme.typography.sizes.sm.lineHeight,
    color: config.text,
    margin: 0,
  };

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[1],
    border: 'none',
    borderRadius: theme.radius.sm,
    backgroundColor: 'transparent',
    color: config.text,
    opacity: 0.7,
    cursor: 'pointer',
    transition: theme.transition.color.value,
    flexShrink: 0,
  };

  // Action button styles - 2025 Professional Standards
  const actionButtonStyles: React.CSSProperties = {
    padding: `${theme.spacing[2]} ${theme.spacing.sm}`,  // 8px 16px (was 4px 8px) ⭐ More generous
    border: `1px solid ${config.border}`,
    borderRadius: theme.radius.sm,
    backgroundColor: 'transparent',
    color: config.text,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.sm.fontSize,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: theme.transition.color.value,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={toastStyles} role="alert">
      {/* Icon */}
      {config.icon && (
        <div style={{ color: config.text, flexShrink: 0 }}>
          {config.icon}
        </div>
      )}

      {/* Message */}
      <p style={messageStyles}>{message}</p>

      {/* Action button */}
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onClose();
          }}
          style={actionButtonStyles}
        >
          {action.label}
        </button>
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        style={closeButtonStyles}
        aria-label="Dismiss notification"
      >
        <CloseIcon size={16} />
      </button>

      {/* Progress bar */}
      {duration > 0 && <div style={progressStyles} />}
    </div>
  );
}

/**
 * Toast Provider Component
 */
export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const { theme } = useTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });
    },
    [maxToasts]
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Get container position styles
  const getContainerStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: theme.zIndex.toast,
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing.lg,
      pointerEvents: 'none',
    };

    const [vertical, horizontal] = position.split('-') as [string, string];

    if (vertical === 'top') {
      base.top = 0;
    } else {
      base.bottom = 0;
      base.flexDirection = 'column-reverse';
    }

    if (horizontal === 'left') {
      base.left = 0;
      base.alignItems = 'flex-start';
    } else if (horizontal === 'right') {
      base.right = 0;
      base.alignItems = 'flex-end';
    } else {
      base.left = '50%';
      base.transform = 'translateX(-50%)';
      base.alignItems = 'center';
    }

    return base;
  };

  // Keyframes for animations
  const keyframesStyle = `
    @keyframes toastSlideInDown {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes toastSlideInUp {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes toastSlideInLeft {
      from {
        opacity: 0;
        transform: translateX(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes toastSlideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes toastSlideOutUp {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-100%);
      }
    }

    @keyframes toastSlideOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(100%);
      }
    }

    @keyframes toastSlideOutLeft {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-100%);
      }
    }

    @keyframes toastSlideOutRight {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    hideToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted &&
        createPortal(
          <>
            <style>{keyframesStyle}</style>
            <div style={getContainerStyles()}>
              {toasts.map((toast) => (
                <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                  <ToastItem
                    {...toast}
                    onClose={() => hideToast(toast.id)}
                    position={position}
                  />
                </div>
              ))}
            </div>
          </>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
