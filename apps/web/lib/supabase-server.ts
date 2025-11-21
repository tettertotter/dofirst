/**
 * Server-side Supabase client utilities.
 * ONLY use these in API routes and Server Components.
 * NEVER import in Client Components.
 */
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Create a Supabase client with service role for admin operations.
 * Use sparingly, only when RLS bypass is truly needed.
 * Most operations should use createServerClient instead.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create a Supabase client for server-side with user auth context.
 * Uses anon key but respects RLS based on user session from cookies.
 * Prefer this for most API operations.
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Get the authenticated user from the request.
 * Now uses the built-in session management from @supabase/ssr.
 * Returns null if not authenticated.
 */
export async function getAuthUser(
  client: Awaited<ReturnType<typeof createServerClient>>,
  authHeader?: string | null
) {
  // Try Authorization header first (for mobile)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await client.auth.getUser(token);

    if (!error && user) {
      return user;
    }
  }

  // Get user from session (cookies handled by SSR package)
  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Type for database enums matching schema
 */
export type TaskStatus = "open" | "in_progress" | "done" | "archived";
export type TaskVisibility = "owner_only" | "household" | "work" | "public";
export type MemberRole = "owner" | "spouse" | "colleague" | "guest";
export type ProposalStatus = "proposed" | "accepted" | "declined" | "moved";
export type InboundSource = "app" | "email" | "voice" | "api";
