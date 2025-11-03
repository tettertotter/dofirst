import { NextRequest, NextResponse } from "next/server";
import { PoolCreateSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/pools.create
 * Creates a new pool with the authenticated user as the owner.
 * Automatically adds the user as a pool member with 'owner' role.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PoolCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, timezone } = parsed.data;

    // Get authenticated user
    const supabase = createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Create the pool
    const { data: newPool, error: poolError } = await supabase
      .from("pools")
      .insert({
        owner_id: user.id,
        name,
        timezone: timezone || "America/New_York"
      })
      .select()
      .single();

    if (poolError) {
      console.error("Pool creation error:", poolError);
      return NextResponse.json(
        { error: "pool_creation_failed", message: poolError.message },
        { status: 500 }
      );
    }

    // Add the creator as a pool member with 'owner' role
    const { error: memberError } = await supabase
      .from("pool_members")
      .insert({
        pool_id: newPool.id,
        user_id: user.id,
        role: "owner",
        can_add: true
      });

    if (memberError) {
      console.error("Pool member creation error:", memberError);
      // Try to clean up the pool since member creation failed
      await supabase
        .from("pools")
        .delete()
        .eq("id", newPool.id);

      return NextResponse.json(
        { error: "member_creation_failed", message: memberError.message },
        { status: 500 }
      );
    }

    console.log(`[pools.create] Pool created: ${newPool.id} (${newPool.name}) by user ${user.id}`);

    return NextResponse.json({
      pool: {
        id: newPool.id,
        name: newPool.name,
        timezone: newPool.timezone,
        owner_id: newPool.owner_id,
        created_at: newPool.created_at
      },
      message: "Pool created successfully"
    });

  } catch (error) {
    console.error("Pool creation error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
