import { NextRequest, NextResponse } from "next/server";
import { TaskDeleteSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/tasks.delete
 * Deletes a task from the system.
 * Only the task creator or pool owner can delete tasks.
 * This is a hard delete - the task and all associated data will be permanently removed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TaskDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { taskId } = parsed.data;

    // Get authenticated user
    const supabase = await createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get the task to verify ownership
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, pool_id, created_by, title")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: "task_not_found", message: "Task does not exist" },
        { status: 404 }
      );
    }

    // Get the pool to check ownership
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .select("owner_id")
      .eq("id", task.pool_id)
      .single();

    if (poolError || !pool) {
      return NextResponse.json(
        { error: "pool_not_found", message: "Pool does not exist" },
        { status: 404 }
      );
    }

    // Check if user is the task creator or pool owner
    const isCreator = task.created_by === user.id;
    const isPoolOwner = pool.owner_id === user.id;

    if (!isCreator && !isPoolOwner) {
      return NextResponse.json(
        { error: "forbidden", message: "Only the task creator or pool owner can delete this task" },
        { status: 403 }
      );
    }

    // Delete the task (cascade will handle today_proposals, task_tags, task_submissions references)
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (deleteError) {
      console.error("Task delete error:", deleteError);
      return NextResponse.json(
        { error: "delete_failed", message: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`[tasks.delete] Task deleted: ${taskId} (${task.title}) by user ${user.id}`);

    return NextResponse.json({
      message: "Task deleted successfully",
      taskId
    });

  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
