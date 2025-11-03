/**
 * useCopyToClipboard Hook
 *
 * Copy text to clipboard with fallback support.
 * Includes success/error states for user feedback.
 */

'use client';

import { useState, useCallback } from 'react';

export interface CopyToClipboardResult {
  /**
   * Copy text to clipboard
   */
  copy: (text: string) => Promise<void>;

  /**
   * Whether text was successfully copied
   */
  copied: boolean;

  /**
   * Error if copy failed
   */
  error: Error | null;

  /**
   * Reset the copied state
   */
  reset: () => void;
}

/**
 * Hook to copy text to clipboard
 *
 * @param resetDelay - Time in ms before resetting copied state (default: 2000ms)
 * @returns Copy function and state
 *
 * @example
 * ```tsx
 * function ShareButton() {
 *   const { copy, copied, error } = useCopyToClipboard();
 *
 *   return (
 *     <div>
 *       <button onClick={() => copy('https://example.com')}>
 *         {copied ? 'Copied!' : 'Copy Link'}
 *       </button>
 *       {error && <span>Failed to copy</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCopyToClipboard(resetDelay: number = 2000): CopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;

          // Make the textarea invisible
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';

          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          // Execute copy command
          const successful = document.execCommand('copy');
          textArea.remove();

          if (!successful) {
            throw new Error('Copy command failed');
          }
        }

        // Set success state
        setCopied(true);
        setError(null);

        // Reset after delay
        if (resetDelay > 0) {
          setTimeout(() => {
            setCopied(false);
          }, resetDelay);
        }
      } catch (err) {
        const copyError = err instanceof Error ? err : new Error('Failed to copy to clipboard');
        setError(copyError);
        setCopied(false);
        console.error('Copy to clipboard failed:', copyError);
      }
    },
    [resetDelay]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { copy, copied, error, reset };
}
