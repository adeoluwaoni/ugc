"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type AccountRole = "creator" | "business";

export type RadarAccount = {
  role: AccountRole;
  name: string;
  email: string;
  createdAt: string;
};

export type SocialPlatform = "Instagram" | "TikTok" | "YouTube" | "X";

export type SocialConnection = {
  platform: SocialPlatform;
  url: string;
  handle?: string;
  status?: "not_checked" | "connected" | "synced" | "error";
  followers?: number;
  posts?: number;
  views?: number;
  syncedAt?: string;
  message?: string;
};

export type RatePackage = {
  title: string;
  deliverables: string;
  price: number;
};

export type CreatorProfile = {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  niche: string;
  bio: string;
  availability: string;
  socials: SocialConnection[];
  rates: RatePackage[];
  updatedAt: string;
};

export type BusinessProfile = {
  contactName: string;
  workEmail: string;
  companyName: string;
  website: string;
  industry: string;
  teamSize: string;
  monthlyBudget: string;
  goals: string[];
  updatedAt: string;
};

export const storageKeys = {
  shortlist: "creatorradar.shortlist",
  profileViews: "creatorradar.profileViews",
} as const;

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("creatorradar-storage"));
}

export function useStored<T>(key: string, fallback: T): T {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener("creatorradar-storage", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("creatorradar-storage", callback);
    };
  }, []);
  const getSnapshot = useCallback(() => window.localStorage.getItem(key) ?? "", [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "");
  return useMemo(() => {
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }, [fallback, raw]);
}
