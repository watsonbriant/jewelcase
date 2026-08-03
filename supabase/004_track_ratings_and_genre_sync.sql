-- =============================================================
-- Jewel Case — 004: per-track ratings + artist genre sync
-- Apply in: Supabase Dashboard → SQL Editor → New query → Run
--
-- 1. reviews.track_ratings  — internal S/P/R/F grades, previously
--    kept in a JSON file outside the database.
-- 2. artists.genres         — now derived from that artist's
--    PUBLISHED reviews instead of being set by hand.
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 1. Per-track ratings.
--    Additive column, so nothing existing depends on it. The
--    object is self-describing: it records which points scale and
--    weighting produced the rating, so a future scale change can
--    recompute every published review without re-listening.
--
--    Shape:
--    {
--      "scale":  {"S":0,"P":3,"R":4,"F":5},
--      "weighted": "duration",
--      "weightedAverage": 3.498,
--      "tracks": [{"n":1,"name":"THE 1975","time":"1:19","rating":"S"}]
--    }
-- -------------------------------------------------------------
alter table reviews
  add column track_ratings jsonb not null default '{}'::jsonb;

alter table reviews
  add constraint reviews_track_ratings_is_object
  check (jsonb_typeof(track_ratings) = 'object');

comment on column reviews.track_ratings is
  'Internal per-track S/P/R/F grades plus the scale and weighting used. Never rendered on the site.';

-- -------------------------------------------------------------
-- 2. Keep artists.genres in sync with that artist''s reviews.
--
--    PUBLISHED only, matching the artist_stats view. Drafts stay
--    invisible, which also means an artist whose only review is a
--    draft keeps an empty genre list until it goes live.
--
--    SECURITY INVOKER (the default) is deliberate: writing reviews
--    already requires an authenticated session under RLS, so the
--    cascading update to artists always passes the
--    "owner writes artists" policy.
-- -------------------------------------------------------------
create or replace function sync_artist_genres()
returns trigger
language plpgsql
as $$
declare
  ids    uuid[];
  target uuid;
begin
  -- An update can move a review between artists, so both the old
  -- and the new artist may need recomputing.
  ids := array_remove(array[
    case when tg_op <> 'INSERT' then old.artist_id end,
    case when tg_op <> 'DELETE' then new.artist_id end
  ], null);

  foreach target in array ids loop
    update artists a
    set genres = coalesce((
      select array_agg(distinct r.genre order by r.genre)
      from reviews r
      where r.artist_id = target
        and r.status = 'PUBLISHED'
        and r.genre is not null
        and r.genre <> ''
    ), '{}')
    where a.id = target;
  end loop;

  return null;
end;
$$;

create trigger reviews_sync_artist_genres_ins_del
after insert or delete on reviews
for each row
execute function sync_artist_genres();

-- Guarded so the admin's bulk "unset is_featured" update, and any
-- other edit that can't change the genre list, does no extra work.
create trigger reviews_sync_artist_genres_upd
after update on reviews
for each row
when (
  old.artist_id is distinct from new.artist_id
  or old.genre is distinct from new.genre
  or old.status is distinct from new.status
)
execute function sync_artist_genres();

-- -------------------------------------------------------------
-- 3. Backfill every existing artist.
-- -------------------------------------------------------------
update artists a
set genres = coalesce((
  select array_agg(distinct r.genre order by r.genre)
  from reviews r
  where r.artist_id = a.id
    and r.status = 'PUBLISHED'
    and r.genre is not null
    and r.genre <> ''
), '{}');

commit;

-- Sanity check (run separately after commit):
--   select a.name, a.genres from artists a order by a.name;
