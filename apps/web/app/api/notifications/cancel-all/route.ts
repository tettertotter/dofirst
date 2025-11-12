/**
 * POST /api/notifications/cancel-all
 * Cancel all scheduled notifications for the current user
 *
 * Removes all tasks from task_nagging_state for tasks in user's pools
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const authHeader = req.headers.get("authorization");
    const user = await getAuthUser(supabase, authHeader);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get all pools user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from("pool_members")
      .select("pool_id")
      .eq("user_id", user.id);

    if (membershipError) {
      console.error("[notifications/cancel-all] Error fetching memberships:", membershipError);
      return NextResponse.json(
        { error: "database_error", message: membershipError.message },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        ok: true,
        cancelled: 0,
        message: "No pools found for user",
      });
    }

    const poolIds = memberships.map((m) => m.pool_id);

    // Get all tasks in those pools
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id")
      .in("pool_id", poolIds);

    if (tasksError) {
      console.error("[notifications/cancel-all] Error fetching tasks:", tasksError);
      return NextResponse.json(
        { error: "database_error", message: tasksError.message },
        { status: 500 }
      );
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        ok: true,
        cancelled: 0,
        message: "No tasks found",
      });
    }

    const taskIds = tasks.map((t) => t.id);

    // Delete all nagging state for those tasks
    const { error: deleteError, count } = await supabase
      .from("task_nagging_state")
      .delete()
      .in("task_id", taskIds);

    if (deleteError) {
      console.error("[notifications/cancel-all] Error deleting states:", deleteError);
      return NextResponse.json(
        { error: "database_error", message: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`[notifications/cancel-all] Cancelled ${count || 0} notifications for user ${user.id}`);

    return NextResponse.json({
      ok: true,
      cancelled: count || 0,
    });
  } catch (error: any) {
    console.error("[notifications/cancel-all] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error", message: error.message },
      { status: 500 }
    );
  }
}
