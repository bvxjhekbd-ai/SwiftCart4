import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    "Missing Supabase environment variables. Authentication may not work properly. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient("https://placeholder.supabase.co", "placeholder-key");

// Helper to get auth headers for API requests
export async function getAuthHeaders() {
  if (!hasSupabaseConfig) {
    return {};
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  } catch (error) {
    console.error("Error getting auth session:", error);
  }
  return {};
}

// Helper to sign out
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
