/**
 * GET /api/notifications/pending
 * Get pending scheduled notifications for the current user or specific task
 *
 * Query params:
 * - taskId (optional): Filter by specific task
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const authHeader = req.headers.get("authorization");
    const user = await getAuthUser(supabase, authHeader);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get taskId from query params
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (taskId) {
      // Get pending notifications for specific task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("id, pool_id")
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

      // Get nagging state for this task
      const { data: state, error: stateError } = await supabase
        .from("task_nagging_state")
        .select("*")
        .eq("task_id", taskId)
        .single();

      if (stateError || !state) {
        return NextResponse.json({
          notificationIds: [],
          pending: [],
        });
      }

      const scheduledTimes = state.scheduled_times as string[] || [];
      const now = new Date();

      // Filter to future times only
      const futureTimes = scheduledTimes.filter((t) => new Date(t) > now);

      const notificationIds = futureTimes.map(
        (t, i) => `${taskId}-${state.step_index + i}-${new Date(t).getTime()}`
      );

      return NextResponse.json({
        notificationIds,
        pending: futureTimes.map((t, i) => ({
          id: notificationIds[i],
          taskId,
          scheduledAt: t,
        })),
      });
    }

    // Get all pending notifications for user's tasks
    const { data: memberships, error: membershipError } = await supabase
      .from("pool_members")
      .select("pool_id")
      .eq("user_id", user.id);

    if (membershipError) {
      console.error("[notifications/pending] Error fetching memberships:", membershipError);
      return NextResponse.json(
        { error: "database_error", message: membershipError.message },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        notificationIds: [],
        pending: [],
      });
    }

    const poolIds = memberships.map((m) => m.pool_id);

    // Get all tasks in those pools with nagging state
    const { data: states, error: statesError } = await supabase
      .from("task_nagging_state")
      .select(`
        task_id,
        scheduled_times,
        step_index,
        tasks!inner(pool_id)
      `)
      .in("tasks.pool_id", poolIds)
      .eq("paused", false);

    if (statesError) {
      console.error("[notifications/pending] Error fetching states:", statesError);
      return NextResponse.json(
        { error: "database_error", message: statesError.message },
        { status: 500 }
      );
    }

    if (!states || states.length === 0) {
      return NextResponse.json({
        notificationIds: [],
        pending: [],
      });
    }

    const now = new Date();
    const pending: any[] = [];

    for (const state of states) {
      const scheduledTimes = state.scheduled_times as string[] || [];
      const futureTimes = scheduledTimes.filter((t) => new Date(t) > now);

      for (let i = 0; i < futureTimes.length; i++) {
        const t = futureTimes[i];
        const notificationId = `${state.task_id}-${state.step_index + i}-${new Date(t).getTime()}`;
        pending.push({
          id: notificationId,
          taskId: state.task_id,
          scheduledAt: t,
        });
      }
    }

    return NextResponse.json({
      notificationIds: pending.map((p) => p.id),
      pending,
    });
  } catch (error: any) {
    console.error("[notifications/pending] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error", message: error.message },
      { status: 500 }
    );
  }
}
