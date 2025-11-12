/**
 * Select Component
 *
 * Professional dropdown select with keyboard navigation.
 * Accessible, smooth animations, comprehensive features.
 */

'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';

/**
 * Select Option
 */
export interface SelectOption {
  /**
   * Option value
   */
  value: string;

  /**
   * Option label
   */
  label: string;

  /**
   * Whether option is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon
   */
  icon?: React.ReactNode;
}

/**
 * Select Size
 */
export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * Select Props
 */
export interface SelectProps {
  /**
   * Options to display
   */
  options: SelectOption[];

  /**
   * Selected value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Input label
   */
  label?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Error message
   */
  errorMessage?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Size
   * @default 'md'
   */
  size?: SelectSize;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Search/filter functionality
   */
  searchable?: boolean;

  /**
   * Clear button
   */
  clearable?: boolean;

  /**
   * Required field
   */
  required?: boolean;
}

/**
 * Select Component
 *
 * Professional select with:
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Search/filter
 * - Clearable
 * - Error states
 * - Full accessibility
 * - Portal rendering for dropdown
 * - Smart positioning
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select...',
      label,
      helperText,
      error = false,
      errorMessage,
      disabled = false,
      size = 'md',
      className,
      searchable = false,
      clearable = false,
      required = false,
    },
    ref
  ) => {
    const { theme, resolvedColors, isDark } = useTheme();  // Added isDark ⭐
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Get selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search
    const filteredOptions = searchable && searchQuery
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Size configurations
    const sizeConfig = {
      sm: {
        height: '32px',
        fontSize: theme.typography.sizes.sm.fontSize,
        padding: '6px 12px',
        iconSize: '14px',
      },
      md: {
        height: '40px',
        fontSize: theme.typography.sizes.base.fontSize,
        padding: '8px 16px',
        iconSize: '16px',
      },
      lg: {
        height: '48px',
        fontSize: theme.typography.sizes.lg.fontSize,
        padding: '12px 20px',
        iconSize: '18px',
      },
    };

    const currentSize = sizeConfig[size];

    // Calculate dropdown position
    useEffect(() => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }, [isOpen]);

    // Handle click outside and scroll
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      const handleScroll = () => {
        setIsOpen(false);
        setSearchQuery('');
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
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            break;
          case 'Enter':
            event.preventDefault();
            if (filteredOptions[highlightedIndex] && !filteredOptions[highlightedIndex].disabled) {
              onChange?.(filteredOptions[highlightedIndex].value);
              setIsOpen(false);
              setSearchQuery('');
            }
            break;
          case 'Escape':
            event.preventDefault();
            setIsOpen(false);
            setSearchQuery('');
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, filteredOptions, onChange]);

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        setHighlightedIndex(0);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
    };

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.xs,
      width: '100%',
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      fontFamily: theme.typography.fonts.primary,
      fontSize: theme.typography.sizes.sm.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: resolvedColors.text.primary,
    };

    // Select button styles
    const selectStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      width: '100%',
      height: currentSize.height,
      padding: currentSize.padding,
      fontFamily: theme.typography.fonts.primary,
      fontSize: currentSize.fontSize,
      backgroundColor: resolvedColors.surface.primary,
      border: `1px solid ${
        error ? theme.colors.error[500] : resolvedColors.border.default
      }`,
      borderRadius: theme.radius.md,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      outline: 'none',
      transition: `all ${theme.duration.fast} ${theme.easing.easeOut}`,
      boxShadow: isOpen ? theme.shadows.focus.default : 'none',
    };

    // Dropdown styles
    const dropdownStyles: React.CSSProperties = {
      position: 'fixed',
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      width: `${dropdownPosition.width}px`,
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: resolvedColors.surface.primary,
      border: `1px solid ${resolvedColors.border.default}`,
      borderRadius: theme.radius.lg,  // 12px (was radius.md = 8px) ⭐ Match card styling
      boxShadow: isDark ? theme.shadows.dark.lg : theme.shadows.light.lg,  // Use dark shadow in dark mode ⭐
      zIndex: theme.zIndex.popover,  // Use popover z-index (1400) to render above modals (1300)
      animation: 'selectDropdownOpen 0.15s ease-out',
    };

    // Option styles
    const getOptionStyles = (option: SelectOption, index: number): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: currentSize.padding,
      fontSize: currentSize.fontSize,
      cursor: option.disabled ? 'not-allowed' : 'pointer',
      backgroundColor:
        index === highlightedIndex
          ? resolvedColors.surface.hover
          : 'transparent',
      color: option.disabled ? resolvedColors.text.disabled : resolvedColors.text.primary,
      opacity: option.disabled ? 0.5 : 1,
      transition: `background-color ${theme.duration.fast} ${theme.easing.easeOut}`,
    });

    // Search input styles
    const searchInputStyles: React.CSSProperties = {
      width: '100%',
      padding: currentSize.padding,
      border: 'none',
      borderBottom: `1px solid ${resolvedColors.border.default}`,
      backgroundColor: resolvedColors.surface.primary,
      color: resolvedColors.text.primary,
      fontSize: currentSize.fontSize,
      outline: 'none',
      fontFamily: theme.typography.fonts.primary,
    };

    // Helper/Error text styles
    const helperTextStyles: React.CSSProperties = {
      fontSize: theme.typography.sizes.sm.fontSize,
      color: error ? theme.colors.error[500] : resolvedColors.text.secondary,
    };

    // Keyframes
    const keyframesStyle = `
      @keyframes selectDropdownOpen {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    return (
      <>
        <style>{keyframesStyle}</style>
        <div ref={ref} className={className} style={containerStyles}>
          {/* Label */}
          {label && (
            <label style={labelStyles}>
              {label}
              {required && <span style={{ color: theme.colors.error[500] }}> *</span>}
            </label>
          )}

          {/* Select Button */}
          <div
            ref={containerRef}
            onClick={handleToggle}
            style={selectStyles}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={label}
            tabIndex={disabled ? -1 : 0}
          >
            {/* Selected value or placeholder */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                color: selectedOption
                  ? resolvedColors.text.primary
                  : resolvedColors.text.tertiary,
              }}
            >
              {selectedOption?.icon && <span>{selectedOption.icon}</span>}
              {selectedOption ? selectedOption.label : placeholder}
            </div>

            {/* Clear button */}
            {clearable && selectedOption && !disabled && (
              <button
                onClick={handleClear}
                style={{
                  padding: theme.spacing[1],  // 4px (was hardcoded '2px') ⭐ Use theme spacing
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: resolvedColors.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: theme.radius.sm,  // Add subtle rounding for hover states
                  transition: theme.transition.color.value,
                }}
                aria-label="Clear selection"
              >
                ✕
              </button>
            )}

            {/* Dropdown icon */}
            <div
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: `transform ${theme.duration.fast} ${theme.easing.easeOut}`,
                color: resolvedColors.text.secondary,
                fontSize: currentSize.iconSize,
              }}
            >
              ▼
            </div>
          </div>

          {/* Helper/Error text */}
          {(helperText || errorMessage) && (
            <span style={helperTextStyles}>{error ? errorMessage : helperText}</span>
          )}
        </div>

        {/* Dropdown (Portal) */}
        {isOpen &&
          typeof document !== 'undefined' &&
          createPortal(
            <div ref={dropdownRef} style={dropdownStyles} role="listbox">
              {/* Search input */}
              {searchable && (
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  style={searchInputStyles}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* Options */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange?.(option.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={getOptionStyles(option, index)}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled}
                  >
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: currentSize.padding,
                    color: resolvedColors.text.tertiary,
                    fontSize: currentSize.fontSize,
                    textAlign: 'center',
                  }}
                >
                  No options found
                </div>
              )}
            </div>,
            document.body
          )}
      </>
    );
  }
);

Select.displayName = 'Select';
