import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment secrets."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to get auth headers for API requests
export function getAuthHeaders() {
  return supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    }
    return {};
  });
}

// Helper to sign out
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
