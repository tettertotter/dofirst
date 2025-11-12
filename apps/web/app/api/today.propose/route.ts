import { NextRequest, NextResponse } from "next/server";
import { TodayProposeSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/today.propose
 * Creates a proposal for someone to do a task on a specific date.
 * Enforces per-person daily quota limits.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TodayProposeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { poolId, taskId, date } = parsed.data;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "invalid_date", message: "Date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createServerClient();
    const user = await getAuthUser(supabase);

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
        { error: "forbidden", message: "Not authorized to propose tasks for this pool" },
        { status: 403 }
      );
    }

    // Get the task to determine who owns the pool
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("pool_id")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: "task_not_found", message: "Task does not exist" },
        { status: 404 }
      );
    }

    if (task.pool_id !== poolId) {
      return NextResponse.json(
        { error: "task_pool_mismatch", message: "Task does not belong to this pool" },
        { status: 400 }
      );
    }

    // Get the pool owner
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .select("owner_id")
      .eq("id", poolId)
      .single();

    if (poolError || !pool) {
      return NextResponse.json(
        { error: "pool_not_found", message: "Pool does not exist" },
        { status: 404 }
      );
    }

    const ownerId = pool.owner_id;

    // Check if user is proposing to themselves (owner proposing to themselves)
    if (user.id === ownerId) {
      // Owner can propose unlimited items to themselves
      const { data: proposal, error: proposalError } = await supabase
        .from("today_proposals")
        .insert({
          pool_id: poolId,
          proposed_for: ownerId,
          proposed_by: user.id,
          task_id: taskId,
          date,
          status: "proposed"
        })
        .select()
        .single();

      if (proposalError) {
        console.error("Proposal creation error:", proposalError);
        return NextResponse.json(
          { error: "proposal_creation_failed", message: proposalError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        proposalId: proposal.id,
        remainingQuota: null // No quota for owner
      });
    }

    // For non-owners, check quota
    // Get their daily limit
    const { data: limit } = await supabase
      .from("today_limits")
      .select("daily_limit")
      .eq("pool_id", poolId)
      .eq("delegator_id", user.id)
      .single();

    const dailyLimit = limit?.daily_limit ?? 2; // Default to 2 if not set

    // Count existing proposals for this user on this date
    const { count: proposalCount, error: countError } = await supabase
      .from("today_proposals")
      .select("*", { count: "exact", head: true })
      .eq("pool_id", poolId)
      .eq("proposed_by", user.id)
      .eq("date", date)
      .eq("status", "proposed"); // Only count pending proposals

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "quota_check_failed", message: countError.message },
        { status: 500 }
      );
    }

    const currentCount = proposalCount ?? 0;

    // Check if quota exceeded
    if (currentCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: "quota_exceeded",
          message: `You have reached your daily limit of ${dailyLimit} proposals for ${date}`,
          dailyLimit,
          currentCount
        },
        { status: 429 }
      );
    }

    // Create the proposal
    const { data: proposal, error: proposalError } = await supabase
      .from("today_proposals")
      .insert({
        pool_id: poolId,
        proposed_for: ownerId,
        proposed_by: user.id,
        task_id: taskId,
        date,
        status: "proposed"
      })
      .select()
      .single();

    if (proposalError) {
      console.error("Proposal creation error:", proposalError);
      return NextResponse.json(
        { error: "proposal_creation_failed", message: proposalError.message },
        { status: 500 }
      );
    }

    const remainingQuota = dailyLimit - (currentCount + 1);

    return NextResponse.json({
      proposalId: proposal.id,
      dailyLimit,
      currentCount: currentCount + 1,
      remainingQuota,
      proposal: {
        id: proposal.id,
        task_id: proposal.task_id,
        date: proposal.date,
        status: proposal.status,
        created_at: proposal.created_at
      }
    });

  } catch (error) {
    console.error("Today propose error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
