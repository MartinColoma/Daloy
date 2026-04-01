import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

/**
 * Frontend Supabase client.
 * Used ONLY for:
 *   - Google OAuth sign-in redirect (supabase.auth.signInWithOAuth)
 *   - Listening to auth state changes (supabase.auth.onAuthStateChange)
 *   - Realtime subscriptions (future)
 *
 * All data fetching goes through apiClient.ts → your Express backend.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);