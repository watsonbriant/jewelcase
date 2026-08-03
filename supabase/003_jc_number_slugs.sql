-- =============================================================
-- Jewel Case — 003: JC-number slugs + prototype cleanup
-- Apply in: Supabase Dashboard → SQL Editor → New query → Run
--
-- ORDER MATTERS. Step 1 must run before step 2: once slugs are
-- generated they read jc-0217, and the prototype slug names below
-- will no longer match anything.
--
-- Pair this with the app change that stops sending `slug` on save
-- (app/admin/page.tsx). Run this migration first, or the next save
-- will fail on a NOT NULL slug with no default.
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 1. Drop the prototype seed content.
--    Scoped to the exact slugs 002 created, so any real review
--    you have written through the admin is left untouched.
-- -------------------------------------------------------------
delete from reviews where slug in (
  'chromakopia','glasshouse-ep','voodoo','one-take-wonder',
  'songs-of-a-lost-world','static-bloom','neon-requiem',
  'basement-tapes-vol-3','call-me-if-you-get-lost','igor',
  'flower-boy','black-messiah','kid-a','the-miseducation-of-lauryn-hill',
  'coming-friday'
);

-- Only remove seeded artists that no longer have any reviews attached.
delete from artists a
where a.slug in (
  'tyler-the-creator','dangelo','the-cure','overmono','winter-sleeper',
  'petra-klein','the-hollow-pines','vantage-point','radiohead','lauryn-hill'
)
and not exists (select 1 from reviews r where r.artist_id = a.id);

-- -------------------------------------------------------------
-- 2. slug becomes derived from catalog_num: 1 -> 'jc-0001'.
--    Postgres has no ALTER COLUMN ... ADD GENERATED for stored
--    columns, so this is a drop + re-add. Existing slug values are
--    discarded by design; catalog_num is the source of truth now.
--    Uniqueness and NOT NULL come free (catalog_num is both).
-- -------------------------------------------------------------
alter table reviews drop column slug;

alter table reviews
  add column slug text
  generated always as ('jc-' || lpad(catalog_num::text, 4, '0')) stored;

-- Recreate the unique index dropped along with the old column.
create unique index reviews_slug_key on reviews (slug);

-- -------------------------------------------------------------
-- 3. Restart the catalog at 1. The sequence originally started at
--    218 to "continue from the prototype," but that prototype was
--    placeholder content, so the first real review is JC-0001.
--
--    The third argument `false` means "not yet called," so the next
--    nextval() returns this value exactly rather than one past it.
--    Falling back to max+1 keeps this safe if any real review
--    survived the step 1 cleanup.
-- -------------------------------------------------------------
select setval(
  'review_catalog_seq',
  coalesce((select max(catalog_num) from reviews), 0) + 1,
  false
);

commit;

-- Sanity check (run separately after commit):
--   select catalog_num, slug, album from reviews order by catalog_num desc limit 5;
