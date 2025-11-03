import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/cron/nag
 * Sends gentle reminder notifications for tasks that have had no activity.
 * Checks nagging_config table for user preferences on when to send reminders.
 *
 * Should be called periodically (e.g., every hour)
 * In production, use Vercel Cron or similar scheduler
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pools
    const { data: pools } = await supabase
      .from("pools")
      .select("id, name, owner_id, timezone");

    if (!pools || pools.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No pools found" });
    }

    let remindersSent = 0;
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

    for (const pool of pools) {
      // Get nagging config for pool owner (if exists)
      const { data: nagConfig } = await supabase
        .from("nagging_config")
        .select("enabled, interval_hours")
        .eq("pool_id", pool.id)
        .eq("user_id", pool.owner_id)
        .single();

      // Skip if nagging is disabled
      if (nagConfig && !nagConfig.enabled) {
        continue;
      }

      const intervalHours = nagConfig?.interval_hours || 2;

      // Get tasks that:
      // - Are in status 'open'
      // - Have due_at in the past or within next 4 hours
      // - Haven't been updated recently (based on interval_hours)
      const { data: staleTasks } = await supabase
        .from("tasks")
        .select("id, title, priority, due_at, updated_at")
        .eq("pool_id", pool.id)
        .eq("status", "open")
        .lt("updated_at", new Date(now.getTime() - intervalHours * 60 * 60 * 1000).toISOString())
        .or(`due_at.lt.${new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString()},due_at.is.null`)
        .order("priority", { ascending: false })
        .limit(5);

      if (staleTasks && staleTasks.length > 0) {
        console.log(`[nag] Pool: ${pool.name} (${pool.id})`);
        console.log(`  Owner: ${pool.owner_id}`);
        console.log(`  Stale tasks: ${staleTasks.length}`);
        console.log(`  Tasks: ${staleTasks.map(t => t.title).join(", ")}`);

        // TODO: Send reminder via Resend or Web Push
        // await resend.emails.send({
        //   from: "DoFirst <reminders@dofirst.today>",
        //   to: ownerEmail,
        //   subject: `Gentle reminder: ${staleTasks.length} task${staleTasks.length > 1 ? 's' : ''} need attention`,
        //   html: renderNagEmail({ staleTasks, pool })
        // });

        // Or send via web push:
        // await sendWebPush(pool.owner_id, {
        //   title: `${staleTasks.length} task${staleTasks.length > 1 ? 's' : ''} need attention`,
        //   body: staleTasks[0].title,
        //   taskId: staleTasks[0].id
        // });

        remindersSent++;
      }
    }

    console.log(`[nag] Processed ${pools.length} pools, would send ${remindersSent} reminders`);

    return NextResponse.json({
      ok: true,
      processed: pools.length,
      sent: remindersSent,
      message: "Nag job completed (notifications not yet implemented)"
    });

  } catch (error) {
    console.error("[nag] Error:", error);
    return NextResponse.json(
      { error: "internal_error", message: String(error) },
      { status: 500 }
    );
  }
}
