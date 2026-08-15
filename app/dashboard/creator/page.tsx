"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import { CreatorProfile, SocialPlatform } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import { creatorProfileFromRow, creatorProfileToRow } from "@/lib/supabase/profiles";

function formatNumber(value?: number) {
  if (value === undefined) return "Pending";
  return new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function CreatorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcome, setWelcome] = useState(true);
  const [syncing, setSyncing] = useState<SocialPlatform | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    let active = true;
    const userId = user.id;
    async function loadProfile() {
      const { data, error: profileError } = await supabase.from("creator_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (!active) return;
      if (profileError) setError(profileError.message);
      setProfile(data ? creatorProfileFromRow(data) : null);
      setLoading(false);
    }
    void loadProfile();
    return () => { active = false; };
  }, [authLoading, supabase, user]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks = [profile.bio, profile.phone, profile.socials.length, profile.rates.length, profile.socials.some((item) => item.status === "synced" || item.status === "connected")];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  async function syncSocial(platform: SocialPlatform, url: string) {
    if (!profile) return;
    setSyncing(platform);
    try {
      const response = await fetch("/api/social-sync", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ platform, url }) });
      const result = await response.json();
      const next = { ...profile, socials: profile.socials.map((social) => social.platform === platform ? { ...social, ...(response.ok ? result : { status: "error", message: result.error }) } : social), updatedAt: new Date().toISOString() } as CreatorProfile;
      if (!user) return;
      const { error: saveError } = await supabase.from("creator_profiles").upsert(creatorProfileToRow(user.id, next), { onConflict: "user_id" });
      if (saveError) {
        setError(saveError.message);
        return;
      }
      setProfile(next);
    } finally {
      setSyncing(null);
    }
  }

  if (loading) return <main className="module-page"><ModuleHeader /><section className="missing-profile"><span>CR</span><h1>Loading your creator workspace…</h1></section></main>;
  if (!profile) return <main className="module-page"><ModuleHeader /><section className="missing-profile"><span>CR</span><h1>Create your creator profile first</h1><p>Add your audience, channels and starting rates to become discoverable.</p><Link href="/join/creator">Start creator onboarding →</Link></section></main>;

  const startingRate = Math.min(...profile.rates.map((rate) => rate.price));

  return (
    <main className="module-page dashboard-page">
      <ModuleHeader />
      <section className="dashboard-shell">
        {welcome && <div className="welcome-banner"><span>✓</span><div><strong>Your creator profile is live in this workspace.</strong><p>Keep your rates and connected channels current to improve buyer confidence.</p></div><button type="button" onClick={() => setWelcome(false)}>×</button></div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <header className="dashboard-heading"><div><span className="section-kicker">Creator workspace</span><h1>Welcome, {profile.displayName.split(" ")[0]}.</h1><p>Manage how businesses discover and evaluate your work.</p></div><Link className="primary-action" href="/join/creator">Edit profile</Link></header>

        <div className="dashboard-stat-grid">
          <article><span>Profile readiness</span><strong>{completion}%</strong><div className="mini-progress"><i style={{ width: `${completion}%` }} /></div></article>
          <article><span>Connected channels</span><strong>{profile.socials.length}</strong><small>{profile.socials.filter((item) => item.status === "synced").length} live data syncs</small></article>
          <article><span>Published packages</span><strong>{profile.rates.length}</strong><small>From ₦{new Intl.NumberFormat("en-NG").format(startingRate)}</small></article>
          <article><span>Profile status</span><strong className="status-live"><i /> Live</strong><small>Updated {new Date(profile.updatedAt).toLocaleDateString("en-NG")}</small></article>
        </div>

        <div className="dashboard-columns">
          <section className="dashboard-panel social-panel"><div className="dashboard-panel-head"><div><span>Channel connections</span><h2>Social data</h2></div><small>Sync status is shown per provider</small></div><div className="dashboard-social-list">{profile.socials.map((social) => <article key={social.platform}><span className={`social-mark ${social.platform.toLowerCase()}`}>{social.platform === "YouTube" ? "YT" : social.platform === "Instagram" ? "IG" : social.platform === "TikTok" ? "TT" : "𝕏"}</span><div><strong>{social.platform}</strong><a href={social.url} target="_blank" rel="noreferrer">{social.handle ?? social.url}</a></div><div className="channel-metric"><strong>{formatNumber(social.followers)}</strong><span>{social.followers === undefined ? "live followers" : "followers"}</span></div><span className={`sync-status ${social.status}`}>{social.status === "synced" ? "Live" : social.status === "connected" ? "Connected" : "Needs attention"}</span><button type="button" disabled={syncing === social.platform} onClick={() => syncSocial(social.platform, social.url)}>{syncing === social.platform ? "Syncing…" : "Refresh"}</button>{social.message && <small>{social.message}</small>}</article>)}</div></section>

          <aside className="dashboard-panel profile-preview"><span className="panel-label">Business preview</span><div className="preview-avatar">{profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}<i /></div><h2>{profile.displayName}</h2><p>{profile.niche} · {profile.location}</p><blockquote>{profile.bio}</blockquote><div><span>Starting from</span><strong>₦{new Intl.NumberFormat("en-NG").format(startingRate)}</strong></div><Link href="/#creator-results">View marketplace →</Link></aside>
        </div>

        <section className="dashboard-panel rate-panel"><div className="dashboard-panel-head"><div><span>Commercial information</span><h2>Your published packages</h2></div><Link href="/join/creator">Edit rate card</Link></div><div className="dashboard-rate-grid">{profile.rates.map((rate, index) => <article key={`${rate.title}-${index}`}><span>0{index + 1}</span><div><strong>{rate.title}</strong><p>{rate.deliverables}</p></div><strong>₦{new Intl.NumberFormat("en-NG").format(rate.price)}</strong></article>)}</div></section>
      </section>
    </main>
  );
}
