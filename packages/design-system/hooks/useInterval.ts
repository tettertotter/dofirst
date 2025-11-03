/**
 * useInterval Hook
 *
 * Declarative setInterval with automatic cleanup.
 * Safe to use with changing callbacks.
 */

'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook for intervals
 *
 * @param callback - Function to call on each interval
 * @param delay - Delay in milliseconds (null to pause)
 *
 * @example
 * ```tsx
 * function Countdown() {
 *   const [seconds, setSeconds] = useState(60);
 *
 *   useInterval(() => {
 *     if (seconds > 0) {
 *       setSeconds(seconds - 1);
 *     }
 *   }, seconds > 0 ? 1000 : null);
 *
 *   return <div>{seconds} seconds remaining</div>;
 * }
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if delay is null
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay]);
}

/**
 * useTimeout Hook
 *
 * Declarative setTimeout with automatic cleanup.
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    // Don't schedule if delay is null
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay]);
}
