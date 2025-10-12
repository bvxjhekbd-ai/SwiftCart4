import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: isReady,
  });

  return {
    user: user ?? null,
    isLoading: isLoading || !isReady,
    isAuthenticated: !!user,
  };
}
