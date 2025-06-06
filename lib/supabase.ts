import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client-side Supabase client (uses NEXT_PUBLIC_ variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.",
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

// Server-side Supabase client (uses server environment variables)
export function createServerSupabaseClient(): SupabaseClient {
  const serverSupabaseUrl = process.env.SUPABASE_URL;
  const serverSupabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!serverSupabaseUrl || !serverSupabaseAnonKey) {
    throw new Error(
      "Server Supabase URL or Anon Key is missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment variables.",
    );
  }

  return createClient(serverSupabaseUrl, serverSupabaseAnonKey);
}