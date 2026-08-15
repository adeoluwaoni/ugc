import { redirect } from "next/navigation";
import type { AccountRole } from "@/lib/account";
import { createClient } from "./server";

export async function requireRole(role: AccountRole, returnTo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?mode=signin&role=${role}&next=${encodeURIComponent(returnTo)}`);
  }

  const { data: account } = await supabase
    .from("account_profiles")
    .select("user_id, role, display_name, email, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    redirect(`/auth?mode=signup&role=${role}&next=${encodeURIComponent(returnTo)}`);
  }

  if (account.role !== role) {
    redirect(account.role === "creator" ? "/dashboard/creator" : "/dashboard/business");
  }

  return { user, account };
}
