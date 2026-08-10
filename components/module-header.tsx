"use client";

import Link from "next/link";
import { RadarAccount, storageKeys, useStored } from "@/lib/account";

export function ModuleHeader() {
  const account = useStored<RadarAccount | null>(storageKeys.account, null);

  const dashboard = account?.role === "creator" ? "/dashboard/creator" : "/dashboard/business";

  return (
    <header className="topbar module-topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label="CreatorRadar home">
          <span className="radar-logo"><span /></span>
          <span>Creator<span>Radar</span></span>
        </Link>
        <nav className="main-nav module-nav" aria-label="Primary navigation">
          <Link href="/#creator-results">Explore creators</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/join/creator">For creators</Link>
        </nav>
        <div className="topbar-actions">
          {account ? (
            <Link className="business-button" href={dashboard}>Open dashboard</Link>
          ) : (
            <Link className="business-button" href="/join/business">For businesses</Link>
          )}
        </div>
      </div>
    </header>
  );
}
