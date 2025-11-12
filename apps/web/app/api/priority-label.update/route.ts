import { NextRequest, NextResponse } from "next/server";
import { PriorityLabelUpdateSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/priority-label.update
 * Updates or creates a priority label for a pool.
 * Only pool members can update labels (following RLS policy).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PriorityLabelUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { poolId, priorityNumber, label } = parsed.data;

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

    // Upsert the priority label
    const { data: updatedLabel, error: updateError } = await supabase
      .from("priority_labels")
      .upsert({
        pool_id: poolId,
        priority_number: priorityNumber,
        label: label,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "pool_id,priority_number"
      })
      .select()
      .single();

    if (updateError) {
      console.error("Priority label update error:", updateError);
      return NextResponse.json(
        { error: "update_failed", message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      label: {
        id: updatedLabel.id,
        pool_id: updatedLabel.pool_id,
        priority_number: updatedLabel.priority_number,
        label: updatedLabel.label,
        updated_at: updatedLabel.updated_at
      },
      message: "Priority label updated successfully"
    });

  } catch (error) {
    console.error("Priority label update error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
