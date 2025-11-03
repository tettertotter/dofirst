import { NextRequest, NextResponse } from "next/server";
import { QuickAddSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";
import { parseInlineEnhanced } from "../../../../../packages/api/parsing-enhanced";

/**
 * POST /api/tasks.quickAdd
 * Body: { poolId, title, description?, priority?, tags?, visibility?, source? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = QuickAddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
    }
    const { poolId, title, description, priority, tags, visibility } = parsed.data;

    const supabase = createServerClient();
    const user = await getAuthUser(supabase, req.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // Verify membership + permission
    const { data: member } = await supabase
      .from("pool_members")
      .select("user_id, can_add")
      .eq("pool_id", poolId)
      .eq("user_id", user.id)
      .single();
    if (!member || !member.can_add) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Parse inline tokens and natural dates
    const parsedInput = parseInlineEnhanced(title);
    const cleanTitle = parsedInput.title;
    const allTags = Array.from(new Set([...(tags || []), ...parsedInput.tags]));
    const finalPriority = parsedInput.priority ?? priority ?? 3;
    const dueAt = parsedInput.dueDate ? parsedInput.dueDate.toISOString() : null;

    // Create task (prefer due_at; keep due_date null)
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        pool_id: poolId,
        created_by: user.id,
        title: cleanTitle,
        description: description?.trim() || null,
        priority: finalPriority,
        visibility: visibility || "owner_only",
        status: "open",
        due_at: dueAt
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "db_error", details: error.message }, { status: 500 });

    // Insert tags if present
    if (allTags.length) {
      const { data: tagRows } = await supabase
        .from("tags")
        .select("id")
        .in("name", allTags)
        .eq("pool_id", poolId);
      const idByName = new Map<string,string>();
      tagRows?.forEach((r:any) => idByName.set(r.name, r.id));
      // create missing tags
      const missing = allTags.filter(t => !idByName.has(t));
      if (missing.length) {
        const { data: created } = await supabase
          .from("tags")
          .insert(missing.map(name => ({ pool_id: poolId, name })))
          .select();
        created?.forEach((r:any) => idByName.set(r.name, r.id));
      }
      const tagIds = allTags.map(n => idByName.get(n)).filter(Boolean);
      if (tagIds.length) {
        await supabase.from("task_tags").insert(tagIds.map((tag_id:any) => ({ task_id: task.id, tag_id })));
      }
    }

    return NextResponse.json({ taskId: task.id }, { status: 201 });
  } catch (e:any) {
    return NextResponse.json({ error: "server_error", details: e?.message || String(e) }, { status: 500 });
  }
}
