"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, Button, Skeleton, useToast, spacing, useTheme, Spinner } from "@todaypool/design-system";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number | null;
  sort_order: number;
  due_at: string | null;
  status: string;
  created_at: string;
  pool_id: string;
}

interface PriorityLabel {
  priority_number: number;
  label: string;
}

export default function TodayPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorityLabels, setPriorityLabels] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();
  const { theme, isDark, resolvedColors } = useTheme();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      setUser(session.user);
      fetchTodayTasks();
    });
  }, []);

  async function fetchTodayTasks() {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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

    // Fetch only priority 1 ("Today") tasks
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .in("pool_id", poolIds)
      .eq("priority", 1)
      .neq("status", "done")
      .neq("status", "archived")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch today tasks:", error);
    }

    setTasks((data as any) || []);

    // Fetch priority labels for these pools
    const { data: labels } = await supabase
      .from("priority_labels")
      .select("priority_number, label")
      .in("pool_id", poolIds);

    if (labels) {
      const labelsMap = new Map<number, string>();
      (labels as PriorityLabel[]).forEach(pl => {
        labelsMap.set(pl.priority_number, pl.label);
      });
      setPriorityLabels(labelsMap);
    }

    setLoading(false);
  }

  async function handleComplete(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/tasks.complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to complete");
      }

      setTasks(prev => prev.filter(t => t.id !== id));
      showToast({ variant: "success", message: "✓ Task completed!" });
    } catch (err: any) {
      showToast({ variant: "error", message: err.message || "Failed to complete task" });
    } finally {
      setActionLoading(null);
    }
  }

  async function moveToPriority(taskId: string, newPriority: number) {
    setActionLoading(taskId);
    try {
      const res = await fetch("/api/tasks.update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, priority: newPriority })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to move task");
      }

      setTasks(prev => prev.filter(t => t.id !== taskId));
      const label = priorityLabels.get(newPriority) || `Priority ${newPriority}`;
      showToast({ variant: "success", message: `Moved to ${label}` });
    } catch (err: any) {
      showToast({ variant: "error", message: err.message || "Failed to move task" });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing.lg }}>
        <Skeleton height={80} style={{ marginBottom: spacing.md }} />
        <Skeleton height={120} style={{ marginBottom: spacing.md }} />
        <Skeleton height={120} style={{ marginBottom: spacing.md }} />
        <Skeleton height={120} />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 48px 64px 48px'
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Today
          </h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.assign("/pool")}
          >
            Go to Pool
          </Button>
        </div>
        <p style={{
          margin: 0,
          fontSize: '15px',
          fontWeight: 400,
          opacity: 0.6,
          lineHeight: 1.5
        }}>
          {tasks.length === 0
            ? "No tasks for today"
            : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} to focus on today`}
        </p>
      </div>

      {/* Empty State */}
      {tasks.length === 0 ? (
        <Card
          padding="none"
          variant="outlined"
          style={{
            textAlign: 'center',
            boxShadow: isDark ? theme.shadows.dark.sm : theme.shadows.light.sm
          }}
        >
          <div style={{ padding: `${spacing['2xl']} ${spacing.xl}` }}>
            <div style={{
              fontSize: '56px',
              marginBottom: spacing.lg,
              opacity: 0.3,
              lineHeight: 1
            }}>
              ☀️
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: `0 0 ${spacing.sm}`,
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}>
              Nothing scheduled for today
            </h2>
            <p style={{
              fontSize: '15px',
              fontWeight: 400,
              opacity: 0.6,
              lineHeight: 1.6,
              margin: `0 auto ${spacing.lg}`,
              maxWidth: '420px'
            }}>
              Go to the Pool to add tasks to your Today list
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.assign("/pool")}
            >
              View Pool
            </Button>
          </div>
        </Card>
      ) : (
        /* Today Tasks List */
        <div style={{ display: 'grid', gap: spacing.lg }}>
          {tasks.map((task) => (
            <Card key={task.id} padding="lg" variant="elevated">
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: resolvedColors.text.primary,
                margin: `0 0 ${task.description ? spacing.sm : 0}`,
                lineHeight: 1.5
              }}>
                {task.title}
              </h3>

              {task.description && (
                <p style={{
                  fontSize: '14px',
                  color: resolvedColors.text.secondary,
                  margin: `0 0 ${spacing.lg}`,
                  lineHeight: 1.5
                }}>
                  {task.description}
                </p>
              )}

              <div style={{
                display: 'flex',
                gap: spacing.sm,
                marginTop: spacing.lg,
                flexWrap: 'wrap'
              }}>
                <Button
                  onClick={() => handleComplete(task.id)}
                  variant="success"
                  size="md"
                  disabled={actionLoading === task.id}
                >
                  {actionLoading === task.id ? <Spinner size="sm" /> : "✓ Done"}
                </Button>
                <Button
                  onClick={() => moveToPriority(task.id, 2)}
                  variant="secondary"
                  size="sm"
                  disabled={actionLoading === task.id}
                >
                  → {priorityLabels.get(2) || "This Week"}
                </Button>
                <Button
                  onClick={() => moveToPriority(task.id, 3)}
                  variant="secondary"
                  size="sm"
                  disabled={actionLoading === task.id}
                >
                  → {priorityLabels.get(3) || "Priority 3"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
