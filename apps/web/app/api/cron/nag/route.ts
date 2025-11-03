import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { computeSchedule, DEFAULT_CADENCE } from "@todaypool/nagging";
import type { Cadence, QuietHours } from "@todaypool/nagging";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:support@dofirst.today",
    vapidPublicKey,
    vapidPrivateKey
  );
}

/**
 * GET /api/cron/nag
 * Process scheduled notifications using Nagging 2.0 algorithm
 *
 * 1. Find all task_nagging_state entries with scheduled_times that are due
 * 2. Send Web Push notifications for those tasks
 * 3. Update nagging state and compute next 3 notification times
 *
 * Should be called every minute via Vercel Cron or similar scheduler
 * Respects quiet hours and handles catch-up notifications
 */
export async function GET(_req: NextRequest) {
  try {
    // Use service role key for cron jobs (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error("[nag] SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json(
        { error: "service_key_not_configured" },
        { status: 500 }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("[nag] VAPID keys not configured");
      return NextResponse.json(
        { error: "vapid_keys_not_configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    let notificationsSent = 0;
    let errors = 0;

    // Get all task nagging states with scheduled times
    const { data: states, error: statesError } = await supabase
      .from("task_nagging_state")
      .select(`
        *,
        tasks(id, title, due_at, priority, pool_id, owner_id, snooze_cadence, status)
      `)
      .eq("paused", false)
      .not("scheduled_times", "is", null);

    if (statesError) {
      console.error("[nag] Error fetching nagging states:", statesError);
      return NextResponse.json(
        { error: "database_error", message: statesError.message },
        { status: 500 }
      );
    }

    if (!states || states.length === 0) {
      console.log("[nag] No active nagging states found");
      return NextResponse.json({ ok: true, sent: 0, message: "No active nags" });
    }

    console.log(`[nag] Processing ${states.length} active nagging states`);

    for (const state of states) {
      try {
        const task = state.tasks as any;

        // Skip if task is not open
        if (!task || task.status !== "open") {
          continue;
        }

        const scheduledTimes = (state.scheduled_times as string[]) || [];

        // Check if any scheduled time is due (within last 5 minutes to now)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const dueTime = scheduledTimes.find((t) => {
          const time = new Date(t);
          return time >= fiveMinutesAgo && time <= now;
        });

        if (!dueTime) {
          // No notification due yet
          continue;
        }

        console.log(`[nag] Sending notification for task ${task.id}: ${task.title}`);

        // Get user nagging preferences for quiet hours
        const { data: prefs } = await supabase
          .from("nagging_preferences")
          .select("quiet_hours, default_cadence, enabled")
          .eq("user_id", task.owner_id)
          .single();

        // Skip if nagging disabled for user
        if (prefs && !prefs.enabled) {
          console.log(`[nag] Nagging disabled for user ${task.owner_id}, skipping`);
          continue;
        }

        // Get user's web push subscriptions
        const { data: subscriptions } = await supabase
          .from("web_push_subscriptions")
          .select("*")
          .eq("user_id", task.owner_id);

        if (!subscriptions || subscriptions.length === 0) {
          console.log(`[nag] No subscriptions for user ${task.owner_id}, skipping`);
          continue;
        }

        // Send Web Push to all subscriptions
        const payload = {
          title: task.title,
          body: task.due_at ? `Due ${new Date(task.due_at).toLocaleString()}` : "Task reminder",
          taskId: task.id,
          priority: task.priority || 3,
        };

        for (const sub of subscriptions) {
          try {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            };

            await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
            console.log(`[nag] Sent to ${sub.endpoint.substring(0, 50)}...`);
          } catch (pushError: any) {
            console.error(`[nag] Failed to send to ${sub.endpoint.substring(0, 50)}:`, pushError.message);

            // Delete invalid subscriptions
            if (pushError.statusCode === 410 || pushError.statusCode === 404) {
              await supabase.from("web_push_subscriptions").delete().eq("id", sub.id);
              console.log(`[nag] Deleted invalid subscription ${sub.id}`);
            }
          }
        }

        notificationsSent++;

        // Compute next 3 notification times
        const cadence: Cadence =
          (task.snooze_cadence as Cadence) ||
          (prefs?.default_cadence as Cadence) ||
          DEFAULT_CADENCE;

        const quietHours: QuietHours | null = prefs?.quiet_hours
          ? (prefs.quiet_hours as QuietHours)
          : null;

        const dueAt = task.due_at ? new Date(task.due_at) : new Date();
        const nextStepIndex = state.step_index + 1;

        const nextSchedule = computeSchedule(
          dueAt,
          now,
          quietHours,
          cadence,
          3,
          nextStepIndex
        );

        // Update nagging state with next 3 times
        const { error: updateError } = await supabase
          .from("task_nagging_state")
          .update({
            step_index: nextStepIndex,
            last_notified_at: now.toISOString(),
            scheduled_times: nextSchedule.times.map((t) => t.toISOString()),
            notification_count: state.notification_count + 1,
            updated_at: now.toISOString(),
          })
          .eq("task_id", task.id);

        if (updateError) {
          console.error(`[nag] Error updating nagging state for task ${task.id}:`, updateError);
          errors++;
        } else {
          console.log(
            `[nag] Updated nagging state for task ${task.id}, next times:`,
            nextSchedule.times.map((t) => t.toISOString())
          );
        }
      } catch (taskError) {
        console.error(`[nag] Error processing task ${state.task_id}:`, taskError);
        errors++;
      }
    }

    console.log(`[nag] Completed: sent ${notificationsSent} notifications (${errors} errors)`);

    return NextResponse.json({
      ok: true,
      processed: states.length,
      sent: notificationsSent,
      errors,
      message: "Nag job completed successfully",
    });
  } catch (error) {
    console.error("[nag] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error", message: String(error) },
      { status: 500 }
    );
  }
}
