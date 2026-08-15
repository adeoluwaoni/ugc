"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import { CreatorProfile, RatePackage, SocialConnection, SocialPlatform } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import { creatorProfileFromRow, creatorProfileToRow } from "@/lib/supabase/profiles";

const platforms: SocialPlatform[] = ["Instagram", "TikTok", "YouTube", "X"];
const niches = ["Beauty & Skincare", "Business & Career", "Comedy & Entertainment", "Fashion & Style", "Finance & Business", "Fitness & Wellness", "Food & Lifestyle", "Home & Family", "Tech & Gadgets", "Travel & Culture", "Other"];

const blankSocials: SocialConnection[] = platforms.map((platform) => ({ platform, url: "", status: "not_checked" }));
const blankRates: RatePackage[] = [
  { title: "Short-form video", deliverables: "1 edited Reel or TikTok video", price: 0 },
  { title: "Story package", deliverables: "3–5 story frames", price: 0 },
];

const initialProfile: CreatorProfile = {
  displayName: "",
  email: "",
  phone: "",
  location: "Lagos",
  niche: niches[0],
  bio: "",
  availability: "Available this month",
  socials: blankSocials,
  rates: blankRates,
  updatedAt: "",
};

export default function CreatorJoinPage() {
  const router = useRouter();
  const { user, account, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [storedProfile, setStoredProfile] = useState<CreatorProfile | null>(null);
  const [draft, setDraft] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const profileFallback = useMemo(() => ({ ...initialProfile, displayName: account?.name ?? "", email: user?.email ?? account?.email ?? "" }), [account, user]);
  const normalizedStored = useMemo(() => storedProfile ? { ...storedProfile, socials: platforms.map((platform) => storedProfile.socials.find((item) => item.platform === platform) ?? { platform, url: "", status: "not_checked" as const }) } : null, [storedProfile]);
  const profile = draft ?? normalizedStored ?? profileFallback;
  function setProfile(update: CreatorProfile | ((current: CreatorProfile) => CreatorProfile)) {
    setDraft((current) => typeof update === "function" ? update(current ?? normalizedStored ?? profileFallback) : update);
  }
  const [step, setStep] = useState(1);
  const [syncing, setSyncing] = useState<SocialPlatform | null>(null);
  const [error, setError] = useState("");
  const isEditing = Boolean(storedProfile);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    let active = true;
    const userId = user.id;
    async function loadProfile() {
      const { data, error: profileError } = await supabase.from("creator_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (profileError) setError(profileError.message);
      setStoredProfile(data ? creatorProfileFromRow(data) : null);
      setLoading(false);
    }
    void loadProfile();
    return () => { active = false; };
  }, [authLoading, supabase, user]);

  const completion = useMemo(() => {
    const checks = [profile.displayName, profile.email, profile.location, profile.niche, profile.bio, profile.socials.some((item) => item.url), profile.rates.some((item) => item.price > 0)];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  function updateSocial(platform: SocialPlatform, url: string) {
    setProfile((current) => ({ ...current, socials: current.socials.map((item) => item.platform === platform ? { platform, url, status: "not_checked" } : item) }));
  }

  async function syncSocial(platform: SocialPlatform) {
    const social = profile.socials.find((item) => item.platform === platform);
    if (!social?.url) return;
    setSyncing(platform);
    setError("");
    try {
      const response = await fetch("/api/social-sync", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ platform, url: social.url }) });
      const result = await response.json() as Omit<SocialConnection, "platform" | "url"> & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not connect this profile.");
      setProfile((current) => ({ ...current, socials: current.socials.map((item) => item.platform === platform ? { ...item, ...result } : item) }));
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "Could not connect this profile.";
      setProfile((current) => ({ ...current, socials: current.socials.map((item) => item.platform === platform ? { ...item, status: "error", message } : item) }));
      setError(message);
    } finally {
      setSyncing(null);
    }
  }

  function updateRate(index: number, key: keyof RatePackage, value: string | number) {
    setProfile((current) => ({ ...current, rates: current.rates.map((rate, rateIndex) => rateIndex === index ? { ...rate, [key]: value } : rate) }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const socials = profile.socials.filter((item) => item.url.trim());
    const rates = profile.rates.filter((item) => item.title.trim() && item.price > 0);
    if (!socials.length || !rates.length) {
      setError("Add at least one social profile and one priced package before publishing.");
      return;
    }
    if (!user) {
      setError("Your session has expired. Sign in again to publish your profile.");
      return;
    }
    setSaving(true);
    const saved = { ...profile, socials, rates, updatedAt: new Date().toISOString() };
    const { error: saveError } = await supabase.from("creator_profiles").upsert(creatorProfileToRow(user.id, saved), { onConflict: "user_id" });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setStoredProfile(saved);
    router.push("/dashboard/creator?welcome=1");
    router.refresh();
  }

  if (loading) return <main className="module-page"><ModuleHeader /><section className="missing-profile"><span>CR</span><h1>Loading your creator workspace…</h1></section></main>;

  return (
    <main className="module-page">
      <ModuleHeader />
      <section className="module-hero compact">
        <div>
          <span className="section-kicker">Creator onboarding</span>
          <h1>Own your profile.<br/><em>Set your value.</em></h1>
          <p>Create a searchable CreatorRadar profile, connect your public channels and keep your commercial rates current.</p>
        </div>
        <div className="completion-card"><span>Profile readiness</span><strong>{completion}%</strong><div><i style={{ width: `${completion}%` }} /></div><small>Complete profiles rank more confidently in business searches.</small></div>
      </section>

      <section className="onboarding-layout">
        <aside className="step-rail" aria-label="Onboarding progress">
          {[
            [1, "Profile", "Tell businesses who you are"],
            [2, "Social accounts", "Connect your public channels"],
            [3, "Rates", "Publish clear packages"],
          ].map(([number, title, detail]) => <button key={number} type="button" className={step === number ? "active" : step > Number(number) ? "complete" : ""} onClick={() => setStep(Number(number))}><span>{step > Number(number) ? "✓" : number}</span><div><strong>{title}</strong><small>{detail}</small></div></button>)}
          <div className="trust-note"><strong>Your data stays yours</strong><p>We only request permitted public metrics. Login credentials for social platforms are never collected here.</p></div>
        </aside>

        <form className="onboarding-card" onSubmit={submit}>
          {step === 1 && (
            <div className="form-step">
              <div className="form-heading"><span>01</span><div><h2>Build your creator profile</h2><p>This is the information businesses will use to find and evaluate you.</p></div></div>
              <div className="field-grid two">
                <label>Display name<input required value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} placeholder="e.g. Ada Nwosu" /></label>
                <label>Email address<input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} placeholder="you@example.com" /></label>
                <label>Phone number<input required value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="+234 800 000 0000" /></label>
                <label>Primary location<input required value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} placeholder="Lagos" /></label>
                <label>Primary niche<select value={profile.niche} onChange={(event) => setProfile({ ...profile, niche: event.target.value })}>{niches.map((niche) => <option key={niche}>{niche}</option>)}</select></label>
                <label>Availability<select value={profile.availability} onChange={(event) => setProfile({ ...profile, availability: event.target.value })}><option>Available this week</option><option>Available this month</option><option>Booking next month</option><option>Currently unavailable</option></select></label>
              </div>
              <label>Creator bio<textarea required maxLength={320} value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder="Describe your audience, content style and the brands you work best with." /><small>{profile.bio.length}/320 characters</small></label>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-heading"><span>02</span><div><h2>Connect your social presence</h2><p>Add complete profile URLs. CreatorRadar verifies the link, then pulls live public metrics where provider access is configured.</p></div></div>
              <div className="social-connect-list">
                {profile.socials.map((social) => (
                  <div className={`social-connect ${social.status ?? "not_checked"}`} key={social.platform}>
                    <span className={`social-mark ${social.platform.toLowerCase()}`}>{social.platform === "YouTube" ? "YT" : social.platform === "Instagram" ? "IG" : social.platform === "TikTok" ? "TT" : "𝕏"}</span>
                    <label><strong>{social.platform}</strong><input type="url" value={social.url} onChange={(event) => updateSocial(social.platform, event.target.value)} placeholder={`https://${social.platform === "X" ? "x.com" : `${social.platform.toLowerCase()}.com`}/yourhandle`} /></label>
                    <button type="button" disabled={!social.url || syncing === social.platform} onClick={() => syncSocial(social.platform)}>{syncing === social.platform ? "Checking…" : social.status === "synced" ? "Sync again" : social.status === "connected" ? "Connected" : "Check link"}</button>
                    {social.message && <small>{social.message}</small>}
                    {social.followers !== undefined && <div className="sync-metrics"><strong>{new Intl.NumberFormat("en-NG").format(social.followers)}</strong><span>followers</span></div>}
                  </div>
                ))}
              </div>
              <div className="api-disclosure"><strong>Live-data readiness</strong><p>YouTube metrics sync with <code>YOUTUBE_API_KEY</code>; X metrics sync with <code>X_BEARER_TOKEN</code>. Instagram and TikTok links are verified and queued until approved provider access is configured.</p></div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <div className="form-heading"><span>03</span><div><h2>Publish your rate packages</h2><p>Clear starting prices help qualified businesses shortlist you faster. You can still quote usage, exclusivity and production separately.</p></div></div>
              <div className="rate-editor-list">
                {profile.rates.map((rate, index) => (
                  <div className="rate-editor" key={index}>
                    <span>0{index + 1}</span>
                    <label>Package name<input required value={rate.title} onChange={(event) => updateRate(index, "title", event.target.value)} placeholder="e.g. Instagram Reel" /></label>
                    <label>Deliverables<input required value={rate.deliverables} onChange={(event) => updateRate(index, "deliverables", event.target.value)} placeholder="What the business receives" /></label>
                    <label>Starting price (₦)<input required type="number" min="1000" step="1000" value={rate.price || ""} onChange={(event) => updateRate(index, "price", Number(event.target.value))} placeholder="150000" /></label>
                    {profile.rates.length > 1 && <button type="button" aria-label="Remove package" onClick={() => setProfile({ ...profile, rates: profile.rates.filter((_, rateIndex) => rateIndex !== index) })}>×</button>}
                  </div>
                ))}
              </div>
              <button className="add-row-button" type="button" onClick={() => setProfile({ ...profile, rates: [...profile.rates, { title: "", deliverables: "", price: 0 }] })}>+ Add another package</button>
              <div className="commercial-tip"><strong>Good rate cards reduce back-and-forth.</strong><span>List the base deliverable here and clarify content usage, category exclusivity and rush fees during campaign negotiation.</span></div>
            </div>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            <span>{isEditing ? "Editing your published profile" : "You can update this information at any time."}</span>
            <div>{step > 1 && <button className="secondary-action" type="button" onClick={() => { setError(""); setStep(step - 1); }}>Back</button>}{step < 3 ? <button className="primary-action" type="button" onClick={() => { setError(""); setStep(step + 1); }}>Continue</button> : <button className="primary-action" type="submit" disabled={saving}>{saving ? "Saving…" : isEditing ? "Save profile" : "Publish creator profile"}</button>}</div>
          </div>
        </form>
      </section>
      <p className="module-footnote">Joining as a business instead? <Link href="/join/business">Create a business workspace</Link>.</p>
    </main>
  );
}
