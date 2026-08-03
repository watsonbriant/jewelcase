-- =============================================================
-- Jewel Case — seed prototype content
-- Apply in: Supabase SQL Editor after 001_jewel_case_schema.sql
-- Re-runnable: deletes prior seed rows by slug first.
-- =============================================================

delete from reviews where slug in (
  'chromakopia','glasshouse-ep','voodoo','one-take-wonder',
  'songs-of-a-lost-world','static-bloom','neon-requiem',
  'basement-tapes-vol-3','call-me-if-you-get-lost','igor',
  'flower-boy','black-messiah','kid-a','the-miseducation-of-lauryn-hill',
  'coming-friday'
);

delete from artists where slug in (
  'tyler-the-creator','dangelo','the-cure','overmono','winter-sleeper',
  'petra-klein','the-hollow-pines','vantage-point','radiohead','lauryn-hill'
);

insert into artists (slug, name, genres) values
  ('tyler-the-creator', 'Tyler, the Creator', array['HIP-HOP','NEO-SOUL']),
  ('dangelo', 'D''Angelo', array['NEO-SOUL','R&B']),
  ('the-cure', 'The Cure', array['POST-PUNK','GOTH ROCK']),
  ('overmono', 'Overmono', array['ELECTRONIC','UK GARAGE']),
  ('winter-sleeper', 'Winter Sleeper', array['SHOEGAZE']),
  ('petra-klein', 'Petra Klein', array['POP']),
  ('the-hollow-pines', 'The Hollow Pines', array['FOLK']),
  ('vantage-point', 'Vantage Point', array['SYNTHWAVE']),
  ('radiohead', 'Radiohead', array['ALTERNATIVE']),
  ('lauryn-hill', 'Lauryn Hill', array['HIP-HOP','NEO-SOUL']);

