/**
 * Tests for useSnooze hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useSnooze } from "./useSnooze";

// Mock fetch
global.fetch = jest.fn();

describe("useSnooze", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test("initial state", () => {
    const { result } = renderHook(() => useSnooze());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.snooze).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  test("snooze with minutes", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    const { result } = renderHook(() => useSnooze());

    await act(async () => {
      await result.current.snooze({
        taskId: "task-123",
        minutes: 10
      });
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/tasks.snooze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "task-123", minutes: 10 })
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("snooze with preset", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    const { result } = renderHook(() => useSnooze());

    await act(async () => {
      await result.current.snooze({
        taskId: "task-123",
        preset: "tomorrow_am"
      });
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/tasks.snooze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "task-123", preset: "tomorrow_am" })
    });
  });

  test("snooze with timestamp", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    const { result } = renderHook(() => useSnooze());
    const timestamp = "2025-11-02T14:00:00Z";

    await act(async () => {
      await result.current.snooze({
        taskId: "task-123",
        timestamp
      });
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/tasks.snooze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "task-123", timestamp })
    });
  });

  test("handles API error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "task_not_found", message: "Task not found" })
    });

    const { result } = renderHook(() => useSnooze());

    await act(async () => {
      try {
        await result.current.snooze({
          taskId: "invalid-task",
          minutes: 10
        });
      } catch (err) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain("Task not found");
  });

  test("handles network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSnooze());

    await act(async () => {
      try {
        await result.current.snooze({
          taskId: "task-123",
          minutes: 10
        });
      } catch (err) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe("Network error");
  });

  test("clearError clears error state", () => {
    const { result } = renderHook(() => useSnooze());

    // Manually set error (would normally come from failed snooze)
    act(() => {
      (result.current as any).error = new Error("Test error");
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  test("throws error if no snooze option provided", async () => {
    const { result } = renderHook(() => useSnooze());

    await act(async () => {
      try {
        await result.current.snooze({
          taskId: "task-123"
          // No minutes, preset, or timestamp
        });
        fail("Should have thrown error");
      } catch (err) {
        expect((err as Error).message).toContain("Must provide");
      }
    });
  });

  test("loading state during snooze", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(promise);

    const { result } = renderHook(() => useSnooze());

    act(() => {
      result.current.snooze({
        taskId: "task-123",
        minutes: 10
      });
    });

    // Should be loading
    expect(result.current.loading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true })
      });
      await promise;
    });

    // Should no longer be loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
