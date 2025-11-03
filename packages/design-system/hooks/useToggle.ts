/**
 * useToggle Hook
 *
 * Simple hook for boolean toggle state.
 * Cleaner than useState for on/off states.
 */

'use client';

import { useState, useCallback } from 'react';

export interface UseToggleResult {
  /**
   * Current boolean value
   */
  value: boolean;

  /**
   * Toggle the value (true -> false, false -> true)
   */
  toggle: () => void;

  /**
   * Set to true
   */
  setTrue: () => void;

  /**
   * Set to false
   */
  setFalse: () => void;

  /**
   * Set to specific value
   */
  setValue: (value: boolean) => void;
}

/**
 * Hook for boolean toggle state
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Toggle controls
 *
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { value: isOpen, toggle, setFalse } = useToggle(false);
 *
 *   return (
 *     <>
 *       <button onClick={toggle}>Toggle Sidebar</button>
 *       {isOpen && (
 *         <div>
 *           <SidebarContent />
 *           <button onClick={setFalse}>Close</button>
 *         </div>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useToggle(initialValue: boolean = false): UseToggleResult {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}
