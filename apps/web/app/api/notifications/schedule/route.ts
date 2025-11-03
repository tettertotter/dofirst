/**
 * POST /api/notifications/schedule
 * Schedule notifications for a task using nagging scheduler
 *
 * Computes next 3 notification times based on:
 * - Task due_at
 * - User quiet hours
 * - Cadence (task-specific or user default or system default)
 *
 * Stores scheduled times in task_nagging_state for cron job to process
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "@/lib/supabase-server";
import { z } from "zod";
import { computeSchedule, DEFAULT_CADENCE } from "@todaypool/nagging";
import type { Cadence, QuietHours } from "@todaypool/nagging";

// Zod schema for schedule request
const ScheduleRequestSchema = z.object({
  taskId: z.string().uuid(),
  times: z.array(z.string().datetime()).optional(), // ISO 8601 timestamps (legacy support)
  payload: z.object({
    taskId: z.string().uuid(),
    title: z.string(),
    body: z.string().optional(),
    dueAt: z.string().datetime(),
    priority: z.number().int().min(1).max(5).optional(),
    poolId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  }),
  platform: z.enum(["web", "ios", "android"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = req.headers.get("authorization");
    const user = await getAuthUser(supabase, authHeader);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Parse and validate request
    const body = await req.json();
    const parsed = ScheduleRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_payload", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { taskId, payload } = parsed.data;

    // Verify task exists and user has access
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, due_at, snooze_cadence, priority, pool_id, owner_id")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: "task_not_found", message: "Task not found or access denied" },
        { status: 404 }
      );
    }

    // Verify user is a member of the task's pool
    const { data: membership } = await supabase
      .from("pool_members")
      .select("id")
      .eq("pool_id", task.pool_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "forbidden", message: "You do not have access to this task" },
        { status: 403 }
      );
    }

    // Get user nagging preferences
    const { data: prefs } = await supabase
      .from("nagging_preferences")
      .select("quiet_hours, default_cadence, enabled")
      .eq("user_id", user.id)
      .single();

    // If nagging disabled for this user, don't schedule
    if (prefs && !prefs.enabled) {
      return NextResponse.json({
        success: true,
        scheduledCount: 0,
        notificationIds: [],
        message: "Nagging disabled for user",
      });
    }

    // Determine cadence: task-specific > user default > system default
    const cadence: Cadence =
      (task.snooze_cadence as Cadence) ||
      (prefs?.default_cadence as Cadence) ||
      DEFAULT_CADENCE;

    // Parse quiet hours
    const quietHours: QuietHours | null = prefs?.quiet_hours
      ? (prefs.quiet_hours as QuietHours)
      : null;

    // Compute next 3 notification times
    const dueAt = task.due_at ? new Date(task.due_at) : new Date();
    const now = new Date();

    const schedule = computeSchedule(dueAt, now, quietHours, cadence, 3, 0);

    // Store scheduled times in task_nagging_state
    const scheduledTimesJson = schedule.times.map((t) => t.toISOString());

    const { error: stateError } = await supabase
      .from("task_nagging_state")
      .upsert(
        {
          task_id: taskId,
          step_index: 0,
          last_notified_at: null,
          scheduled_times: scheduledTimesJson,
          paused: false,
          notification_count: 0,
        },
        {
          onConflict: "task_id",
        }
      );

    if (stateError) {
      console.error("[notifications/schedule] Error updating state:", stateError);
      return NextResponse.json(
        { error: "database_error", message: stateError.message },
        { status: 500 }
      );
    }

    console.log(
      `[notifications/schedule] Scheduled ${schedule.times.length} notifications for task ${taskId}`,
      scheduledTimesJson
    );

    // Return notification IDs (timestamps serve as IDs)
    const notificationIds = schedule.times.map((t, i) => `${taskId}-${i}-${t.getTime()}`);

    return NextResponse.json({
      success: true,
      scheduledCount: schedule.times.length,
      notificationIds,
      scheduledTimes: scheduledTimesJson,
      hasQuietHours: schedule.hasQuietHours,
      catchUpAt: schedule.catchUpAt?.toISOString(),
    });
  } catch (error: any) {
    console.error("[notifications/schedule] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error", message: error.message },
      { status: 500 }
    );
  }
}
