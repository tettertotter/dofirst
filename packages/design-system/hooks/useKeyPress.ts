/**
 * useKeyPress Hook
 *
 * Detect keyboard shortcuts and key presses.
 * Essential for accessibility and power user features.
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect key presses
 *
 * @param targetKey - Key to detect (e.g., 'Escape', 'Enter', 'k')
 * @param modifiers - Optional modifier keys (ctrl, alt, shift, meta)
 * @returns Whether the key is currently pressed
 *
 * @example
 * ```tsx
 * function SearchModal() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const cmdK = useKeyPress('k', { meta: true });
 *   const escape = useKeyPress('Escape');
 *
 *   useEffect(() => {
 *     if (cmdK) setIsOpen(true);
 *     if (escape) setIsOpen(false);
 *   }, [cmdK, escape]);
 *
 *   return isOpen && <Modal>Search...</Modal>;
 * }
 * ```
 */
export function useKeyPress(
  targetKey: string,
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  }
): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      // Check if the key matches
      if (event.key !== targetKey) {
        return;
      }

      // Check modifiers if specified
      if (modifiers) {
        if (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) {
          return;
        }
        if (modifiers.alt !== undefined && event.altKey !== modifiers.alt) {
          return;
        }
        if (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) {
          return;
        }
        if (modifiers.meta !== undefined && event.metaKey !== modifiers.meta) {
          return;
        }
      }

      setKeyPressed(true);
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey, modifiers]);

  return keyPressed;
}

/**
 * Hook to execute callback on key press
 *
 * @param targetKey - Key to detect
 * @param callback - Function to call when key is pressed
 * @param modifiers - Optional modifier keys
 *
 * @example
 * ```tsx
 * function Editor() {
 *   useKeyPressEvent('s', () => save(), { meta: true });
 *   useKeyPressEvent('Escape', () => closeModal());
 *
 *   return <textarea />;
 * }
 * ```
 */
export function useKeyPressEvent(
  targetKey: string,
  callback: (event: KeyboardEvent) => void,
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  }
): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Check if the key matches
      if (event.key !== targetKey) {
        return;
      }

      // Check modifiers if specified
      if (modifiers) {
        if (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) {
          return;
        }
        if (modifiers.alt !== undefined && event.altKey !== modifiers.alt) {
          return;
        }
        if (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) {
          return;
        }
        if (modifiers.meta !== undefined && event.metaKey !== modifiers.meta) {
          return;
        }
      }

      // Prevent default and call callback
      event.preventDefault();
      callback(event);
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [targetKey, callback, modifiers]);
}
