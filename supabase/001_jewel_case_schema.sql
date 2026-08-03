-- =============================================================
-- Jewel Case — initial schema + RLS + storage
-- Apply in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run once on an empty project (zero tables).
-- =============================================================

-- Enums
create type review_type as enum ('ALBUM', 'EP', 'SINGLE', 'OTHER');
create type review_status as enum ('DRAFT', 'PUBLISHED');

-- Artists
create table artists (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  genres      text[] not null default '{}',
  photo_path  text,
  created_at  timestamptz not null default now()
);

-- Reviews
create table reviews (
  id               uuid primary key default gen_random_uuid(),
  catalog_num      integer not null unique,
  slug             text not null unique,
  artist_id        uuid not null references artists(id) on delete restrict,
  album            text not null,
  type             review_type not null default 'ALBUM',
  genre            text,
  release_year     integer,
  rating           numeric(2,1) not null
                   check (rating >= 0 and rating <= 5 and (rating * 2) = floor(rating * 2)),
  title            text not null,
  blurb            text,
  body             text,
  standout_tracks  text[] not null default '{}',
  skip_tracks      text[] not null default '{}',
  tracks_count     integer,
  runtime          text,
  label            text,
  art_path         text,
  status           review_status not null default 'DRAFT',
  is_featured      boolean not null default false,
  is_retrospective boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index reviews_status_published_idx on reviews (status, published_at desc);
create index reviews_artist_idx on reviews (artist_id);
create index reviews_genre_idx on reviews (genre);
create index reviews_year_idx on reviews (release_year);
create index reviews_rating_idx on reviews (rating);

-- Auto catalog numbers (continues from prototype; next insert gets 218)
create sequence review_catalog_seq start 218;
alter table reviews alter column catalog_num set default nextval('review_catalog_seq');
alter sequence review_catalog_seq owned by reviews.catalog_num;

-- updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_updated_at
  before update on reviews
  for each row
  execute function set_updated_at();

-- Enforce at most one featured review (optional but useful)
create unique index reviews_one_featured_idx
  on reviews (is_featured)
  where is_featured = true;

-- Artist stats view (published only)
create view artist_stats
with (security_invoker = true)
as
select
  artist_id,
  count(*) filter (where status = 'PUBLISHED') as review_count,
  round(avg(rating) filter (where status = 'PUBLISHED'), 1) as avg_rating
from reviews
group by artist_id;

-- =============================================================
-- Row Level Security
-- Public: read all artists; read PUBLISHED reviews
-- Authenticated (owner): full read/write on both tables
-- =============================================================
alter table artists enable row level security;
alter table reviews enable row level security;

create policy "public read artists"
  on artists
  for select
  using (true);

create policy "public read published reviews"
  on reviews
  for select
  using (status = 'PUBLISHED' or auth.role() = 'authenticated');

create policy "owner writes artists"
  on artists
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "owner writes reviews"
  on reviews
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- Storage: public-read artwork bucket
-- Paths: reviews/<review-id>.jpg , artists/<artist-id>.jpg
-- =============================================================
insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', true)
on conflict (id) do update set public = true;

create policy "public read artwork"
  on storage.objects
  for select
  using (bucket_id = 'artwork');

create policy "owner uploads artwork"
  on storage.objects
  for insert
  with check (bucket_id = 'artwork' and auth.role() = 'authenticated');

create policy "owner updates artwork"
  on storage.objects
  for update
  using (bucket_id = 'artwork' and auth.role() = 'authenticated');

create policy "owner deletes artwork"
  on storage.objects
  for delete
  using (bucket_id = 'artwork' and auth.role() = 'authenticated');