insert into reviews (
  catalog_num, slug, artist_id, album, type, genre, release_year, rating,
  title, blurb, body, standout_tracks, skip_tracks, tracks_count, runtime, label,
  status, is_featured, is_retrospective, published_at
) values
(
  217, 'chromakopia', (select id from artists where slug = 'tyler-the-creator'),
  'Chromakopia', 'ALBUM', 'HIP-HOP', 2026, 4.0,
  'Chromakopia proves the imperial phase isn''t over',
  'Sixteen tracks, zero features wasted, and the best horn arrangement he''s touched since 2019. I have exactly one complaint and it''s track 11.',
  E'Let''s start with the obvious: the rollout promised chaos and the record delivers structure. Every synth stab lands where the mix wants it, every guest shows up to work instead of to be seen. The sequencing alone is worth the price of a physical copy. Side A closes on a cliffhanger that side B actually answers, which is more narrative discipline than most double albums manage.\n\nThe production keeps pulling tricks it never repeats. There''s a bassline on track 4 that gets pitched down a whole step mid-bar and nobody in the room panics. The horn chart on track 7 is the best thing he''s cut since 2019, and I''ll die on this hill: it''s the best 90 seconds of music released this year.\n\n> "Side A closes on a cliffhanger that side B actually answers. That''s more narrative discipline than most double albums manage."\n\nNow, track 11. Ninety seconds of ambient throat-clearing that a better editor cuts in the first pass. It''s not bad; it''s furniture. On a record this deliberate, furniture is a sin.\n\nVerdict: this is the sound of an artist who has stopped proving things and started building them. Four spins, and the one I''m withholding lives in track 11''s empty space.',
  array['Track 4|3:58','Track 7|4:41','Track 14|5:12'],
  array['Track 11|1:32'],
  16, '61:24', 'COLUMBIA',
  'PUBLISHED', true, false, '2026-08-01'
),
(
  216, 'glasshouse-ep', (select id from artists where slug = 'overmono'),
  'Glasshouse EP', 'EP', 'ELECTRONIC', 2026, 3.5,
  'A tight 18 minutes that should''ve stayed tight at 14',
  'Two closers too many.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2026-07-28'
),
(
  198, 'voodoo', (select id from artists where slug = 'dangelo'),
  'Voodoo', 'ALBUM', 'NEO-SOUL', 2000, 5.0,
  '25 years on, Voodoo still sounds like the future',
  'the pocket should be studied in labs',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, true, '2026-07-24'
),
(
  215, 'one-take-wonder', (select id from artists where slug = 'petra-klein'),
  'One-Take Wonder', 'SINGLE', 'POP', 2026, 2.0,
  'The lead single is a warning, not a promise',
  'Moments, but not many.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2026-07-22'
),
(
  203, 'songs-of-a-lost-world', (select id from artists where slug = 'the-cure'),
  'Songs of a Lost World', 'ALBUM', 'POST-PUNK', 2024, 4.5,
  'Songs of a Lost World',
  'A late-career record that earns every minute.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2026-07-10'
),
(
  210, 'static-bloom', (select id from artists where slug = 'winter-sleeper'),
  'Static Bloom', 'ALBUM', 'SHOEGAZE', 2026, 3.0,
  'Static Bloom', 'Good. A few keepers.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2026-06-15'
),
(
  208, 'neon-requiem', (select id from artists where slug = 'vantage-point'),
  'Neon Requiem', 'ALBUM', 'SYNTHWAVE', 2026, 2.5,
  'Neon Requiem', 'Fine. Background listening.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2026-05-30'
),
(
  190, 'basement-tapes-vol-3', (select id from artists where slug = 'the-hollow-pines'),
  'Basement Tapes Vol. 3', 'ALBUM', 'FOLK', 2025, 4.0,
  'Basement Tapes Vol. 3', 'Warm tape hiss and sharper songwriting.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2025-11-02'
),
(
  140, 'call-me-if-you-get-lost', (select id from artists where slug = 'tyler-the-creator'),
  'Call Me If You Get Lost', 'ALBUM', 'HIP-HOP', 2021, 4.0,
  'A victory lap that occasionally forgets which race it won',
  'A victory lap that occasionally forgets which race it won.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2025-06-12'
),
(
  102, 'igor', (select id from artists where slug = 'tyler-the-creator'),
  'Igor', 'ALBUM', 'HIP-HOP', 2019, 4.5,
  'Heartbreak as a concept album, executed with total control',
  'Heartbreak as a concept album, executed with total control.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2025-03-03'
),
(
  67, 'flower-boy', (select id from artists where slug = 'tyler-the-creator'),
  'Flower Boy', 'ALBUM', 'HIP-HOP', 2017, 3.5,
  'The pivot point, where the provocateur became a producer',
  'The pivot point, where the provocateur became a producer.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, true, '2024-11-20'
),
(
  155, 'black-messiah', (select id from artists where slug = 'dangelo'),
  'Black Messiah', 'ALBUM', 'NEO-SOUL', 2014, 4.5,
  'Black Messiah', 'Still devastating.',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, false, '2025-01-10'
),
(
  184, 'kid-a', (select id from artists where slug = 'radiohead'),
  'Kid A', 'ALBUM', 'ALTERNATIVE', 2000, 4.5,
  'still the sound of the machines winning',
  'still the sound of the machines winning',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, true, '2026-06-01'
),
(
  171, 'the-miseducation-of-lauryn-hill', (select id from artists where slug = 'lauryn-hill'),
  'The Miseducation of Lauryn Hill', 'ALBUM', 'HIP-HOP', 1998, 5.0,
  'one album was all it took',
  'one album was all it took',
  null, '{}', '{}', null, null, null,
  'PUBLISHED', false, true, '2026-05-15'
),
(
  218, 'coming-friday', (select id from artists where slug = 'tyler-the-creator'),
  'Untitled', 'ALBUM', null, 2026, 3.0,
  'Coming Friday', '',
  null, '{}', '{}', null, null, null,
  'DRAFT', false, false, null
);

-- Keep sequence ahead of seeded catalog numbers
select setval('review_catalog_seq', greatest(218, (select max(catalog_num) from reviews)));
