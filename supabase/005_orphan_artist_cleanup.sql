-- =============================================================
-- Jewel Case — 005: auto-remove artists with no reviews
-- Apply in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Adds no columns and alters no tables. It only introduces a
-- function plus two triggers that delete an artist once its last
-- review is gone.
-- =============================================================

begin;

-- -------------------------------------------------------------
-- Delete the artist a review just left, if nothing else points at
-- it. Only ever looks at OLD.artist_id: on INSERT there is no
-- artist to orphan, and on UPDATE only the artist the review moved
-- away from can have become empty.
--
-- reviews.artist_id is ON DELETE RESTRICT, so the guard is not
-- decorative: without the NOT EXISTS check this would raise rather
-- than silently cascade.
-- -------------------------------------------------------------
create or replace function delete_orphan_artist()
returns trigger
language plpgsql
as $$
begin
  delete from artists a
  where a.id = old.artist_id
    and not exists (
      select 1 from reviews r where r.artist_id = old.artist_id
    );
  return null;
end;
$$;

create trigger reviews_delete_orphan_artist
after delete on reviews
for each row
execute function delete_orphan_artist();

create trigger reviews_delete_orphan_artist_upd
after update of artist_id on reviews
for each row
when (old.artist_id is distinct from new.artist_id)
execute function delete_orphan_artist();

-- Fires before reviews_sync_artist_genres_* (triggers run in name
-- order, and d < s). If the artist is deleted here, the genre sync
-- then updates zero rows, which is harmless. The reverse order is
-- equally safe, so this does not need pinning.

-- -------------------------------------------------------------
-- One-time sweep of artists that are already orphaned.
-- -------------------------------------------------------------
delete from artists a
where not exists (select 1 from reviews r where r.artist_id = a.id);

commit;

-- Sanity check (run separately after commit):
--   select a.name, count(r.id) from artists a
--   left join reviews r on r.artist_id = a.id
--   group by a.name order by 2, 1;
