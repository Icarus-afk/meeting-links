"use client";

import { useEffect, useState } from "react";
import { getSupabseClient } from "../supaClient/index";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabseClient();

    const initAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const logout = async () => {
    const supabase = getSupabseClient();
    await supabase.auth.signOut();
    localStorage.removeItem("auth-token"); 
    localStorage.removeItem("sb-meyuyiynhsbnidepvcdr-auth-token");
    setUser(null);
  };

  return { user, loading, logout };
};