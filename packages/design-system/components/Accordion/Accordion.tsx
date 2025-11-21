/**
 * Accordion Component
 *
 * Professional accordion with smooth animations.
 * Collapsible content sections, accessible, configurable.
 */

'use client';

import React, { useState, useRef, useEffect, forwardRef, HTMLAttributes } from 'react';
import { useTheme } from '../../theme';

/**
 * Accordion Item
 */
export interface AccordionItem {
  /**
   * Item identifier
   */
  value: string;

  /**
   * Item title/header
   */
  title: string;

  /**
   * Item content
   */
  content: React.ReactNode;

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon
   */
  icon?: React.ReactNode;
}

/**
 * Accordion Props
 */
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Accordion items
   */
  items: AccordionItem[];

  /**
   * Expanded items (controlled)
   */
  value?: string[];

  /**
   * Change handler
   */
  onChange?: (value: string[]) => void;

  /**
   * Default expanded items (uncontrolled)
   */
  defaultValue?: string[];

  /**
   * Allow multiple items to be open
   * @default false
   */
  multiple?: boolean;

  /**
   * Variant style
   * @default 'outlined'
   */
  variant?: 'default' | 'outlined' | 'separated';

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Accordion Component
 *
 * Professional accordion with:
 * - Smooth expand/collapse animations
 * - Single or multiple open panels
 * - Three visual variants
 * - Full accessibility
 * - Keyboard navigation
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      value: controlledValue,
      onChange,
      defaultValue = [],
      multiple = false,
      variant = 'outlined',
      className,
      ...props
    },
    ref
  ) => {
    const { theme, resolvedColors } = useTheme();
    const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue);

    // Determine if controlled or uncontrolled
    const isControlled = controlledValue !== undefined;
    const expandedItems = isControlled ? controlledValue : uncontrolledValue;

    const handleToggle = (itemValue: string, disabled?: boolean) => {
      if (disabled) return;

      let newValue: string[];

      if (multiple) {
        // Multiple mode: toggle the item
        newValue = expandedItems.includes(itemValue)
          ? expandedItems.filter((v) => v !== itemValue)
          : [...expandedItems, itemValue];
      } else {
        // Single mode: only one item open at a time
        newValue = expandedItems.includes(itemValue) ? [] : [itemValue];
      }

      if (isControlled) {
        onChange?.(newValue);
      } else {
        setUncontrolledValue(newValue);
        onChange?.(newValue);
      }
    };

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: variant === 'separated' ? theme.spacing.md : 0,
      width: '100%',
      ...(variant === 'outlined' && {
        border: `1px solid ${resolvedColors.border.default}`,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
      }),
    };

    return (
      <div ref={ref} className={className} style={containerStyles} {...props}>
        {items.map((item, index) => (
          <AccordionItemComponent
            key={item.value}
            item={item}
            isExpanded={expandedItems.includes(item.value)}
            onToggle={() => handleToggle(item.value, item.disabled)}
            variant={variant}
            isFirst={index === 0}
            isLast={index === items.length - 1}
          />
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

/**
 * AccordionItem Component (internal)
 */
interface AccordionItemComponentProps {
  item: AccordionItem;
  isExpanded: boolean;
  onToggle: () => void;
  variant: 'default' | 'outlined' | 'separated';
  isFirst: boolean;
  isLast: boolean;
}

const AccordionItemComponent: React.FC<AccordionItemComponentProps> = ({
  item,
  isExpanded,
  onToggle,
  variant,
  isFirst,
  isLast,
}) => {
  const { theme, resolvedColors } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Update content height when expanded
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded, item.content]);

  // Item container styles
  const itemStyles: React.CSSProperties = {
    ...(variant === 'default' && {
      borderBottom: !isLast ? `1px solid ${resolvedColors.border.default}` : 'none',
    }),
    ...(variant === 'separated' && {
      border: `1px solid ${resolvedColors.border.default}`,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    }),
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    width: '100%',
    padding: theme.spacing.lg,
    backgroundColor: isExpanded
      ? resolvedColors.surface.hover
      : resolvedColors.surface.default,
    border: 'none',
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    opacity: item.disabled ? 0.5 : 1,
    outline: 'none',
    transition: `all ${theme.duration.fast} ${theme.easing.out}`,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.base.fontSize,
    fontWeight: theme.typography.weights.semibold,
    color: resolvedColors.text.primary,
    textAlign: 'left',
    userSelect: 'none',
  };

  // Icon container styles
  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  };

  // Chevron styles
  const chevronStyles: React.CSSProperties = {
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
    transition: `transform ${theme.duration.fast} ${theme.easing.out}`,
    color: resolvedColors.text.secondary,
    fontSize: '12px',
    flexShrink: 0,
  };

  // Content wrapper styles
  const contentWrapperStyles: React.CSSProperties = {
    height: isExpanded ? `${contentHeight}px` : '0',
    overflow: 'hidden',
    transition: `height ${theme.duration.normal} ${theme.easing.out}`,
  };

  // Content styles
  const contentStyles: React.CSSProperties = {
    padding: `0 ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.lg}`,
    color: resolvedColors.text.secondary,
    fontSize: theme.typography.sizes.base.fontSize,
    lineHeight: theme.typography.sizes.base.lineHeight,
  };

  return (
    <div style={itemStyles}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        style={headerStyles}
        aria-expanded={isExpanded}
        aria-disabled={item.disabled}
        disabled={item.disabled}
      >
        <div style={iconContainerStyles}>
          {item.icon && <span>{item.icon}</span>}
          {item.title}
        </div>
        <div style={chevronStyles}>▼</div>
      </button>

      {/* Content */}
      <div style={contentWrapperStyles}>
        <div ref={contentRef} style={contentStyles}>
          {item.content}
        </div>
      </div>
    </div>
  );
};
