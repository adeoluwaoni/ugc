import { NextResponse } from "next/server";
import type { AccountRole } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

function validRole(value: string | null): AccountRole | null {
  return value === "creator" || value === "business" ? value : null;
}

function roleDestination(role: AccountRole, requested: string | null) {
  const fallback = role === "creator" ? "/dashboard/creator" : "/dashboard/business";
  if (!requested?.startsWith("/") || requested.startsWith("//")) return fallback;
  const allowedPrefix = role === "creator" ? ["/join/creator", "/dashboard/creator"] : ["/join/business", "/dashboard/business"];
  return allowedPrefix.some((prefix) => requested.startsWith(prefix)) ? requested : fallback;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedRole = validRole(url.searchParams.get("role"));
  const next = url.searchParams.get("next");

  if (!code) return NextResponse.redirect(`${url.origin}/auth/auth-code-error`);

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return NextResponse.redirect(`${url.origin}/auth/auth-code-error?message=${encodeURIComponent(exchangeError.message)}`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${url.origin}/auth/auth-code-error`);

  const { data: existing } = await supabase.from("account_profiles").select("role").eq("user_id", user.id).maybeSingle();
  let role = validRole(existing?.role ?? null);

  if (!role && requestedRole) {
    const displayName = String(user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split("@")[0] ?? "CreatorRadar user");
    const { error: profileError } = await supabase.from("account_profiles").insert({ user_id: user.id, role: requestedRole, display_name: displayName, email: user.email ?? "" });
    if (profileError) return NextResponse.redirect(`${url.origin}/auth/auth-code-error?message=${encodeURIComponent(profileError.message)}`);
    role = requestedRole;
  }

  if (!role) return NextResponse.redirect(`${url.origin}/auth?mode=signup&error=${encodeURIComponent("Choose a business or creator account to continue.")}`);

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl = process.env.NODE_ENV === "development" || !forwardedHost ? url.origin : `${forwardedProtocol}://${forwardedHost}`;
  return NextResponse.redirect(`${baseUrl}${roleDestination(role, next)}`);
}
