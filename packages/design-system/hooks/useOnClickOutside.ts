/**
 * useOnClickOutside Hook
 *
 * Detects clicks outside an element.
 * Essential for dropdowns, modals, and popovers.
 */

'use client';

import { RefObject, useEffect } from 'react';

/**
 * Hook to detect clicks outside an element
 *
 * @param ref - React ref to the element
 * @param handler - Callback when click outside occurs
 * @param enabled - Whether the hook is enabled (default: true)
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const dropdownRef = useRef<HTMLDivElement>(null);
 *
 *   useOnClickOutside(dropdownRef, () => setIsOpen(false), isOpen);
 *
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | RefObject<T>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref];

      // Check if click is inside any of the refs
      const isInside = refs.some((r) => {
        const element = r.current;
        if (!element) {
          return false;
        }

        // Check if the click target is the element or a child
        return element.contains(event.target as Node);
      });

      // If click is outside all refs, call handler
      if (!isInside) {
        handler(event);
      }
    };

    // Add listeners for both mouse and touch events
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
