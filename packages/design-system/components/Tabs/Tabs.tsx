/**
 * Tabs Component
 *
 * Professional tabs with animated indicator.
 * Smooth transitions, keyboard navigation, accessible.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Tab Variant
 */
export type TabsVariant = 'line' | 'pill' | 'enclosed';

/**
 * Tab Size
 */
export type TabsSize = 'sm' | 'md' | 'lg';

/**
 * Tab Item
 */
export interface TabItem {
  /**
   * Tab identifier
   */
  value: string;

  /**
   * Tab label
   */
  label: string;

  /**
   * Optional icon
   */
  icon?: React.ReactNode;

  /**
   * Whether tab is disabled
   */
  disabled?: boolean;
}

/**
 * Tabs Props
 */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Tab items
   */
  items: TabItem[];

  /**
   * Active tab value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string;

  /**
   * Variant style
   * @default 'line'
   */
  variant?: TabsVariant;

  /**
   * Size
   * @default 'md'
   */
  size?: TabsSize;

  /**
   * Full width tabs
   */
  fullWidth?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Tabs Component
 *
 * Professional tabs with:
 * - Animated sliding indicator
 * - Three variants (line, pill, enclosed)
 * - Keyboard navigation (arrow keys)
 * - Full accessibility
 * - Smooth animations
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      value: controlledValue,
      onChange,
      defaultValue,
      variant = 'line',
      size = 'md',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme, resolvedColors } = useTheme();
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue || items[0]?.value
    );
    const tabsRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

    // Determine if controlled or uncontrolled
    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : uncontrolledValue;

    // Size configurations
    const sizeConfig = {
      sm: {
        fontSize: theme.typography.sizes.sm.fontSize,
        padding: '6px 12px',
        gap: theme.spacing.xs,
      },
      md: {
        fontSize: theme.typography.sizes.base.fontSize,
        padding: '10px 16px',
        gap: theme.spacing.sm,
      },
      lg: {
        fontSize: theme.typography.sizes.lg.fontSize,
        padding: '12px 20px',
        gap: theme.spacing.md,
      },
    };

    const currentSize = sizeConfig[size];

    // Update indicator position
    const updateIndicator = useCallback(() => {
      if (!tabsRef.current) return;

      const activeIndex = items.findIndex((item) => item.value === activeValue);
      if (activeIndex === -1) return;

      const activeTab = tabsRef.current.children[activeIndex] as HTMLElement;
      if (!activeTab) return;

      if (variant === 'line') {
        setIndicatorStyle({
          width: `${activeTab.offsetWidth}px`,
          transform: `translateX(${activeTab.offsetLeft}px)`,
        });
      } else if (variant === 'pill') {
        setIndicatorStyle({
          width: `${activeTab.offsetWidth}px`,
          transform: `translateX(${activeTab.offsetLeft}px)`,
        });
      }
    }, [activeValue, items, variant]);

    useEffect(() => {
      updateIndicator();
    }, [updateIndicator]);

    // Update on window resize
    useEffect(() => {
      if (typeof window === 'undefined') return;

      window.addEventListener('resize', updateIndicator);
      return () => window.removeEventListener('resize', updateIndicator);
    }, [updateIndicator]);

    const handleTabClick = (value: string, disabled?: boolean) => {
      if (disabled) return;

      if (isControlled) {
        onChange?.(value);
      } else {
        setUncontrolledValue(value);
        onChange?.(value);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      // Skip disabled tabs
      while (items[newIndex]?.disabled && newIndex !== currentIndex) {
        if (event.key === 'ArrowLeft' || event.key === 'Home') {
          newIndex = newIndex > 0 ? newIndex - 1 : items.length - 1;
        } else {
          newIndex = newIndex < items.length - 1 ? newIndex + 1 : 0;
        }
      }

      if (!items[newIndex]?.disabled) {
        handleTabClick(items[newIndex].value);
      }
    };

    // Container styles
    const containerStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      ...(variant === 'enclosed' && {
        border: `1px solid ${resolvedColors.border.default}`,
        borderRadius: theme.radius.md,
        padding: '4px',
        backgroundColor: resolvedColors.surface.secondary,
      }),
      ...(variant === 'pill' && {
        backgroundColor: resolvedColors.surface.secondary,
        borderRadius: theme.radius.full,
        padding: '4px',
      }),
    };

    // Tabs list styles
    const tabsListStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      width: '100%',
      gap: variant === 'line' ? theme.spacing.md : 0,
    };

    // Tab button styles
    const getTabStyles = (item: TabItem, isActive: boolean): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        flex: fullWidth ? 1 : '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: currentSize.gap,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: isActive
          ? theme.typography.weights.semibold
          : theme.typography.weights.medium,
        color: item.disabled
          ? resolvedColors.text.disabled
          : isActive
          ? variant === 'line'
            ? theme.colors.primary[500]
            : resolvedColors.text.primary
          : resolvedColors.text.secondary,
        backgroundColor: 'transparent',
        border: 'none',
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        outline: 'none',
        transition: `all ${theme.duration.fast} ${theme.easing.easeOut}`,
        position: 'relative',
        zIndex: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      };

      // Variant-specific styles
      if (variant === 'pill' || variant === 'enclosed') {
        baseStyles.borderRadius = variant === 'pill' ? theme.radius.full : theme.radius.md;
      }

      return baseStyles;
    };

    // Indicator styles
    const indicatorBaseStyles: React.CSSProperties = {
      position: 'absolute',
      transition: `all ${theme.duration.normal} ${theme.easing.spring}`,
      pointerEvents: 'none',
    };

    const getIndicatorStyles = (): React.CSSProperties => {
      if (variant === 'line') {
        return {
          ...indicatorBaseStyles,
          ...indicatorStyle,
          bottom: 0,
          height: '2px',
          backgroundColor: theme.colors.primary[500],
          borderRadius: theme.radius.sm,
        };
      } else if (variant === 'pill' || variant === 'enclosed') {
        return {
          ...indicatorBaseStyles,
          ...indicatorStyle,
          top: '4px',
          bottom: '4px',
          backgroundColor: resolvedColors.surface.primary,
          borderRadius: variant === 'pill' ? theme.radius.full : theme.radius.md,
          boxShadow: theme.shadows.light.sm,
        };
      }
      return {};
    };

    return (
      <div ref={ref} className={className} {...props}>
        <div style={containerStyles}>
          <div ref={tabsRef} style={tabsListStyles} role="tablist">
            {items.map((item, index) => {
              const isActive = item.value === activeValue;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={item.disabled}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleTabClick(item.value, item.disabled)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  style={getTabStyles(item, isActive)}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
            {/* Animated indicator */}
            {(variant === 'line' || variant === 'pill' || variant === 'enclosed') && (
              <div style={getIndicatorStyles()} aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

/**
 * TabPanel Component
 * For tab content
 */
export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Panel value (matches tab value)
   */
  value: string;

  /**
   * Active tab value
   */
  activeValue?: string;

  /**
   * Whether to keep mounted when inactive
   */
  keepMounted?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, activeValue, keepMounted = false, className, children, ...props }, ref) => {
    const { theme } = useTheme();

    const isActive = value === activeValue;

    if (!isActive && !keepMounted) {
      return null;
    }

    const panelStyles: React.CSSProperties = {
      display: isActive ? 'block' : 'none',
      paddingTop: theme.spacing.lg,
    };

    return (
      <div
        ref={ref}
        role="tabpanel"
        aria-labelledby={value}
        hidden={!isActive}
        className={className}
        style={panelStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';
