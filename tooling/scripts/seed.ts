/**
 * Seed script for TodayPool.
 * Run with: node tooling/scripts/seed.ts
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const db = createClient(url, key);

async function main() {
  // TODO: replace with actual auth user ids
  const owner_id = crypto.randomUUID();
  const spouse_id = crypto.randomUUID();
  const colleague1 = crypto.randomUUID();
  const colleague2 = crypto.randomUUID();
  const colleague3 = crypto.randomUUID();

  // Create pool
  const { data: pool, error: errPool } = await db.from("pools").insert({
    owner_id, name: "My Pool", timezone: "America/New_York"
  }).select().single();
  if (errPool) throw errPool;

  const pool_id = pool.id;

  // Members
  await db.from("pool_members").insert([
    { pool_id, user_id: owner_id, role: "owner", can_add: true },
    { pool_id, user_id: spouse_id, role: "spouse", can_add: true },
    { pool_id, user_id: colleague1, role: "colleague", can_add: true },
    { pool_id, user_id: colleague2, role: "colleague", can_add: true },
    { pool_id, user_id: colleague3, role: "colleague", can_add: true }
  ]);

  // Core tags
  await db.from("tags").insert([
    { pool_id, name: "personal", is_core: true },
    { pool_id, name: "work", is_core: true }
  ]);

  // Limits
  await db.from("today_limits").insert([
    { pool_id, delegator_id: spouse_id, daily_limit: 3 },
    { pool_id, delegator_id: colleague1, daily_limit: 2 },
    { pool_id, delegator_id: colleague2, daily_limit: 2 },
    { pool_id, delegator_id: colleague3, daily_limit: 2 }
  ]);

  console.log("Seed complete. Pool:", pool_id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
