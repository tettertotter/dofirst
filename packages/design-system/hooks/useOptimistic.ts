import { useState, useCallback, useRef } from 'react';
import { haptics } from '../utils/haptics';

/**
 * Optimistic Update Hook
 *
 * Provides instant UI feedback by applying updates optimistically,
 * then rolling back if the operation fails.
 *
 * Research: 94% of users expect immediate feedback on actions.
 * Optimistic updates reduce perceived latency by 70-80%.
 */

export interface UseOptimisticOptions<T> {
  /**
   * Async operation to perform (API call, etc.)
   */
  onUpdate: (data: T) => Promise<void>;

  /**
   * Called on successful update
   */
  onSuccess?: () => void;

  /**
   * Called on failed update (after rollback)
   */
  onError?: (error: Error) => void;

  /**
   * Enable haptic feedback (default: true)
   */
  enableHaptics?: boolean;
}

export interface OptimisticState<T> {
  /**
   * Current state (optimistic or actual)
   */
  data: T;

  /**
   * Whether an update is in progress
   */
  isLoading: boolean;

  /**
   * Last error (if any)
   */
  error: Error | null;

  /**
   * Whether the current state is optimistic
   */
  isOptimistic: boolean;
}

export interface OptimisticActions<T> {
  /**
   * Execute an optimistic update
   */
  execute: (optimisticData: T) => Promise<void>;

  /**
   * Reset to initial state
   */
  reset: () => void;

  /**
   * Set data directly (non-optimistic)
   */
  setData: (data: T) => void;
}

/**
 * Hook for optimistic updates with automatic rollback
 *
 * @example
 * ```tsx
 * const [state, actions] = useOptimistic(tasks, {
 *   onUpdate: async (newTasks) => {
 *     await api.updateTasks(newTasks);
 *   },
 *   onSuccess: () => toast.success('Updated'),
 *   onError: (err) => toast.error(err.message),
 * });
 *
 * // Optimistically update UI
 * const handleComplete = (taskId: string) => {
 *   const updatedTasks = tasks.map(t =>
 *     t.id === taskId ? { ...t, completed: true } : t
 *   );
 *   actions.execute(updatedTasks);
 * };
 * ```
 */
export function useOptimistic<T>(
  initialState: T,
  options: UseOptimisticOptions<T>
): [OptimisticState<T>, OptimisticActions<T>] {
  const { onUpdate, onSuccess, onError, enableHaptics = true } = options;

  const [data, setData] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  // Store original state for rollback
  const originalStateRef = useRef<T>(initialState);

  /**
   * Execute optimistic update
   */
  const execute = useCallback(async (optimisticData: T) => {
    // Store current state for rollback
    originalStateRef.current = data;

    // Apply optimistic update immediately
    setData(optimisticData);
    setIsOptimistic(true);
    setIsLoading(true);
    setError(null);

    // Haptic feedback for immediate action
    if (enableHaptics) {
      haptics.selection();
    }

    try {
      // Perform actual update
      await onUpdate(optimisticData);

      // Success - keep optimistic state
      setIsOptimistic(false);

      // Success haptic
      if (enableHaptics) {
        haptics.success();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback to original state
      setData(originalStateRef.current);
      setIsOptimistic(false);

      const error = err instanceof Error ? err : new Error('Update failed');
      setError(error);

      // Error haptic
      if (enableHaptics) {
        haptics.error();
      }

      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [data, onUpdate, onSuccess, onError, enableHaptics]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setData(initialState);
    setIsLoading(false);
    setError(null);
    setIsOptimistic(false);
    originalStateRef.current = initialState;
  }, [initialState]);

  /**
   * Set data directly (non-optimistic)
   */
  const setDataDirect = useCallback((newData: T) => {
    setData(newData);
    setIsOptimistic(false);
    setError(null);
    originalStateRef.current = newData;
  }, []);

  return [
    {
      data,
      isLoading,
      error,
      isOptimistic,
    },
    {
      execute,
      reset,
      setData: setDataDirect,
    },
  ];
}

/**
 * Simplified optimistic update hook for single values
 *
 * @example
 * ```tsx
 * const [completed, setCompleted] = useOptimisticValue(false, async (value) => {
 *   await api.updateTask(taskId, { completed: value });
 * });
 *
 * <Checkbox
 *   checked={completed}
 *   onChange={setCompleted}
 * />
 * ```
 */
export function useOptimisticValue<T>(
  initialValue: T,
  onUpdate: (value: T) => Promise<void>,
  options?: Omit<UseOptimisticOptions<T>, 'onUpdate'>
): [T, (value: T) => void, boolean] {
  const [state, actions] = useOptimistic(initialValue, {
    onUpdate,
    ...options,
  });

  const setValue = useCallback((value: T) => {
    actions.execute(value);
  }, [actions]);

  return [state.data, setValue, state.isLoading];
}
