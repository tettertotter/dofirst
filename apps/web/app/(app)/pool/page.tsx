"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, Spinner, useTheme, spacing, Button, Badge, Skeleton } from "@todaypool/design-system";
import { SnoozeChips, SnoozeModal, useSnooze } from "@todaypool/ui";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  due_at: string | null;
  status: string;
  created_at: string;
  pool_id: string;
}

export default function PoolPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | undefined>();
  const { resolvedColors } = useTheme();

  // Snooze modal state
  const { modalTask, openSnoozeModal, closeSnoozeModal, handleSnooze } = useSnooze({
    onSuccess: async () => {
      setMessage("✓ Task snoozed successfully");
      await fetchTasks();
      setTimeout(() => setMessage(undefined), 3000);
    },
    onError: (error) => {
      setMessage(`Error: ${error}`);
    },
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Get user's pool memberships
      const { data: memberships } = await supabase
        .from("pool_members")
        .select("pool_id")
        .eq("user_id", session.user.id);

      if (!memberships || memberships.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const poolIds = memberships.map(m => m.pool_id);

      // Fetch open tasks from user's pools
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .in("pool_id", poolIds)
        .eq("status", "open")
        .order("due_at", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to load tasks"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    setActionLoading(taskId);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to complete task");
      }

      setMessage("✓ Task completed!");
      await fetchTasks();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to complete task"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickSnooze = async (taskId: string, minutes: number) => {
    setActionLoading(taskId);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, minutes })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to snooze task");
      }

      setMessage(`✓ Task snoozed ${minutes}m`);
      await fetchTasks();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to snooze task"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "#ef4444"; // red
    if (priority === 3) return "#f59e0b"; // amber
    return "#6b7280"; // gray
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 5) return "Urgent";
    if (priority === 4) return "High";
    if (priority === 3) return "Med";
    if (priority === 2) return "Low";
    return "Info";
  };

  const formatDueDate = (dueAt: string | null) => {
    if (!dueAt) return null;
    const date = new Date(dueAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < -60) {
      return { text: "Overdue", color: "#ef4444" };
    } else if (diffMins < 0) {
      return { text: `${Math.abs(diffMins)}m overdue`, color: "#ef4444" };
    } else if (diffMins < 60) {
      return { text: `${diffMins}m`, color: "#f59e0b" };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h`, color: "#3b82f6" };
    } else if (diffDays < 7) {
      return { text: `${diffDays}d`, color: "#6b7280" };
    } else {
      return { text: date.toLocaleDateString(), color: "#6b7280" };
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: resolvedColors.text.primary,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            Pool
          </h1>
          <p style={{
            fontSize: '14px',
            color: resolvedColors.text.secondary,
            margin: 0
          }}>
            All your tasks in one place
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div style={{ padding: spacing.md }}>
                <Skeleton width="60%" height={20} style={{ marginBottom: spacing.sm }} />
                <Skeleton width="100%" height={16} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: resolvedColors.text.primary,
            margin: 0
          }}>
            Pool
          </h1>
        </div>
        <Card>
          <div style={{ padding: spacing.xl, textAlign: 'center' }}>
            <p style={{ color: resolvedColors.text.secondary }}>
              Please sign in to view your tasks.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: resolvedColors.text.primary,
          margin: 0,
          marginBottom: spacing.xs
        }}>
          Pool
        </h1>
        <p style={{
          fontSize: '14px',
          color: resolvedColors.text.secondary,
          margin: 0
        }}>
          {tasks.length} open task{tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status Messages */}
      {message && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: message.startsWith("Error") ? "#fee" : "#efe",
            color: message.startsWith("Error") ? "#c00" : "#060",
            marginBottom: spacing.lg,
            fontSize: 14
          }}
        >
          {message}
        </div>
      )}

      {tasks.length === 0 ? (
        <Card>
          <div style={{ padding: spacing.xl, textAlign: 'center' }}>
            <p style={{
              color: resolvedColors.text.secondary,
              marginBottom: spacing.lg
            }}>
              No open tasks. Use the + Add button to create your first task.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {tasks.map((task) => {
            const dueInfo = formatDueDate(task.due_at);
            const isLoading = actionLoading === task.id;

            return (
              <Card key={task.id}>
                <div style={{ padding: spacing.md }}>
                  {/* Header: Title + Priority + Due */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.sm
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: resolvedColors.text.primary,
                      margin: 0,
                      flex: 1
                    }}>
                      {task.title}
                    </h3>
                    <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
                      <Badge
                        color={getPriorityColor(task.priority)}
                        size="sm"
                      >
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      {dueInfo && (
                        <Badge color={dueInfo.color} size="sm">
                          {dueInfo.text}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p style={{
                      fontSize: '14px',
                      color: resolvedColors.text.secondary,
                      margin: 0,
                      marginBottom: spacing.sm
                    }}>
                      {task.description}
                    </p>
                  )}

                  {/* Actions: Snooze + Complete */}
                  <div style={{
                    display: 'flex',
                    gap: spacing.sm,
                    marginTop: spacing.md,
                    flexWrap: 'wrap'
                  }}>
                    <SnoozeChips
                      taskId={task.id}
                      onQuickSnooze={(id, minutes) => handleQuickSnooze(id, minutes)}
                      onMoreOptions={(id) => openSnoozeModal(task)}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleComplete(task.id)}
                      variant="success"
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : "✓ Done"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Snooze Modal */}
      <SnoozeModal
        task={modalTask}
        open={!!modalTask}
        onClose={closeSnoozeModal}
        onSnooze={handleSnooze}
      />
    </div>
  );
}
