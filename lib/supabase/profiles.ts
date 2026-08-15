import type { BusinessProfile, CreatorProfile, RatePackage, SocialConnection, SocialPlatform } from "@/lib/account";
import type { Database, Json } from "./database.types";

type CreatorRow = Database["public"]["Tables"]["creator_profiles"]["Row"];
type CreatorInsert = Database["public"]["Tables"]["creator_profiles"]["Insert"];
type BusinessRow = Database["public"]["Tables"]["business_profiles"]["Row"];
type BusinessInsert = Database["public"]["Tables"]["business_profiles"]["Insert"];

const platforms: SocialPlatform[] = ["Instagram", "TikTok", "YouTube", "X"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function socialsFromJson(value: Json): SocialConnection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !platforms.includes(item.platform as SocialPlatform) || typeof item.url !== "string") return [];
    return [{
      platform: item.platform as SocialPlatform,
      url: item.url,
      handle: typeof item.handle === "string" ? item.handle : undefined,
      status: item.status === "connected" || item.status === "synced" || item.status === "error" ? item.status : "not_checked",
      followers: typeof item.followers === "number" ? item.followers : undefined,
      posts: typeof item.posts === "number" ? item.posts : undefined,
      views: typeof item.views === "number" ? item.views : undefined,
      syncedAt: typeof item.syncedAt === "string" ? item.syncedAt : undefined,
      message: typeof item.message === "string" ? item.message : undefined,
    }];
  });
}

function ratesFromJson(value: Json): RatePackage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.title !== "string" || typeof item.deliverables !== "string" || typeof item.price !== "number") return [];
    return [{ title: item.title, deliverables: item.deliverables, price: item.price }];
  });
}

export function creatorProfileFromRow(row: CreatorRow): CreatorProfile {
  return {
    displayName: row.display_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    niche: row.niche,
    bio: row.bio,
    availability: row.availability,
    socials: socialsFromJson(row.socials),
    rates: ratesFromJson(row.rates),
    updatedAt: row.updated_at,
  };
}

export function creatorProfileToRow(userId: string, profile: CreatorProfile): CreatorInsert {
  return {
    user_id: userId,
    display_name: profile.displayName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    niche: profile.niche,
    bio: profile.bio,
    availability: profile.availability,
    socials: profile.socials as unknown as Json,
    rates: profile.rates as unknown as Json,
    published: true,
    updated_at: profile.updatedAt,
  };
}

export function businessProfileFromRow(row: BusinessRow): BusinessProfile {
  return {
    contactName: row.contact_name,
    workEmail: row.work_email,
    companyName: row.company_name,
    website: row.website,
    industry: row.industry,
    teamSize: row.team_size,
    monthlyBudget: row.monthly_budget,
    goals: row.goals,
    updatedAt: row.updated_at,
  };
}

export function businessProfileToRow(userId: string, profile: BusinessProfile): BusinessInsert {
  return {
    user_id: userId,
    contact_name: profile.contactName,
    work_email: profile.workEmail,
    company_name: profile.companyName,
    website: profile.website,
    industry: profile.industry,
    team_size: profile.teamSize,
    monthly_budget: profile.monthlyBudget,
    goals: profile.goals,
    updated_at: profile.updatedAt,
  };
}
