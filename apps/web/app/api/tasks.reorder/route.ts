import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskId, targetPriority, updates } = await req.json();

    if (!taskId || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify task ownership via pool membership
    const { data: task } = await supabase
      .from("tasks")
      .select("pool_id")
      .eq("id", taskId)
      .single();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { data: member } = await supabase
      .from("pool_members")
      .select("can_add")
      .eq("pool_id", task.pool_id)
      .eq("user_id", session.user.id)
      .single();

    if (!member || !member.can_add) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Update the dragged task's priority
    if (targetPriority !== undefined) {
      await supabase
        .from("tasks")
        .update({ priority: targetPriority })
        .eq("id", taskId);
    }

    // Update all sort orders in batch
    for (const update of updates) {
      await supabase
        .from("tasks")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reorder task" },
      { status: 500 }
    );
  }
}
