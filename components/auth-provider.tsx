"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { RadarAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";

type AuthAccount = RadarAccount & { userId: string };

type AuthContextValue = {
  user: User | null;
  account: AuthAccount | null;
  loading: boolean;
  refreshAccount: () => Promise<AuthAccount | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccount = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setAccount(null);
      return null;
    }
    const { data } = await supabase
      .from("account_profiles")
      .select("user_id, role, display_name, email, created_at")
      .eq("user_id", nextUser.id)
      .maybeSingle();
    const nextAccount = data && (data.role === "creator" || data.role === "business") ? {
      userId: data.user_id,
      role: data.role,
      name: data.display_name,
      email: data.email,
      createdAt: data.created_at,
    } satisfies AuthAccount : null;
    setAccount(nextAccount);
    return nextAccount;
  }, [supabase]);

  const refreshAccount = useCallback(async () => loadAccount(user), [loadAccount, user]);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { user: nextUser } } = await supabase.auth.getUser();
      if (!active) return;
      setUser(nextUser);
      await loadAccount(nextUser);
      if (active) setLoading(false);
    }
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void loadAccount(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadAccount, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setAccount(null);
    window.location.assign("/");
  }

  return <AuthContext.Provider value={{ user, account, loading, refreshAccount, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
