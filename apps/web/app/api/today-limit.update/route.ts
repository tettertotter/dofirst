import { NextRequest, NextResponse } from "next/server";
import { TodayLimitUpdateSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/today-limit.update
 * Updates the today limit for a specific delegate in a pool.
 * Only the limit owner can update their own limits.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TodayLimitUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { poolId, delegateId, todayLimit } = parsed.data;

    // Get authenticated user
    const supabase = await createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Verify user is a member of the pool
    const { data: membership, error: membershipError } = await supabase
      .from("pool_members")
      .select("id")
      .eq("pool_id", poolId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "not_member", message: "You are not a member of this pool" },
        { status: 403 }
      );
    }

    // Verify delegate is a member of the pool
    const { data: delegateMembership, error: delegateError } = await supabase
      .from("pool_members")
      .select("id")
      .eq("pool_id", poolId)
      .eq("user_id", delegateId)
      .single();

    if (delegateError || !delegateMembership) {
      return NextResponse.json(
        { error: "delegate_not_member", message: "Delegate is not a member of this pool" },
        { status: 400 }
      );
    }

    // Upsert the today limit (owner = current user, delegate = the other member)
    const { data: updatedLimit, error: updateError } = await supabase
      .from("today_limits")
      .upsert({
        pool_id: poolId,
        owner_id: user.id,
        delegate_id: delegateId,
        today_limit: todayLimit,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "pool_id,owner_id,delegate_id"
      })
      .select()
      .single();

    if (updateError) {
      console.error("Today limit update error:", updateError);
      return NextResponse.json(
        { error: "update_failed", message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      limit: {
        id: updatedLimit.id,
        pool_id: updatedLimit.pool_id,
        delegate_id: updatedLimit.delegate_id,
        today_limit: updatedLimit.today_limit,
        updated_at: updatedLimit.updated_at
      },
      message: "Today limit updated successfully"
    });

  } catch (error) {
    console.error("Today limit update error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
