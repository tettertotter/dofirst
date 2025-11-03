/**
 * POST /api/webpush/subscribe
 * Save Web Push subscription for authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "@/lib/supabase-server";
import { z } from "zod";

// Zod schema for PushSubscription JSON
const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = req.headers.get("authorization");
    const user = await getAuthUser(supabase, authHeader);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Parse and validate subscription
    const body = await req.json();
    const parsed = PushSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_subscription", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { endpoint, keys } = parsed.data;
    const { p256dh, auth } = keys;

    // Upsert subscription (replace if endpoint already exists for this user)
    const { error: dbError } = await supabase
      .from("web_push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh,
          auth,
        },
        {
          onConflict: "user_id,endpoint",
        }
      );

    if (dbError) {
      console.error("[webpush/subscribe] Database error:", dbError);
      return NextResponse.json(
        { error: "database_error", message: dbError.message },
        { status: 500 }
      );
    }

    console.log(`[webpush/subscribe] Subscription saved for user ${user.id}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webpush/subscribe] Unexpected error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
