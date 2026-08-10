"use client";

import Link from "next/link";
import { useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { BusinessProfile, storageKeys, useStored, writeStored } from "@/lib/account";
import { creatorCatalog } from "@/lib/catalog";

export default function BusinessDashboardPage() {
  const profile = useStored<BusinessProfile | null>(storageKeys.businessProfile, null);
  const shortlist = useStored<number[]>(storageKeys.shortlist, []);
  const [welcome, setWelcome] = useState(true);

  function removeCreator(id: number) {
    const next = shortlist.filter((item) => item !== id);
    writeStored(storageKeys.shortlist, next);
  }

  if (!profile) return <main className="module-page"><ModuleHeader /><section className="missing-profile"><span>BR</span><h1>Create your business workspace</h1><p>Sign up to unlock unlimited creator profiles and persistent shortlists.</p><Link href="/join/business">Create a free workspace →</Link></section></main>;

  const selectedCreators = creatorCatalog.filter((creator) => shortlist.includes(creator.id));

  return (
    <main className="module-page dashboard-page business-dashboard">
      <ModuleHeader />
      <section className="dashboard-shell">
        {welcome && <div className="welcome-banner"><span>✓</span><div><strong>Your business workspace is ready.</strong><p>You now have unlimited profile access. Creators you shortlist in the marketplace will appear here.</p></div><button type="button" onClick={() => setWelcome(false)}>×</button></div>}
        <header className="dashboard-heading"><div><span className="section-kicker">{profile.companyName} workspace</span><h1>Find your next creator partner.</h1><p>Review your shortlist, compare commercial fit and move qualified creators into campaign conversations.</p></div><div><Link className="secondary-action" href="/join/business">Workspace settings</Link><Link className="primary-action" href="/#creator-results">Browse creators</Link></div></header>

        <div className="dashboard-stat-grid">
          <article><span>Shortlisted creators</span><strong>{selectedCreators.length}</strong><small>Saved to this workspace</small></article>
          <article><span>Typical monthly budget</span><strong className="budget-stat">{profile.monthlyBudget}</strong><small>Used for recommendation fit</small></article>
          <article><span>Active searches</span><strong>1</strong><small>Nigeria · All niches</small></article>
          <article><span>Plan</span><strong>Explore</strong><small><Link href="/pricing">Compare plans →</Link></small></article>
        </div>

        <section className="dashboard-panel shortlist-panel">
          <div className="dashboard-panel-head"><div><span>Your consideration set</span><h2>Creator shortlist</h2></div>{selectedCreators.length > 0 && <Link href="/#creator-results">Add creators</Link>}</div>
          {selectedCreators.length ? <div className="shortlist-table"><div className="shortlist-table-head"><span>Creator</span><span>Audience</span><span>Engagement</span><span>Starting rate</span><span /></div>{selectedCreators.map((creator) => <article key={creator.id}><div><span className={`shortlist-avatar ${creator.color}`}>{creator.initials}</span><p><strong>{creator.name}</strong><small>{creator.niche} · {creator.location}</small></p></div><strong>{creator.followers}</strong><strong className="good-metric">{creator.engagement}</strong><strong>{creator.rate}</strong><div><Link href={`/?creator=${creator.id}#creator-results`}>View profile</Link><button type="button" onClick={() => removeCreator(creator.id)} aria-label={`Remove ${creator.name}`}>×</button></div></article>)}</div> : <div className="empty-shortlist"><span>◎</span><h3>Your shortlist is ready for its first creator</h3><p>Browse CreatorRadar and tap the heart on creators you want to compare here.</p><Link href="/#creator-results">Explore creators →</Link></div>}
        </section>

        <div className="dashboard-columns business-insights">
          <section className="dashboard-panel"><div className="dashboard-panel-head"><div><span>Workspace goals</span><h2>What your team is here to do</h2></div></div><div className="workspace-goals">{profile.goals.map((goal) => <span key={goal}>✓ {goal}</span>)}</div></section>
          <aside className="dashboard-panel next-step-card"><span className="panel-label">Suggested next step</span><h2>Turn your campaign brief into a shortlist</h2><p>Use Radar AI on the marketplace to set niche, audience, location and budget filters in one prompt.</p><Link href="/#top">Open Radar AI →</Link></aside>
        </div>
      </section>
    </main>
  );
}
