/**
 * usePrevious Hook
 *
 * Track previous value of a variable.
 * Useful for animations and comparisons.
 */

'use client';

import { useRef, useEffect } from 'react';

/**
 * Hook to get previous value
 *
 * @param value - Current value
 * @returns Previous value
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 *
 *   return (
 *     <div>
 *       <p>Current: {count}</p>
 *       <p>Previous: {prevCount}</p>
 *       <p>Direction: {count > prevCount ? 'Up' : 'Down'}</p>
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
