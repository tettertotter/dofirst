import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/cron/daily-digest
 * Sends daily digest emails to pool owners with:
 * - Today's accepted tasks
 * - Pending proposals awaiting response
 * - Overdue tasks
 *
 * Should be called once per day (e.g., 6am in pool's timezone)
 * In production, use Vercel Cron or similar scheduler
 */
export async function GET(_req: NextRequest) {
  try {
    // Use service role key for cron jobs (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error("[daily-digest] SUPABASE_SERVICE_ROLE_KEY not configured");
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

    let emailsSent = 0;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    for (const pool of pools) {
      // Get owner email
      const { data: owner } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", pool.owner_id)
        .single();

      // Get today's accepted proposals
      const { data: acceptedProposals } = await supabase
        .from("today_proposals")
        .select(`
          id,
          task_id,
          date,
          status,
          tasks (
            title,
            description,
            priority
          )
        `)
        .eq("pool_id", pool.id)
        .eq("date", today)
        .eq("status", "accepted");

      // Get pending proposals
      const { data: pendingProposals } = await supabase
        .from("today_proposals")
        .select(`
          id,
          task_id,
          proposed_by,
          date,
          tasks (
            title,
            priority
          )
        `)
        .eq("pool_id", pool.id)
        .eq("proposed_for", pool.owner_id)
        .eq("status", "proposed");

      // Get overdue tasks
      const { data: overdueTasks } = await supabase
        .from("tasks")
        .select("id, title, priority, due_at")
        .eq("pool_id", pool.id)
        .eq("status", "open")
        .lt("due_at", new Date().toISOString())
        .order("due_at", { ascending: true })
        .limit(10);

      const hasContent =
        (acceptedProposals && acceptedProposals.length > 0) ||
        (pendingProposals && pendingProposals.length > 0) ||
        (overdueTasks && overdueTasks.length > 0);

      if (hasContent) {
        console.log(`[daily-digest] Pool: ${pool.name} (${pool.id})`);
        console.log(`  Owner: ${pool.owner_id}`);
        console.log(`  Accepted today: ${acceptedProposals?.length || 0}`);
        console.log(`  Pending proposals: ${pendingProposals?.length || 0}`);
        console.log(`  Overdue tasks: ${overdueTasks?.length || 0}`);

        // TODO: Send email via Resend
        // await resend.emails.send({
        //   from: "DoFirst <digest@dofirst.today>",
        //   to: ownerEmail,
        //   subject: `Your Daily Digest - ${pool.name}`,
        //   html: renderDigestEmail({ acceptedProposals, pendingProposals, overdueTasks, pool })
        // });

        emailsSent++;
      }
    }

    console.log(`[daily-digest] Processed ${pools.length} pools, would send ${emailsSent} emails`);

    return NextResponse.json({
      ok: true,
      processed: pools.length,
      sent: emailsSent,
      message: "Daily digest job completed (email sending not yet implemented)"
    });

  } catch (error) {
    console.error("[daily-digest] Error:", error);
    return NextResponse.json(
      { error: "internal_error", message: String(error) },
      { status: 500 }
    );
  }
}
