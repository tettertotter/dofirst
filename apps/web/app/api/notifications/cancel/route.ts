/**
 * POST /api/notifications/cancel
 * Cancel all scheduled notifications for a specific task
 *
 * Removes the task from task_nagging_state so the cron job won't process it
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "@/lib/supabase-server";
import { z } from "zod";

// Zod schema for cancel request
const CancelRequestSchema = z.object({
  taskId: z.string().uuid(),
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
    const parsed = CancelRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_payload", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { taskId } = parsed.data;

    // Verify task exists and user has access
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

    // Delete task nagging state
    const { error: deleteError } = await supabase
      .from("task_nagging_state")
      .delete()
      .eq("task_id", taskId);

    if (deleteError) {
      console.error("[notifications/cancel] Error deleting state:", deleteError);
      return NextResponse.json(
        { error: "database_error", message: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`[notifications/cancel] Cancelled notifications for task ${taskId}`);

    return NextResponse.json({
      ok: true,
      cancelled: true,
      taskId,
    });
  } catch (error: any) {
    console.error("[notifications/cancel] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error", message: error.message },
      { status: 500 }
    );
  }
}
