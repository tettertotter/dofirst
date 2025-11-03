import { createClient } from "@supabase/supabase-js";

export const supabaseClient = (supabaseUrl?: string, supabaseKey?: string) => {
  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = supabaseKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
};
