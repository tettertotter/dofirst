/**
 * useWindowSize Hook
 *
 * Track window dimensions for responsive layouts.
 * Debounced for performance.
 */

'use client';

import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook to get current window size
 *
 * @param debounceDelay - Delay in milliseconds to debounce resize events (default: 150ms)
 * @returns Window width and height
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { width, height } = useWindowSize();
 *
 *   return (
 *     <div>
 *       Window size: {width} x {height}
 *       {width < 640 && <MobileView />}
 *       {width >= 640 && width < 1024 && <TabletView />}
 *       {width >= 1024 && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindowSize(debounceDelay: number = 150): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceDelay);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Set initial size
    handleResize();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceDelay]);

  return windowSize;
}
