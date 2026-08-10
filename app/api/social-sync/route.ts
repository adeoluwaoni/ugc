import { NextRequest, NextResponse } from "next/server";
import type { SocialPlatform } from "@/lib/account";

type SyncRequest = { platform?: SocialPlatform; url?: string };

function extractHandle(platform: SocialPlatform, input: string) {
  const url = new URL(input);
  const parts = url.pathname.split("/").filter(Boolean);
  if (platform === "YouTube") {
    const handle = parts.find((part) => part.startsWith("@"));
    return handle?.slice(1) ?? "";
  }
  return (parts[0] ?? "").replace(/^@/, "");
}

function isExpectedHost(platform: SocialPlatform, host: string) {
  const domains: Record<SocialPlatform, string[]> = {
    Instagram: ["instagram.com", "www.instagram.com"],
    TikTok: ["tiktok.com", "www.tiktok.com"],
    YouTube: ["youtube.com", "www.youtube.com", "youtu.be"],
    X: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  };
  return domains[platform].includes(host.toLowerCase());
}

async function syncYouTube(handle: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const params = new URLSearchParams({ part: "snippet,statistics", forHandle: handle, key });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error("YouTube could not verify this channel.");
  const payload = await response.json() as { items?: Array<{ snippet?: { customUrl?: string }; statistics?: { subscriberCount?: string; viewCount?: string; videoCount?: string } }> };
  const channel = payload.items?.[0];
  if (!channel) throw new Error("YouTube channel not found.");
  return {
    handle: channel.snippet?.customUrl ?? `@${handle}`,
    followers: Number(channel.statistics?.subscriberCount ?? 0),
    views: Number(channel.statistics?.viewCount ?? 0),
    posts: Number(channel.statistics?.videoCount ?? 0),
  };
}

async function syncX(handle: string) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return null;
  const response = await fetch(`https://api.x.com/2/users/by/username/${encodeURIComponent(handle)}?user.fields=public_metrics`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("X could not verify this account.");
  const payload = await response.json() as { data?: { username?: string; public_metrics?: { followers_count?: number; tweet_count?: number } } };
  if (!payload.data) throw new Error("X account not found.");
  return {
    handle: `@${payload.data.username ?? handle}`,
    followers: payload.data.public_metrics?.followers_count ?? 0,
    posts: payload.data.public_metrics?.tweet_count ?? 0,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json() as SyncRequest;
  if (!body.platform || !body.url) return NextResponse.json({ error: "Platform and profile URL are required." }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(body.url);
  } catch {
    return NextResponse.json({ error: "Enter a complete profile URL, including https://." }, { status: 400 });
  }

  if (!isExpectedHost(body.platform, parsed.hostname)) {
    return NextResponse.json({ error: `That URL is not a ${body.platform} profile.` }, { status: 400 });
  }

  const handle = extractHandle(body.platform, body.url);
  if (!handle) return NextResponse.json({ error: "We could not identify the account handle from that URL." }, { status: 400 });

  try {
    const metrics = body.platform === "YouTube" ? await syncYouTube(handle) : body.platform === "X" ? await syncX(handle) : null;
    if (metrics) {
      return NextResponse.json({ status: "synced", ...metrics, syncedAt: new Date().toISOString(), message: "Live public metrics synced." });
    }
    return NextResponse.json({
      status: "connected",
      handle: `@${handle}`,
      syncedAt: new Date().toISOString(),
      message: "Profile URL verified. Live metrics will sync when this platform's API credentials are configured.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Social sync failed." }, { status: 502 });
  }
}

