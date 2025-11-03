import { NextRequest, NextResponse } from "next/server";
import { EmailAliasCreateSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";
import { customAlphabet } from "nanoid";

// Generate URL-safe IDs (alphanumeric lowercase)
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

/**
 * POST /api/email.alias.create
 * Creates a unique email alias for a pool to receive tasks via email.
 * Format: poolalias+[uniqueid]@inbound.dofirst.today
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EmailAliasCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { poolId } = parsed.data;

    // Get authenticated user
    const supabase = createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Verify user is the pool owner
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .select("owner_id, name")
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
        { error: "forbidden", message: "Only the pool owner can create email aliases" },
        { status: 403 }
      );
    }

    // Check if pool already has an alias
    const { data: existingAlias } = await supabase
      .from("email_aliases")
      .select("alias_local, provider")
      .eq("pool_id", poolId)
      .single();

    if (existingAlias) {
      const domain = process.env.MAILGUN_DOMAIN || "inbound.dofirst.today";
      return NextResponse.json({
        alias: `${existingAlias.alias_local}@${domain}`,
        message: "Alias already exists for this pool"
      });
    }

    // Generate unique alias
    // Format: pool+[uniqueid]
    const uniqueId = nanoid();
    const aliasLocal = `pool+${uniqueId}`;

    // Insert into database
    const { data: newAlias, error: insertError } = await supabase
      .from("email_aliases")
      .insert({
        pool_id: poolId,
        alias_local: aliasLocal,
        provider: "mailgun"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Alias creation error:", insertError);
      return NextResponse.json(
        { error: "alias_creation_failed", message: insertError.message },
        { status: 500 }
      );
    }

    const domain = process.env.MAILGUN_DOMAIN || "inbound.dofirst.today";
    const fullAlias = `${aliasLocal}@${domain}`;

    // TODO: Configure Mailgun route for this alias
    // This would require Mailgun API integration to create a route that
    // forwards emails to our webhook endpoint
    console.log(`[email.alias.create] Created alias ${fullAlias} for pool ${poolId}`);
    console.log(`[email.alias.create] TODO: Configure Mailgun route for ${fullAlias}`);

    return NextResponse.json({
      alias: fullAlias,
      aliasLocal,
      message: "Email alias created successfully"
    });

  } catch (error) {
    console.error("Email alias creation error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
