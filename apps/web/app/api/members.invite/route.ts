import { NextRequest, NextResponse } from "next/server";
import { MemberInviteSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/members.invite
 * Invites a new member to a pool by email.
 * Creates the user if they don't exist, adds them to pool_members,
 * and generates a magic link invitation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MemberInviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { poolId, email, role } = parsed.data;

    // Get authenticated user
    const supabase = createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Verify user is the pool owner
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

    if (pool.owner_id !== user.id) {
      return NextResponse.json(
        { error: "forbidden", message: "Only the pool owner can invite members" },
        { status: 403 }
      );
    }

    // Check if email is already a member
    const { data: existingMember } = await supabase
      .from("pool_members")
      .select("id, user_id")
      .eq("pool_id", poolId)
      .eq("users.email", email)
      .limit(1);

    // Find or create user by email
    // Note: In production, use Supabase Admin API to invite users
    // For MVP, we'll check if user exists and add them to pool
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, users(email)")
      .eq("users.email", email)
      .single();

    let invitedUserId: string;

    if (existingUser) {
      invitedUserId = existingUser.id;

      // Check if already a member
      if (existingMember && existingMember.length > 0) {
        return NextResponse.json(
          { error: "already_member", message: "This user is already a member of the pool" },
          { status: 400 }
        );
      }

      // Add existing user to pool
      const { error: addError } = await supabase
        .from("pool_members")
        .insert({
          pool_id: poolId,
          user_id: invitedUserId,
          role,
          can_add: role !== "guest"
        });

      if (addError) {
        console.error("Add member error:", addError);
        return NextResponse.json(
          { error: "add_member_failed", message: addError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "added",
        message: "User added to pool successfully"
      });
    } else {
      // User doesn't exist - send magic link invitation
      // Note: This requires SUPABASE_SERVICE_ROLE_KEY for admin operations
      // For MVP, return success but log that email sending is not yet implemented
      console.log(`[members.invite] Would send invitation to ${email} for pool ${poolId} with role ${role}`);

      // TODO: Integrate with Resend to send custom invitation email with magic link
      // const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      //   data: { poolId, role },
      //   redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`
      // });

      return NextResponse.json({
        status: "invited",
        message: "Invitation email would be sent (not yet implemented)",
        email
      });
    }

  } catch (error) {
    console.error("Member invite error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
