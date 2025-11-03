import { useEffect, useCallback, useState } from 'react';

/**
 * Performance Monitoring Hook
 *
 * Tracks Core Web Vitals (LCP, FID, CLS) and custom performance metrics.
 * Critical for understanding real user experience.
 *
 * Research: 1s delay = 7% conversion loss.
 * 53% of users abandon sites that take >3s to load.
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
}

export interface CoreWebVitals {
  lcp: PerformanceMetric | null; // Largest Contentful Paint
  fid: PerformanceMetric | null; // First Input Delay
  cls: PerformanceMetric | null; // Cumulative Layout Shift
  fcp: PerformanceMetric | null; // First Contentful Paint
  ttfb: PerformanceMetric | null; // Time to First Byte
  inp: PerformanceMetric | null; // Interaction to Next Paint
}

export interface UsePerformanceOptions {
  /**
   * Called when a metric is recorded
   */
  onMetric?: (metric: PerformanceMetric) => void;

  /**
   * Whether to report to analytics
   */
  reportToAnalytics?: boolean;

  /**
   * Analytics endpoint
   */
  analyticsEndpoint?: string;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

export interface UsePerformanceReturn {
  /**
   * Core Web Vitals metrics
   */
  metrics: CoreWebVitals;

  /**
   * Mark a custom metric
   */
  mark: (name: string) => void;

  /**
   * Measure time between two marks
   */
  measure: (name: string, startMark: string, endMark?: string) => number | null;

  /**
   * Report a custom metric
   */
  reportMetric: (metric: PerformanceMetric) => void;

  /**
   * Get navigation timing
   */
  getNavigationTiming: () => PerformanceNavigationTiming | null;
}

/**
 * Get rating for a metric
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
    INP: [200, 500],
  };

  const [good, poor] = thresholds[name] || [0, 0];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Hook for performance monitoring
 *
 * @example
 * ```tsx
 * const { metrics, mark, measure } = usePerformance({
 *   onMetric: (metric) => {
 *     console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`);
 *   },
 *   reportToAnalytics: true,
 * });
 *
 * // Custom timing
 * mark('task-start');
 * // ... do work
 * mark('task-end');
 * const duration = measure('task-duration', 'task-start', 'task-end');
 * ```
 */
export function usePerformance(
  options?: UsePerformanceOptions
): UsePerformanceReturn {
  const { onMetric, reportToAnalytics = false, analyticsEndpoint, debug = false } =
    options || {};

  const [metrics, setMetrics] = useState<CoreWebVitals>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
  });

  /**
   * Report a metric
   */
  const reportMetric = useCallback(
    (metric: PerformanceMetric) => {
      if (debug) {
        console.log(`[Performance] ${metric.name}:`, metric);
      }

      if (onMetric) {
        onMetric(metric);
      }

      if (reportToAnalytics && analyticsEndpoint) {
        // Send to analytics endpoint
        navigator.sendBeacon(
          analyticsEndpoint,
          JSON.stringify({
            ...metric,
            url: window.location.href,
            timestamp: Date.now(),
          })
        );
      }

      // Update state
      const key = metric.name.toLowerCase() as keyof CoreWebVitals;
      setMetrics((prev) => ({ ...prev, [key]: metric }));
    },
    [onMetric, reportToAnalytics, analyticsEndpoint, debug]
  );

  /**
   * Initialize Web Vitals monitoring
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // LCP - Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;

        reportMetric({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
          id: lastEntry.id,
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Browser doesn't support
      }

      return observer;
    };

    // FID - First Input Delay
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: getRating('FID', entry.processingStart - entry.startTime),
            id: entry.id,
          });
        });
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Browser doesn't support
      }

      return observer;
    };

    // CLS - Cumulative Layout Shift
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            reportMetric({
              name: 'CLS',
              value: clsValue,
              rating: getRating('CLS', clsValue),
              delta: entry.value,
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Browser doesn't support
      }

      return observer;
    };

    // FCP - First Contentful Paint
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric({
            name: 'FCP',
            value: entry.startTime,
            rating: getRating('FCP', entry.startTime),
          });
        });
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Browser doesn't support
      }

      return observer;
    };

    // TTFB - Time to First Byte
    const measureTTFB = () => {
      const navTiming = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navTiming) {
        const ttfb = navTiming.responseStart - navTiming.requestStart;
        reportMetric({
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
        });
      }
    };

    // INP - Interaction to Next Paint (new metric)
    const observeINP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric({
            name: 'INP',
            value: entry.duration,
            rating: getRating('INP', entry.duration),
          });
        });
      });

      try {
        observer.observe({ entryTypes: ['event'] });
      } catch (e) {
        // Browser doesn't support
      }

      return observer;
    };

    // Initialize all observers
    const lcpObserver = observeLCP();
    const fidObserver = observeFID();
    const clsObserver = observeCLS();
    const fcpObserver = observeFCP();
    const inpObserver = observeINP();

    // Measure TTFB on load
    if (document.readyState === 'complete') {
      measureTTFB();
    } else {
      window.addEventListener('load', measureTTFB);
    }

    // Cleanup
    return () => {
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
      fcpObserver?.disconnect();
      inpObserver?.disconnect();
      window.removeEventListener('load', measureTTFB);
    };
  }, [reportMetric]);

  /**
   * Mark a performance point
   */
  const mark = useCallback((name: string) => {
    if (typeof window === 'undefined' || !performance.mark) return;
    performance.mark(name);
  }, []);

  /**
   * Measure duration between marks
   */
  const measure = useCallback(
    (name: string, startMark: string, endMark?: string): number | null => {
      if (typeof window === 'undefined' || !performance.measure) return null;

      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        const lastEntry = entries[entries.length - 1];
        return lastEntry ? lastEntry.duration : null;
      } catch (e) {
        return null;
      }
    },
    []
  );

  /**
   * Get navigation timing
   */
  const getNavigationTiming = useCallback((): PerformanceNavigationTiming | null => {
    if (typeof window === 'undefined') return null;

    const navTiming = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    return navTiming || null;
  }, []);

  return {
    metrics,
    mark,
    measure,
    reportMetric,
    getNavigationTiming,
  };
}

/**
 * Get current Core Web Vitals (one-time measurement)
 */
export async function getCoreWebVitals(): Promise<Partial<CoreWebVitals>> {
  if (typeof window === 'undefined') {
    return {};
  }

  const vitals: Partial<CoreWebVitals> = {};

  // Get TTFB
  const navTiming = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;
  if (navTiming) {
    const ttfb = navTiming.responseStart - navTiming.requestStart;
    vitals.ttfb = {
      name: 'TTFB',
      value: ttfb,
      rating: getRating('TTFB', ttfb),
    };
  }

  return vitals;
}
