import { useState, useEffect, useCallback } from 'react';
import { getStorage, IndexedDBStorage, StorageRecord } from '../utils/storage/indexedDB';

/**
 * IndexedDB Hook
 *
 * React hook for using IndexedDB storage with automatic initialization.
 */

export interface UseIndexedDBOptions {
  /**
   * Store name
   */
  store: string;

  /**
   * Auto-sync interval (ms), 0 to disable
   */
  syncInterval?: number;

  /**
   * Called when sync completes
   */
  onSync?: (unsyncedCount: number) => void;
}

export interface UseIndexedDBReturn<T> {
  /**
   * Set an item
   */
  set: (id: string, data: T) => Promise<void>;

  /**
   * Get an item
   */
  get: (id: string) => Promise<T | null>;

  /**
   * Get all items
   */
  getAll: () => Promise<T[]>;

  /**
   * Delete an item
   */
  remove: (id: string) => Promise<void>;

  /**
   * Clear all items
   */
  clear: () => Promise<void>;

  /**
   * Get unsynced items
   */
  getUnsynced: () => Promise<StorageRecord<T>[]>;

  /**
   * Mark item as synced
   */
  markSynced: (id: string) => Promise<void>;

  /**
   * Count items
   */
  count: () => Promise<number>;

  /**
   * Whether storage is ready
   */
  isReady: boolean;

  /**
   * Storage error (if any)
   */
  error: Error | null;

  /**
   * Storage instance
   */
  storage: IndexedDBStorage;
}

/**
 * Hook for IndexedDB storage
 *
 * @example
 * ```tsx
 * const tasks = useIndexedDB<Task>({
 *   store: 'tasks',
 *   syncInterval: 30000, // Sync every 30s
 *   onSync: (count) => console.log(`Synced ${count} items`),
 * });
 *
 * // Store a task
 * await tasks.set('task-1', { title: 'Buy milk', completed: false });
 *
 * // Get all tasks
 * const allTasks = await tasks.getAll();
 *
 * // Get unsynced tasks
 * const unsynced = await tasks.getUnsynced();
 * ```
 */
export function useIndexedDB<T = any>(
  options: UseIndexedDBOptions
): UseIndexedDBReturn<T> {
  const { store, syncInterval = 0, onSync } = options;

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [storage] = useState(() => getStorage());

  /**
   * Initialize storage
   */
  useEffect(() => {
    storage
      .init()
      .then(() => {
        setIsReady(true);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setIsReady(false);
      });
  }, [storage]);

  /**
   * Set an item
   */
  const set = useCallback(
    async (id: string, data: T): Promise<void> => {
      if (!isReady) throw new Error('Storage not ready');
      await storage.set(store, id, data);
    },
    [storage, store, isReady]
  );

  /**
   * Get an item
   */
  const get = useCallback(
    async (id: string): Promise<T | null> => {
      if (!isReady) throw new Error('Storage not ready');
      return storage.get<T>(store, id);
    },
    [storage, store, isReady]
  );

  /**
   * Get all items
   */
  const getAll = useCallback(async (): Promise<T[]> => {
    if (!isReady) throw new Error('Storage not ready');
    return storage.getAll<T>(store);
  }, [storage, store, isReady]);

  /**
   * Delete an item
   */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!isReady) throw new Error('Storage not ready');
      await storage.delete(store, id);
    },
    [storage, store, isReady]
  );

  /**
   * Clear all items
   */
  const clear = useCallback(async (): Promise<void> => {
    if (!isReady) throw new Error('Storage not ready');
    await storage.clear(store);
  }, [storage, store, isReady]);

  /**
   * Get unsynced items
   */
  const getUnsynced = useCallback(async (): Promise<StorageRecord<T>[]> => {
    if (!isReady) throw new Error('Storage not ready');
    return storage.getUnsynced<T>(store);
  }, [storage, store, isReady]);

  /**
   * Mark item as synced
   */
  const markSynced = useCallback(
    async (id: string): Promise<void> => {
      if (!isReady) throw new Error('Storage not ready');
      await storage.markSynced(store, id);
    },
    [storage, store, isReady]
  );

  /**
   * Count items
   */
  const count = useCallback(async (): Promise<number> => {
    if (!isReady) throw new Error('Storage not ready');
    return storage.count(store);
  }, [storage, store, isReady]);

  /**
   * Auto-sync interval
   */
  useEffect(() => {
    if (!isReady || !syncInterval || syncInterval <= 0) return;

    const interval = setInterval(async () => {
      try {
        const unsynced = await getUnsynced();
        if (onSync) onSync(unsynced.length);
      } catch (err) {
        console.error('Sync check failed:', err);
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [isReady, syncInterval, getUnsynced, onSync]);

  return {
    set,
    get,
    getAll,
    remove,
    clear,
    getUnsynced,
    markSynced,
    count,
    isReady,
    error,
    storage,
  };
}
