import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["creator", "business"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("accounts_email_unique").on(table.email)]);

export const creatorProfiles = sqliteTable("creator_profiles", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  niche: text("niche").notNull(),
  bio: text("bio").notNull(),
  availability: text("availability").notNull(),
  status: text("status", { enum: ["draft", "published", "paused"] }).notNull(),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
}, (table) => [uniqueIndex("creator_profiles_account_unique").on(table.accountId), uniqueIndex("creator_profiles_slug_unique").on(table.slug), index("creator_profiles_discovery_idx").on(table.status, table.niche, table.location)]);

export const businessProfiles = sqliteTable("business_profiles", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  website: text("website"),
  industry: text("industry").notNull(),
  teamSize: text("team_size").notNull(),
  monthlyBudget: text("monthly_budget").notNull(),
  goals: text("goals", { mode: "json" }).$type<string[]>().notNull(),
}, (table) => [uniqueIndex("business_profiles_account_unique").on(table.accountId)]);

export const socialAccounts = sqliteTable("social_accounts", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  platform: text("platform", { enum: ["Instagram", "TikTok", "YouTube", "X"] }).notNull(),
  profileUrl: text("profile_url").notNull(),
  handle: text("handle"),
  connectionStatus: text("connection_status", { enum: ["not_checked", "connected", "synced", "error"] }).notNull(),
  followers: integer("followers"),
  posts: integer("posts"),
  views: integer("views"),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
  providerMessage: text("provider_message"),
}, (table) => [uniqueIndex("social_accounts_creator_platform_unique").on(table.creatorId, table.platform)]);

export const ratePackages = sqliteTable("rate_packages", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  deliverables: text("deliverables").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  sortOrder: integer("sort_order").notNull(),
  active: integer("active", { mode: "boolean" }).notNull(),
}, (table) => [index("rate_packages_creator_idx").on(table.creatorId, table.active)]);

export const shortlistItems = sqliteTable("shortlist_items", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businessProfiles.id, { onDelete: "cascade" }),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("shortlist_business_creator_unique").on(table.businessId, table.creatorId)]);

export const profileViews = sqliteTable("profile_views", {
  id: text("id").primaryKey(),
  viewerKey: text("viewer_key").notNull(),
  accountId: text("account_id").references(() => accounts.id, { onDelete: "set null" }),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  viewedAt: integer("viewed_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("profile_views_gate_idx").on(table.viewerKey, table.viewedAt)]);
