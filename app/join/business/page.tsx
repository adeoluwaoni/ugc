"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import { BusinessProfile } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import { businessProfileFromRow, businessProfileToRow } from "@/lib/supabase/profiles";

const goalOptions = ["Find creators", "Build shortlists", "Compare rates", "Request campaigns", "Track creator performance"];
const initialProfile: BusinessProfile = { contactName: "", workEmail: "", companyName: "", website: "", industry: "Consumer products", teamSize: "1–10", monthlyBudget: "₦250K–₦1M", goals: ["Find creators", "Build shortlists"], updatedAt: "" };

export default function BusinessJoinPage() {
  const router = useRouter();
  const { user, account, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [storedProfile, setStoredProfile] = useState<BusinessProfile | null>(null);
  const [draft, setDraft] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const profileFallback = useMemo(() => ({ ...initialProfile, contactName: account?.name ?? "", workEmail: user?.email ?? account?.email ?? "" }), [account, user]);
  const profile = draft ?? storedProfile ?? profileFallback;
  function setProfile(update: BusinessProfile | ((current: BusinessProfile) => BusinessProfile)) {
    setDraft((current) => typeof update === "function" ? update(current ?? storedProfile ?? profileFallback) : update);
  }
  const isEditing = Boolean(storedProfile);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    let active = true;
    const userId = user.id;
    async function loadProfile() {
      const { data, error: profileError } = await supabase.from("business_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (profileError) setError(profileError.message);
      setStoredProfile(data ? businessProfileFromRow(data) : null);
      setLoading(false);
    }
    void loadProfile();
    return () => { active = false; };
  }, [authLoading, supabase, user]);

  function toggleGoal(goal: string) {
    setProfile((current) => ({ ...current, goals: current.goals.includes(goal) ? current.goals.filter((item) => item !== goal) : [...current.goals, goal] }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      setError("Your session has expired. Sign in again to save this workspace.");
      return;
    }
    setSaving(true);
    setError("");
    const saved = { ...profile, updatedAt: new Date().toISOString() };
    const { error: saveError } = await supabase.from("business_profiles").upsert(businessProfileToRow(user.id, saved), { onConflict: "user_id" });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setStoredProfile(saved);
    router.push("/dashboard/business?welcome=1");
    router.refresh();
  }

  if (loading) return <main className="module-page"><ModuleHeader /><section className="missing-profile"><span>BR</span><h1>Loading your business workspace…</h1></section></main>;

  return (
    <main className="module-page business-join-page">
      <ModuleHeader />
      <section className="split-signup">
        <div className="signup-promise">
          <span className="section-kicker light">Business workspace</span>
          <h1>Make creator decisions<br/><em>with the full picture.</em></h1>
          <p>Get beyond follower counts. Discover relevant Nigerian creators, compare current commercial information and keep your whole shortlist in one place.</p>
          <div className="promise-list">
            <div><span>01</span><p><strong>Unlimited profile access</strong><small>Move beyond the three-profile guest preview.</small></p></div>
            <div><span>02</span><p><strong>Persistent shortlists</strong><small>Keep the creators your team is considering together.</small></p></div>
            <div><span>03</span><p><strong>Rate and availability requests</strong><small>Approach creators with a clear campaign brief.</small></p></div>
          </div>
          <blockquote>“The right creator is a business decision—not a popularity contest.”</blockquote>
        </div>

        <div className="signup-form-wrap">
          <form className="business-signup-form" onSubmit={submit}>
            <div className="form-heading"><span>BR</span><div><h2>{isEditing ? "Update your workspace" : "Create your business account"}</h2><p>Start with a free workspace. No card required.</p></div></div>
            <div className="field-grid two">
              <label>Your name<input required value={profile.contactName} onChange={(event) => setProfile({ ...profile, contactName: event.target.value })} placeholder="Full name" /></label>
              <label>Work email<input required type="email" value={profile.workEmail} onChange={(event) => setProfile({ ...profile, workEmail: event.target.value })} placeholder="you@company.com" /></label>
              <label>Company name<input required value={profile.companyName} onChange={(event) => setProfile({ ...profile, companyName: event.target.value })} placeholder="Your company" /></label>
              <label>Company website<input type="url" value={profile.website} onChange={(event) => setProfile({ ...profile, website: event.target.value })} placeholder="https://company.com" /></label>
              <label>Industry<select value={profile.industry} onChange={(event) => setProfile({ ...profile, industry: event.target.value })}><option>Consumer products</option><option>Agency</option><option>Financial services</option><option>Hospitality</option><option>Technology</option><option>Non-profit</option><option>Other</option></select></label>
              <label>Team size<select value={profile.teamSize} onChange={(event) => setProfile({ ...profile, teamSize: event.target.value })}><option>1–10</option><option>11–50</option><option>51–200</option><option>201+</option></select></label>
            </div>
            <label>Typical monthly creator budget<select value={profile.monthlyBudget} onChange={(event) => setProfile({ ...profile, monthlyBudget: event.target.value })}><option>Under ₦250K</option><option>₦250K–₦1M</option><option>₦1M–₦5M</option><option>₦5M+</option><option>Still exploring</option></select></label>
            <fieldset><legend>What do you want to do first?</legend><div className="goal-picker">{goalOptions.map((goal) => <button key={goal} type="button" className={profile.goals.includes(goal) ? "selected" : ""} onClick={() => toggleGoal(goal)}><span>{profile.goals.includes(goal) ? "✓" : "+"}</span>{goal}</button>)}</div></fieldset>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-action wide" type="submit" disabled={saving}>{saving ? "Saving…" : isEditing ? "Save workspace" : "Create free workspace"} <span>→</span></button>
            <small className="terms-copy">By continuing, you agree to CreatorRadar&apos;s acceptable-use and privacy terms.</small>
          </form>
          <p>Are you a creator? <Link href="/join/creator">Create a creator profile</Link>.</p>
        </div>
      </section>
    </main>
  );
}
