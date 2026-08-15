create table public.account_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('creator', 'business')),
  display_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_profiles (
  user_id uuid primary key references public.account_profiles (user_id) on delete cascade,
  display_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  niche text not null,
  bio text not null constraint creator_profiles_bio_length check (char_length(bio) <= 320),
  availability text not null,
  socials jsonb not null default '[]'::jsonb constraint creator_profiles_socials_array check (jsonb_typeof(socials) = 'array'),
  rates jsonb not null default '[]'::jsonb constraint creator_profiles_rates_array check (jsonb_typeof(rates) = 'array'),
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.business_profiles (
  user_id uuid primary key references public.account_profiles (user_id) on delete cascade,
  contact_name text not null,
  work_email text not null,
  company_name text not null,
  website text not null default '',
  industry text not null,
  team_size text not null,
  monthly_budget text not null,
  goals text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.shortlist_items (
  business_user_id uuid not null references public.business_profiles (user_id) on delete cascade,
  creator_catalog_id bigint not null constraint shortlist_creator_catalog_id_positive check (creator_catalog_id > 0),
  created_at timestamptz not null default now(),
  primary key (business_user_id, creator_catalog_id)
);

alter table public.account_profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.shortlist_items enable row level security;

create policy account_profiles_select_own on public.account_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy account_profiles_insert_own on public.account_profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy creator_profiles_select_own on public.creator_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy creator_profiles_insert_own on public.creator_profiles
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.account_profiles account
      where account.user_id = (select auth.uid()) and account.role = 'creator'
    )
  );

create policy creator_profiles_update_own on public.creator_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.account_profiles account
      where account.user_id = (select auth.uid()) and account.role = 'creator'
    )
  );

create policy business_profiles_select_own on public.business_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy business_profiles_insert_own on public.business_profiles
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.account_profiles account
      where account.user_id = (select auth.uid()) and account.role = 'business'
    )
  );

create policy business_profiles_update_own on public.business_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.account_profiles account
      where account.user_id = (select auth.uid()) and account.role = 'business'
    )
  );

create policy shortlist_items_select_own on public.shortlist_items
  for select to authenticated
  using ((select auth.uid()) = business_user_id);

create policy shortlist_items_insert_own on public.shortlist_items
  for insert to authenticated
  with check ((select auth.uid()) = business_user_id);

create policy shortlist_items_delete_own on public.shortlist_items
  for delete to authenticated
  using ((select auth.uid()) = business_user_id);

revoke all on table public.account_profiles from anon, authenticated;
revoke all on table public.creator_profiles from anon, authenticated;
revoke all on table public.business_profiles from anon, authenticated;
revoke all on table public.shortlist_items from anon, authenticated;

grant select, insert on table public.account_profiles to authenticated;
grant select, insert, update on table public.creator_profiles to authenticated;
grant select, insert, update on table public.business_profiles to authenticated;
grant select, insert, delete on table public.shortlist_items to authenticated;
