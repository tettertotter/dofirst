/**
 * GET /api/today.quota
 * Get current quota status for proposing to Today
 *
 * Returns:
 * - dailyLimit: configured limit for this user
 * - used: number of proposals made today
 * - remaining: proposals left today
 * - isOwner: whether user is pool owner (unlimited)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get poolId from query params
    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json(
        { error: "pool_id_required", message: "poolId query parameter is required" },
        { status: 400 }
      );
    }

    // Get the pool to check if user is owner
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

    const isOwner = pool.owner_id === user.id;

    // If owner, they have unlimited quota
    if (isOwner) {
      return NextResponse.json({
        isOwner: true,
        dailyLimit: null,
        used: 0,
        remaining: null,
        unlimited: true,
      });
    }

    // Get user's daily limit
    const { data: limit } = await supabase
      .from("today_limits")
      .select("daily_limit")
      .eq("pool_id", poolId)
      .eq("delegator_id", user.id)
      .single();

    const dailyLimit = limit?.daily_limit ?? 2; // Default to 2

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Count proposals made today
    const { count: usedCount, error: countError } = await supabase
      .from("today_proposals")
      .select("*", { count: "exact", head: true })
      .eq("pool_id", poolId)
      .eq("proposed_by", user.id)
      .eq("date", today)
      .eq("status", "proposed"); // Only count pending proposals

    if (countError) {
      console.error("[quota] Count error:", countError);
      return NextResponse.json(
        { error: "quota_check_failed", message: countError.message },
        { status: 500 }
      );
    }

    const used = usedCount ?? 0;
    const remaining = Math.max(0, dailyLimit - used);

    return NextResponse.json({
      isOwner: false,
      dailyLimit,
      used,
      remaining,
      unlimited: false,
      date: today,
    });
  } catch (error) {
    console.error("[quota] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
