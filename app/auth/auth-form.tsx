"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { AccountRole } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  initialMode: "signin" | "signup";
  initialRole: AccountRole;
  next: string;
  initialError: string;
};

function dashboardFor(role: AccountRole) {
  return role === "creator" ? "/dashboard/creator" : "/dashboard/business";
}

export function AuthForm({ initialMode, initialRole, next, initialError }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function ensureAccount(user: User, requestedRole: AccountRole, requestedName: string) {
    const { data: existing, error: selectError } = await supabase
      .from("account_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (selectError) throw selectError;
    if (existing?.role === "creator" || existing?.role === "business") return existing.role;

    const displayName = requestedName.trim() || String(user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split("@")[0] ?? "CreatorRadar user");
    const { error: insertError } = await supabase.from("account_profiles").insert({
      user_id: user.id,
      role: requestedRole,
      display_name: displayName,
      email: user.email ?? email,
    });
    if (insertError) throw insertError;
    return requestedRole;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
        const callback = `${window.location.origin}/auth/callback?role=${role}&next=${encodeURIComponent(next)}`;
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callback, data: { full_name: name } },
        });
        if (signupError) throw signupError;
        if (data.session && data.user) {
          await ensureAccount(data.user, role, name);
          router.push(next);
          router.refresh();
        } else {
          setNotice("Check your email to confirm your account, then return to CreatorRadar to finish your profile.");
        }
      } else {
        const { data, error: signinError } = await supabase.auth.signInWithPassword({ email, password });
        if (signinError) throw signinError;
        const accountRole = await ensureAccount(data.user, role, name);
        router.push(dashboardFor(accountRole));
        router.refresh();
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setSubmitting(true);
    setError("");
    const callback = `${window.location.origin}/auth/callback?role=${role}&next=${encodeURIComponent(next)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback },
    });
    if (oauthError) {
      setError(oauthError.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="brand auth-brand" href="/">
          <span className="radar-logo"><span /></span><span>Creator<span>Radar</span></span>
        </Link>
        <div><span className="section-kicker light">One account. Better partnerships.</span><h1>{role === "creator" ? "Turn your influence into a clear business profile." : "Build creator shortlists your team can trust."}</h1><p>{role === "creator" ? "Connect your channels, publish your starting rates and stay discoverable to serious Nigerian businesses." : "Unlock every creator profile, save your consideration set and request current commercial information."}</p></div>
        <small>Secure authentication and private workspace data powered by Supabase.</small>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mode-switch"><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Create account</button><button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Sign in</button></div>
          <div className="auth-heading"><span className="section-kicker">{mode === "signup" ? "Get started free" : "Welcome back"}</span><h2>{mode === "signup" ? "Create your CreatorRadar account" : "Sign in to your workspace"}</h2><p>Choose the workspace that matches how you use CreatorRadar.</p></div>

          <div className="auth-role-picker" role="group" aria-label="Account type">
            <button type="button" className={role === "business" ? "selected" : ""} onClick={() => setRole("business")}><span>BR</span><div><strong>Business</strong><small>Discover and shortlist creators</small></div></button>
            <button type="button" className={role === "creator" ? "selected" : ""} onClick={() => setRole("creator")}><span>CR</span><div><strong>Creator</strong><small>Publish your profile and rates</small></div></button>
          </div>

          <button className="google-auth-button" type="button" onClick={continueWithGoogle} disabled={submitting}><span>G</span> Continue with Google</button>
          <div className="auth-divider"><span>or continue with email</span></div>

          <form onSubmit={submit}>
            {mode === "signup" && <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></label>}
            <label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-notice" role="status">{notice}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Please wait…" : mode === "signup" ? `Create ${role} account` : "Sign in"}<span>→</span></button>
          </form>
          <p className="auth-terms">By continuing, you agree to CreatorRadar&apos;s acceptable-use and privacy terms.</p>
        </div>
      </section>
    </main>
  );
}
