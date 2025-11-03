/**
 * POST /api/webpush/send
 * Send Web Push notification to user's registered devices
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getAuthUser } from "@/lib/supabase-server";
import { z } from "zod";
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error("VAPID keys not configured");
}

webpush.setVapidDetails(
  "mailto:support@dofirst.today",
  vapidPublicKey,
  vapidPrivateKey
);

// Zod schema for send request
const SendPushSchema = z.object({
  userId: z.string().uuid().optional(), // If omitted, sends to current user
  payload: z.object({
    title: z.string(),
    body: z.string().optional(),
    taskId: z.string().uuid().optional(),
    data: z.record(z.any()).optional(),
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

    // Parse and validate request
    const body = await req.json();
    const parsed = SendPushSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_payload", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId, payload } = parsed.data;
    const targetUserId = userId || user.id;

    // Verify permission: users can only send to themselves unless they're an owner
    // For MVP, we'll restrict to self-send only
    if (targetUserId !== user.id) {
      return NextResponse.json(
        { error: "forbidden", message: "Can only send push to yourself" },
        { status: 403 }
      );
    }

    // Fetch all subscriptions for target user
    const { data: subscriptions, error: fetchError } = await supabase
      .from("web_push_subscriptions")
      .select("*")
      .eq("user_id", targetUserId);

    if (fetchError) {
      console.error("[webpush/send] Database error:", fetchError);
      return NextResponse.json(
        { error: "database_error", message: fetchError.message },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "no_subscriptions", message: "User has no registered devices" },
        { status: 404 }
      );
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );

          console.log(`[webpush/send] Sent to ${sub.endpoint.substring(0, 50)}...`);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error(
            `[webpush/send] Failed to send to ${sub.endpoint.substring(0, 50)}:`,
            error.message
          );

          // If subscription is invalid (410 Gone, 404 Not Found), delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from("web_push_subscriptions")
              .delete()
              .eq("id", sub.id);

            console.log(
              `[webpush/send] Deleted invalid subscription ${sub.id}`
            );
          }

          throw error;
        }
      })
    );

    // Count successes and failures
    const successes = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected").length;

    console.log(
      `[webpush/send] Sent ${successes}/${subscriptions.length} notifications (${failures} failed)`
    );

    return NextResponse.json({
      ok: true,
      sent: successes,
      failed: failures,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("[webpush/send] Unexpected error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
