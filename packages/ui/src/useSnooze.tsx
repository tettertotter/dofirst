/**
 * useSnooze - React hook for snoozing tasks
 *
 * Provides a simple interface to snooze tasks via the API
 */

import { useState, useCallback } from "react";

export interface SnoozeOptions {
  /** Task ID to snooze */
  taskId: string;
  /** Minutes to snooze (relative) */
  minutes?: number;
  /** Preset snooze option */
  preset?: "tonight" | "tomorrow_am" | "tomorrow_pm" | "next_week";
  /** Custom timestamp */
  timestamp?: string;
}

export interface SnoozeResult {
  /** Whether snooze is in progress */
  loading: boolean;
  /** Error if snooze failed */
  error: Error | null;
  /** Snooze the task */
  snooze: (options: SnoozeOptions) => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

export function useSnooze(): SnoozeResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const snooze = useCallback(async (options: SnoozeOptions) => {
    setLoading(true);
    setError(null);

    try {
      const body: any = { taskId: options.taskId };

      if (options.minutes !== undefined) {
        body.minutes = options.minutes;
      } else if (options.preset) {
        body.preset = options.preset;
      } else if (options.timestamp) {
        body.timestamp = options.timestamp;
      } else {
        throw new Error("Must provide minutes, preset, or timestamp");
      }

      const res = await fetch("/api/tasks.snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to snooze task");
      }

      // Success!
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    snooze,
    clearError
  };
}
