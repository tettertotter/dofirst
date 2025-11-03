import { NextRequest, NextResponse } from "next/server";
import { TaskUpdateSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/tasks.update
 * Updates an existing task with new values for title, description, priority, visibility, or status.
 * Only the task creator or pool owner can update tasks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TaskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { taskId, title, description, priority, visibility, status } = parsed.data;

    // At least one field must be provided for update
    if (!title && !description && !priority && !visibility && !status) {
      return NextResponse.json(
        { error: "no_fields", message: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get the task to verify ownership
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, pool_id, created_by")
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
        { error: "forbidden", message: "Only the task creator or pool owner can update this task" },
        { status: 403 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (status !== undefined) updateData.status = status;

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      console.error("Task update error:", updateError);
      return NextResponse.json(
        { error: "update_failed", message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        visibility: updatedTask.visibility,
        status: updatedTask.status,
        updated_at: updatedTask.updated_at
      },
      message: "Task updated successfully"
    });

  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
