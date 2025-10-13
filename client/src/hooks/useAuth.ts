import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      setIsReady(true);
      // Invalidate user query when auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: ["/api/auth?action=user"] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth?action=user"],
    retry: false,
    enabled: isReady,
    queryFn: async () => {
      const authHeaders = await import("@/lib/supabase").then(m => m.getAuthHeaders());
      
      const headers: Record<string, string> = {};
      if (authHeaders.Authorization) {
        headers["Authorization"] = authHeaders.Authorization;
      }
      
      const res = await fetch("/api/auth?action=user", {
        credentials: "include",
        headers,
      });

      // Return null for unauthorized users instead of throwing
      if (res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
  });

  return {
    user: user ?? null,
    isLoading: isLoading || !isReady,
    isAuthenticated: !!user,
  };
}
