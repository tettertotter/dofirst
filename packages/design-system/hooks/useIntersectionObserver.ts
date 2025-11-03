import { useEffect, useRef, useState, RefObject } from 'react';

/**
 * Intersection Observer Hook
 *
 * Detect when elements enter/exit viewport. Perfect for:
 * - Lazy loading images
 * - Infinite scroll
 * - Analytics tracking
 * - Animations on scroll
 *
 * Research: Lazy loading with intersection observer improves page load by 53%.
 */

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * Called when intersection changes
   */
  onChange?: (entry: IntersectionObserverEntry) => void;

  /**
   * Only trigger once
   */
  triggerOnce?: boolean;

  /**
   * Enable/disable observer
   */
  enabled?: boolean;
}

export interface UseIntersectionObserverReturn {
  /**
   * Whether element is intersecting
   */
  isIntersecting: boolean;

  /**
   * Latest intersection entry
   */
  entry: IntersectionObserverEntry | null;

  /**
   * Ref to attach to element
   */
  ref: RefObject<Element>;
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver(
  options?: UseIntersectionObserverOptions
): UseIntersectionObserverReturn {
  const {
    onChange,
    triggerOnce = false,
    enabled = true,
    root = null,
    rootMargin = '0px',
    threshold = 0,
  } = options || {};

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<Element>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !enabled || (triggerOnce && hasTriggered)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const latestEntry = entries[0];

        setEntry(latestEntry);
        setIsIntersecting(latestEntry.isIntersecting);

        if (latestEntry.isIntersecting && triggerOnce) {
          setHasTriggered(true);
        }

        if (onChange) {
          onChange(latestEntry);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [onChange, triggerOnce, enabled, root, rootMargin, threshold, hasTriggered]);

  return {
    isIntersecting,
    entry,
    ref: elementRef,
  };
}

/**
 * Hook for lazy loading images
 */
export function useLazyLoad(options?: Omit<UseIntersectionObserverOptions, 'triggerOnce'>) {
  const { isIntersecting, ref } = useIntersectionObserver({
    ...options,
    triggerOnce: true,
    rootMargin: '50px', // Start loading slightly before entering viewport
  });

  return {
    shouldLoad: isIntersecting,
    ref,
  };
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options?: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  }
) {
  const { enabled = true, threshold = 0.5, rootMargin = '100px' } = options || {};

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold,
    rootMargin,
    enabled,
    onChange: (entry) => {
      if (entry.isIntersecting && enabled) {
        onLoadMore();
      }
    },
  });

  return {
    ref,
    isLoading: isIntersecting,
  };
}

/**
 * Hook for scroll animations
 */
export function useScrollAnimation(options?: {
  threshold?: number;
  triggerOnce?: boolean;
}) {
  const { threshold = 0.3, triggerOnce = true } = options || {};

  const { isIntersecting, entry, ref } = useIntersectionObserver({
    threshold,
    triggerOnce,
  });

  return {
    ref,
    isVisible: isIntersecting,
    progress: entry ? entry.intersectionRatio : 0,
  };
}

/**
 * Hook for viewport visibility tracking (analytics)
 */
export function useViewportTracking(
  onVisible: (duration: number) => void,
  options?: {
    threshold?: number;
    minVisibleTime?: number; // ms
  }
) {
  const { threshold = 0.5, minVisibleTime = 1000 } = options || {};
  const startTimeRef = useRef<number | null>(null);
  const hasTrackedRef = useRef(false);

  const { ref } = useIntersectionObserver({
    threshold,
    onChange: (entry) => {
      if (entry.isIntersecting) {
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
        }
      } else {
        if (startTimeRef.current && !hasTrackedRef.current) {
          const duration = Date.now() - startTimeRef.current;
          if (duration >= minVisibleTime) {
            onVisible(duration);
            hasTrackedRef.current = true;
          }
          startTimeRef.current = null;
        }
      }
    },
  });

  return { ref };
}

/**
 * Check if Intersection Observer is supported
 */
export function isIntersectionObserverSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}
