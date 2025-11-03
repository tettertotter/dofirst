/**
 * Client-side Supabase utilities.
 * Safe to use in Client Components, uses anon key with RLS.
 */
"use client";

import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get or create a Supabase client for browser use.
 * Uses anon key, all queries respect RLS.
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase public environment variables");
  }

  supabaseClient = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return supabaseClient;
}
