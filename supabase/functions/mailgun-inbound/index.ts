import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { parseInlineEnhanced } from "./_lib/parsing-enhanced.ts";

// Timing-safe string comparison for HMAC validation
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

// Generate HMAC-SHA256 hex signature
async function hmacSHA256Hex(message: string, key: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  const b = new Uint8Array(sig);
  return Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const form = await req.formData();

    // Verify Mailgun signature
    const timestamp = String(form.get("timestamp") || "");
    const token = String(form.get("token") || "");
    const signature = String(form.get("signature") || "");

    const signingKey = Deno.env.get("MAILGUN_SIGNING_KEY") || "";
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));

    if (!timestamp || !token || !signature || !signingKey || age > 5 * 60) {
      console.error("Invalid request: missing params or timestamp too old");
      return new Response("invalid", { status: 400 });
    }

    const expected = await hmacSHA256Hex(`${timestamp}${token}`, signingKey);
    if (!timingSafeEqual(expected, signature)) {
      console.error("Invalid signature");
      return new Response("forbidden", { status: 403 });
    }

    // Extract email data
    const sender = String(form.get("sender") || "");
    const recipient = String(form.get("recipient") || "");
    const subject = String(form.get("subject") || "").slice(0, 300);
    const bodyText = String(form.get("stripped-text") || "");
    const bodyHtml = String(form.get("stripped-html") || "");

    console.log("Inbound email:", { sender, recipient, subject });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse recipient to extract alias
    // Expected format: alias@domain.com
    const recipientLocal = recipient.split("@")[0];

    // Look up the alias to find the pool
    const { data: alias, error: aliasError } = await supabase
      .from("email_aliases")
      .select("pool_id")
      .eq("alias_local", recipientLocal)
      .single();

    if (aliasError || !alias) {
      console.error("Alias not found:", recipientLocal);
      return new Response("alias not found", { status: 404 });
    }

    const poolId = alias.pool_id;

    // Get pool owner
    const { data: pool, error: poolError } = await supabase
      .from("pools")
      .select("owner_id")
      .eq("id", poolId)
      .single();

    if (poolError || !pool) {
      console.error("Pool not found:", poolId);
      return new Response("pool not found", { status: 404 });
    }

    const ownerId = pool.owner_id;

    // Try to map sender to a pool member
    const { data: members } = await supabase
      .from("pool_members")
      .select("user_id, role, profiles(display_name)")
      .eq("pool_id", poolId);

    // Check if sender email matches any member
    // For now, default to owner as creator and note sender in description
    let creatorId = ownerId;
    let senderNote = `From: ${sender}`;

    // In a real implementation, you'd query profiles or pool_members
    // for email addresses to match sender to a member
    // For MVP, we'll just use owner as creator

    // Parse email content for control tokens and natural dates
    const fullText = subject + " " + bodyText;
    const parsed = parseInlineEnhanced(fullText);

    // Use subject as title if parsing stripped everything
    const title = parsed.title || subject || "Task from email";
    const description = bodyText ? bodyText.slice(0, 5000) + "\n\n" + senderNote : senderNote;

    // Get due date from parsed input (if any)
    const dueDate = parsed.dueDate;

    // Create task with due date
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        pool_id: poolId,
        created_by: creatorId,
        title: title.slice(0, 300),
        description,
        priority: parsed.priority ?? 3,
        visibility: "household",
        status: "open",
        due_at: dueDate ? dueDate.toISOString() : null
      })
      .select()
      .single();

    if (taskError) {
      console.error("Task creation error:", taskError);
      return new Response("task creation failed", { status: 500 });
    }

    // Link tags if any
    if (parsed.tags.length > 0) {
      for (const tagName of parsed.tags) {
        // Get or create tag
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("pool_id", poolId)
          .eq("name", tagName)
          .single();

        let tagId = existingTag?.id;

        if (!tagId) {
          const { data: newTag } = await supabase
            .from("tags")
            .insert({ pool_id: poolId, name: tagName, is_core: false })
            .select("id")
            .single();
          tagId = newTag?.id;
        }

        if (tagId) {
          await supabase.from("task_tags").insert({ task_id: task.id, tag_id: tagId });
        }
      }
    }

    // TODO: Schedule notifications for tasks with due dates
    // This will be implemented when notification scheduling API is added
    // For now, notifications are handled client-side in Quick Add

    // Log submission
    await supabase.from("task_submissions").insert({
      pool_id: poolId,
      submitted_by: creatorId,
      raw_text: fullText.slice(0, 5000),
      parsed: {
        title,
        description,
        priority: parsed.priority,
        tags: parsed.tags,
        dueDate: dueDate?.toISOString(),
        rawDateExpression: parsed.rawDateExpression,
        datePattern: parsed.datePattern
      },
      source: "email",
      status: "accepted",
      created_task_id: task.id
    });

    console.log("Created task:", task.id, dueDate ? `with due date: ${dueDate.toISOString()}` : "");
    return new Response("ok - task created", { status: 200 });

  } catch (e) {
    console.error("Error processing inbound email:", e);
    return new Response("error", { status: 500 });
  }
});
