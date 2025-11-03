import { NextRequest, NextResponse } from "next/server";
import { QuickAddSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";
import { parseInlineEnhanced } from "@todaypool/api/parsing-enhanced";
import { createNotificationAdapter } from "@todaypool/notifications";
import { computeNextTimes, DEFAULT_CADENCE, type QuietHours, type Cadence } from "@todaypool/nagging";

/**
 * POST /api/tasks.quickAdd
 * Creates a new task with optional tags, priority, and due date.
 * Supports inline parsing from title with natural language dates:
 * - "Buy milk today 5pm #personal !2"
 * - "Call mom in 2h #family"
 * - "Team meeting fri 9a #work !1"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = QuickAddSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { poolId, title, description, visibility, priority, tags } = parsed.data;

    // Parse inline shortcuts and natural dates from title
    const parsedInput = parseInlineEnhanced(title);

    // Use clean title (with tokens removed)
    const cleanTitle = parsedInput.title;

    // Merge extracted tags with provided tags (deduplicate)
    const allTags = Array.from(new Set([
      ...(tags || []),
      ...parsedInput.tags
    ]));

    // Use extracted priority if present, otherwise use provided priority
    const finalPriority = parsedInput.priority ?? priority ?? 3;

    // Use extracted due date if present
    const dueDate = parsedInput.dueDate;

    // Get authenticated user
    const supabase = createServerClient();
    const authHeader = req.headers.get("authorization");
    const user = await getAuthUser(supabase, authHeader);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Verify user is a member of the pool with can_add permission
    const { data: member, error: memberError } = await supabase
      .from("pool_members")
      .select("role, can_add")
      .eq("pool_id", poolId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member || !member.can_add) {
      return NextResponse.json(
        { error: "forbidden", message: "Not authorized to add tasks to this pool" },
        { status: 403 }
      );
    }

    // Determine default visibility based on role
    let finalVisibility = visibility;
    if (!finalVisibility) {
      if (member.role === "owner" || member.role === "spouse") {
        finalVisibility = "household";
      } else if (member.role === "colleague") {
        finalVisibility = "work";
      } else {
        finalVisibility = "owner_only";
      }
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        pool_id: poolId,
        created_by: user.id,
        title: cleanTitle,
        description: description?.trim() || null,
        priority: finalPriority,
        visibility: finalVisibility,
        status: "open",
        due_at: dueDate ? dueDate.toISOString() : null
      })
      .select()
      .single();

    if (taskError) {
      console.error("Task creation error:", taskError);
      return NextResponse.json(
        { error: "task_creation_failed", message: taskError.message },
        { status: 500 }
      );
    }

    // Link tags if provided (includes both explicit and parsed tags)
    if (allTags && allTags.length > 0) {
      // Get or create tags
      const tagIds: string[] = [];

      for (const tagName of allTags) {
        const normalizedTagName = tagName.toLowerCase().trim();

        // Try to find existing tag
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("pool_id", poolId)
          .eq("name", normalizedTagName)
          .single();

        if (existingTag) {
          tagIds.push(existingTag.id);
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({
              pool_id: poolId,
              name: normalizedTagName,
              is_core: false
            })
            .select("id")
            .single();

          if (!tagError && newTag) {
            tagIds.push(newTag.id);
          }
        }
      }

      // Link tags to task
      if (tagIds.length > 0) {
        const taskTagLinks = tagIds.map(tagId => ({
          task_id: task.id,
          tag_id: tagId
        }));

        await supabase.from("task_tags").insert(taskTagLinks);
      }
    }

    // Schedule nagging notifications if due date is set
    if (dueDate) {
      try {
        const notifications = createNotificationAdapter();
        const hasPermission = await notifications.hasPermission();

        if (hasPermission) {
          // Get user's nagging preferences
          const { data: prefs } = await supabase.rpc('get_nagging_preferences', {
            p_user_id: user.id
          });

          const quietHours = prefs?.[0]?.quiet_hours as QuietHours | null;
          const defaultCadence = prefs?.[0]?.default_cadence as Cadence | null;
          const naggingEnabled = prefs?.[0]?.enabled ?? true;

          if (naggingEnabled) {
            // Use nagging scheduler to compute next 3 post-due notification times
            const cadence = defaultCadence ?? DEFAULT_CADENCE;
            const now = new Date();
            const nagTimes = computeNextTimes(dueDate, now, quietHours, cadence, 3);

            // Filter out past times (shouldn't happen but safety check)
            const futureTimes = nagTimes.filter(time => time > now);

            if (futureTimes.length > 0) {
              const notificationPayload = {
                taskId: task.id,
                title: cleanTitle,
                body: allTags.length > 0 ? `#${allTags.join(' #')} !${finalPriority}` : `!${finalPriority}`,
                dueAt: dueDate.toISOString(),
                priority: finalPriority,
                poolId,
                userId: user.id
              };

              await notifications.schedule(task.id, futureTimes, notificationPayload);

              // Track nagging state for healing
              await supabase.rpc('update_nagging_state_after_notification', {
                p_task_id: task.id,
                p_new_times: JSON.stringify(futureTimes.map(t => t.toISOString()))
              });

              console.log(`[QuickAdd] Scheduled ${futureTimes.length} nagging notifications for task ${task.id}`);
            }
          }
        }
      } catch (notifError) {
        // Log error but don't fail the request
        console.error("[QuickAdd] Failed to schedule notifications:", notifError);
      }
    }

    // Log the submission
    await supabase.from("task_submissions").insert({
      pool_id: poolId,
      submitted_by: user.id,
      raw_text: title,
      parsed: {
        title: cleanTitle,
        description,
        priority: finalPriority,
        tags: allTags,
        visibility: finalVisibility,
        dueDate: dueDate?.toISOString(),
        rawDateExpression: parsedInput.rawDateExpression,
        datePattern: parsedInput.datePattern
      },
      source: "app",
      status: "accepted",
      created_task_id: task.id
    });

    return NextResponse.json({
      taskId: task.id,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        visibility: task.visibility,
        due_at: task.due_at,
        created_at: task.created_at
      },
      parsed: {
        tags: allTags,
        rawDateExpression: parsedInput.rawDateExpression,
        datePattern: parsedInput.datePattern
      }
    });

  } catch (error) {
    console.error("Quick add error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
