/**
 * Menu Component
 *
 * Professional dropdown menu for actions and navigation.
 * Context menus, dropdowns, command palettes.
 */

'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';

/**
 * Menu Item
 */
export interface MenuItem {
  /**
   * Item identifier
   */
  value: string;

  /**
   * Item label
   */
  label: string;

  /**
   * Optional icon
   */
  icon?: React.ReactNode;

  /**
   * Keyboard shortcut hint
   */
  shortcut?: string;

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Whether item is a divider
   */
  divider?: boolean;

  /**
   * Item color/variant
   */
  variant?: 'default' | 'danger';

  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Menu Props
 */
export interface MenuProps {
  /**
   * Menu items
   */
  items: MenuItem[];

  /**
   * Trigger element (button/link that opens menu)
   */
  trigger: React.ReactNode;

  /**
   * Open state (controlled)
   */
  open?: boolean;

  /**
   * Change handler
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Close on item click
   * @default true
   */
  closeOnClick?: boolean;

  /**
   * Menu position
   * @default 'bottom-left'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Menu Component
 *
 * Professional menu with:
 * - Portal rendering
 * - Smart positioning
 * - Keyboard navigation
 * - Icons and shortcuts
 * - Dividers
 * - Danger variant
 * - Full accessibility
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      items,
      trigger,
      open: controlledOpen,
      onOpenChange,
      closeOnClick = true,
      position = 'bottom-left',
      className,
    },
    ref
  ) => {
    const { theme, resolvedColors } = useTheme();
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Determine if controlled or uncontrolled
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const setIsOpen = (open: boolean) => {
      if (isControlled) {
        onOpenChange?.(open);
      } else {
        setUncontrolledOpen(open);
        onOpenChange?.(open);
      }
    };

    // Calculate menu position
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (position) {
          case 'bottom-left':
            top = triggerRect.bottom + 4;
            left = triggerRect.left;
            break;
          case 'bottom-right':
            top = triggerRect.bottom + 4;
            left = triggerRect.right;
            break;
          case 'top-left':
            top = triggerRect.top - 4;
            left = triggerRect.left;
            break;
          case 'top-right':
            top = triggerRect.top - 4;
            left = triggerRect.right;
            break;
        }

        setMenuPosition({ top, left });
      }
    }, [isOpen, position]);

    // Handle click outside and scroll
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleScroll = () => {
        setIsOpen(false);
      };

      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        const enabledItems = items.filter((item) => !item.disabled && !item.divider);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev < enabledItems.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            break;
          case 'Enter':
            event.preventDefault();
            const highlightedItem = enabledItems[highlightedIndex];
            if (highlightedItem && !highlightedItem.disabled) {
              highlightedItem.onClick?.();
              if (closeOnClick) {
                setIsOpen(false);
              }
            }
            break;
          case 'Escape':
            event.preventDefault();
            setIsOpen(false);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, items, closeOnClick]);

    const handleItemClick = (item: MenuItem) => {
      if (item.disabled || item.divider) return;

      item.onClick?.();

      if (closeOnClick) {
        setIsOpen(false);
      }
    };

    // Menu styles - 2025 Professional Standards
    const menuStyles: React.CSSProperties = {
      position: 'fixed',
      top: position.startsWith('top') ? 'auto' : `${menuPosition.top}px`,
      bottom: position.startsWith('top') ? `${typeof window !== 'undefined' ? window.innerHeight - menuPosition.top : 0}px` : 'auto',
      left: position.endsWith('right') ? 'auto' : `${menuPosition.left}px`,
      right: position.endsWith('right') ? `${typeof window !== 'undefined' ? window.innerWidth - menuPosition.left : 0}px` : 'auto',
      minWidth: '200px',
      maxHeight: '400px',
      overflowY: 'auto',
      backgroundColor: resolvedColors.surface.default,
      border: `1px solid ${resolvedColors.border.default}`,
      borderRadius: theme.radius.md,
      boxShadow: theme.shadows.light.lg,
      padding: theme.spacing[2],  // 8px (was spacing.xs = 4px) ⭐ More breathing room
      zIndex: theme.zIndex.dropdown,
      animation: 'menuOpen 0.15s ease-out',
    };

    // Item styles
    const getItemStyles = (
      item: MenuItem,
      index: number,
      isHighlighted: boolean
    ): React.CSSProperties => {
      if (item.divider) {
        return {
          height: '1px',
          backgroundColor: resolvedColors.border.default,
          margin: `${theme.spacing.xs} 0`,
        };
      }

      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.sizes.sm.fontSize,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
        color:
          item.variant === 'danger'
            ? theme.colors.error[500]
            : item.disabled
              ? resolvedColors.text.disabled
              : resolvedColors.text.primary,
        backgroundColor: isHighlighted ? resolvedColors.surface.hover : 'transparent',
        borderRadius: theme.radius.sm,
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        transition: `all ${theme.duration.fast} ${theme.easing.out}`,
        userSelect: 'none',
      };
    };

    // Shortcut styles
    const shortcutStyles: React.CSSProperties = {
      fontSize: theme.typography.sizes.xs.fontSize,
      color: resolvedColors.text.tertiary,
      fontFamily: theme.typography.fonts.primary,
    };

    // Keyframes
    const keyframesStyle = `
      @keyframes menuOpen {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-4px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;

    return (
      <>
        <style>{keyframesStyle}</style>
        <div ref={ref} className={className}>
          {/* Trigger */}
          <div
            ref={triggerRef}
            onClick={() => setIsOpen(!isOpen)}
            style={{ display: 'inline-block' }}
          >
            {trigger}
          </div>

          {/* Menu (Portal) */}
          {isOpen &&
            typeof document !== 'undefined' &&
            createPortal(
              <div ref={menuRef} style={menuStyles} role="menu">
                {items.map((item, index) => {
                  if (item.divider) {
                    return <div key={`divider-${index}`} style={getItemStyles(item, index, false)} />;
                  }

                  const enabledIndex = items
                    .slice(0, index)
                    .filter((i) => !i.disabled && !i.divider).length;
                  const isHighlighted = enabledIndex === highlightedIndex;

                  return (
                    <div
                      key={item.value}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setHighlightedIndex(enabledIndex)}
                      style={getItemStyles(item, index, isHighlighted)}
                      role="menuitem"
                      aria-disabled={item.disabled}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                      </div>
                      {item.shortcut && <span style={shortcutStyles}>{item.shortcut}</span>}
                    </div>
                  );
                })}
              </div>,
              document.body
            )}
        </div>
      </>
    );
  }
);

Menu.displayName = 'Menu';
