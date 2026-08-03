---
name: new-review
description: Draft a Jewel Case review from a music release URL (Wikipedia, MusicBrainz, Bandcamp, Discogs, Spotify, Apple Music). Extracts release metadata and the full track listing, walks the user through rating every track skip/play/repeat/favorite, converts that to a 0-5 spin rating, researches verified background, and produces a title, lead, and body draft plus a paste-ready block for the admin form. Use whenever the user supplies a link to an album, EP, or single and wants a review started.
---

# New Jewel Case review

Read `references/voice.md` before writing any prose. Do not skip it — the draft
is worthless if it doesn't sound like the site.

Work through the steps in order. Stop and wait at every step marked **WAIT**.

---

## Step 1 — Get canonical release metadata

The user's URL identifies the release. It is often *not* the best source for
track data: Spotify and Apple Music are JS-rendered and usually return no track
listing to a fetch. Treat the URL as the identifier, then confirm details
against a source that reliably has them.

Source priority for **track listings and durations**:

1. **MusicBrainz** — free, no key, exact per-track durations. Preferred.
2. **Wikipedia** — good for track names, personnel, chart and reception history;
   durations are inconsistent.
3. **Bandcamp** — embeds usable JSON-LD in the page HTML.
4. **Discogs** — good for label and pressing detail.

MusicBrainz needs a User-Agent header, so use `curl`, not a plain fetch. Rate
limit is 1 request/second.

```bash
# 1. find the release
curl -s -H 'User-Agent: JewelCase/1.0 (hello@jewelcase.reviews)' \
  'https://musicbrainz.org/ws/2/release/?query=artist:ARTIST%20AND%20release:ALBUM&fmt=json&limit=5'

# 2. pull it with tracks + label
curl -s -H 'User-Agent: JewelCase/1.0 (hello@jewelcase.reviews)' \
  'https://musicbrainz.org/ws/2/release/MBID?inc=recordings+labels+artist-credits&fmt=json'
```

Track durations arrive as `media[].tracks[].length` in **milliseconds**.

Extract:

| Field | Notes |
|---|---|
| Artist name | As credited on the release |
| Album / release title | Normal casing, not caps |
| Type | `ALBUM`, `EP`, `SINGLE`, or `OTHER` — must be one of these |
| Genre | Single string, uppercase, matching existing site genres where possible |
| Release year | Integer, original release year |
| Track count | Integer |
| Total runtime | `M:SS`, minutes may exceed 60 (e.g. `61:24`) |
| Label | Uppercase (e.g. `COLUMBIA`) |

Pick `is_retrospective = true` when the release year is well behind the current
year — a catalog record being revisited rather than a new release. Suggest it,
let the user confirm.

**WAIT.** Show the extracted table and ask the user to confirm or correct it
before continuing. Building a review on wrong metadata wastes the whole session.

---

## Step 2 — Rate every track

Print the full numbered track listing **once**, with durations:

```
 1. RING OF FIRE          3:45
 2. DANCE WITH ME         4:12
 3. HOLLOW YEARS          2:58
...
```

Song names in caps here and everywhere after. Then ask for ratings in one line.
Accept either form:

- **Positional:** `F P P S R R F ...` (in track order)
- **Numbered:** `1F 2P 3S 4R ...`
- **Default + exceptions:** `all P, 3 7=F, 5=S`

The four values, worst to best:

| Code | Meaning | Points |
|---|---|---|
| `S` | Skip | 0 |
| `P` | Play | 3 |
| `R` | Repeat | 4 |
| `F` | Favorite | 5 |

Every track needs a value. If any are missing, list only the missing track
numbers and ask again — don't reprint the whole list.

These four values are **internal only**. They never go to the database and never
appear on the site.

---

## Step 3 — Convert to a spin rating

The points scale is already 0–5, so there is **no conversion formula**. The
rating is the duration-weighted average of the track points:

```
rating = Σ(track_seconds × points) / Σ(track_seconds)
         rounded to the nearest half, ties round UP
```

Weighting by duration is deliberate. Unweighted, a 1:14 interlude counts as much
as a 4:15 single, which badly over-penalizes records with a lot of short
connective material. A favorite you love for ten minutes should outweigh a
favorite you love for two.

Anchors — these line up with the tier labels in `lib/constants.ts` by design:

| Every track is… | Rating | Tier |
|---|---|---|
| Skip | 0.0 | — |
| Play | 3.0 | "Good. A few keepers." |
| Repeat | 4.0 | "Great. Earns its replays." |
| Favorite | 5.0 | "Instant classic. Shelf royalty." |

Skip is a cliff (0 → 3) while the three positive grades are compressed into a
2-point band. That is intentional: the score is driven mostly by how much of the
record you would skip, and only fine-tuned by how much you love the rest —
which is what the About page promises the number means.

> The score means one thing: how likely I am to put it back in the player.

Report it like this. The number alone isn't enough context to judge:

```
16 tracks — 4F, 5R, 3P, 4S
Σ(duration × points) = 10,650 over 3,045 seconds
Weighted average 3.498  →  suggested rating 3.5
Tier: "Very good, with reservations."
```

Always quote the matching tier label. If the distribution is polarized — a pile
of favorites *and* a pile of skips — say so, because the average alone hides it.

**WAIT.** The rating is a *suggestion*. Take the user's override without
argument.

---

## Step 4 — Research background

Gather what actually happened around the release: recording circumstances,
lineup changes, label friction, chart or award history, sample clearances,
anything that changes how the record reads.

**Sourcing rules — these are not optional.**

- Every factual claim must trace to a page fetched in *this session*. Not to
  recollection.
- If something can't be verified, either cut it or tag it inline as `[VERIFY]`
  so the user can check or strip it before publishing.
- Never invent studio anecdotes, quotes, chart positions, or dates. A thinner
  background section is always better than a fictional one.
- Background serves the argument. If it doesn't change how the record sounds,
  leave it out.

---

## Step 5 — Standout and skip tracks

The user picks these **manually**. Do not derive them from the step 2 ratings.

Ask for both lists. Offer the favorites as a starting suggestion if it helps,
but the user decides. Either list may be empty.

Format each line as `SONG NAME · M:SS` using the durations from step 1 —
`encodeTracks` in `lib/format.ts` parses that into the `NAME|3:45` storage form.

---

## Step 6 — Write the draft

Following `references/voice.md`, produce:

- **Title** — the headline take. Sentence case, no end punctuation, carries an
  argument.
- **Lead / blurb** — one or two sentences that sharpen the title, never restate it.
- **Body** — 3–5 paragraphs separated by blank lines, containing exactly one
  `>` blockquote line pulled from the body's best sentence, closing on a verdict
  that explains the score.

Weave in the track opinions from step 2 — that's the raw material for the
judgments. Song names in caps, every time.

---

## Step 7 — Output

One paste-ready block for `/admin`, matching the form fields:

```
ARTIST          Tyler, the Creator
ALBUM/RELEASE   Chromakopia
TYPE            ALBUM
GENRE           HIP-HOP
RELEASE YEAR    2026
TRACKS          16
RUNTIME         61:24
LABEL           COLUMBIA
RATING          4.0
RETROSPECTIVE   no

REVIEW TITLE
<title>

LEAD / BLURB
<blurb>

REVIEW BODY
<body>

STANDOUT TRACKS
RING OF FIRE · 3:45

SKIP TRACKS
HOLLOW YEARS · 2:58

TRACK RATINGS
{"scale":{"S":0,"P":3,"R":4,"F":5},"weighted":"duration","weightedAverage":3.498,
 "tracks":[{"n":1,"name":"RING OF FIRE","time":"3:45","rating":"F"}]}
```

Never output a `slug` or `catalog_num`. Both are assigned by the database —
`catalog_num` from `review_catalog_seq`, and `slug` is a generated column
(`'jc-' || lpad(catalog_num, 4, '0')`, e.g. `jc-0001`). Postgres rejects any
explicit value for `slug`.

New reviews are saved as `DRAFT` with `published_at` null. The user publishes
from the admin.

`is_featured` has a unique partial index — only one review can be featured at a
time. Setting it unsets the current one.

The `TRACK RATINGS` block goes in the admin field of the same name and is stored
in `reviews.track_ratings` (jsonb). It records the scale and weighting alongside
the grades, so if the points scale ever changes again, every published review
can be recomputed from stored data instead of by re-listening. Always emit it —
it is the only place the S/P/R/F grades survive.

Genres are handled by the database: a trigger keeps `artists.genres` in sync
with the distinct genres of that artist's PUBLISHED reviews. Never set
`artists.genres` by hand, and expect it to stay empty until the review is
published.

---

## Field reference

`reviews` columns this skill writes, from `supabase/001_jewel_case_schema.sql`
and `003_jc_number_slugs.sql`:

| Column | Type | Source |
|---|---|---|
| `artist_id` | uuid | looked up or created in `artists` |
| `album` | text | step 1 |
| `type` | enum | `ALBUM` \| `EP` \| `SINGLE` \| `OTHER` |
| `genre` | text | step 1, uppercase |
| `release_year` | int | step 1 |
| `rating` | numeric(2,1) | step 3, must be a clean half-step 0–5 |
| `title` | text | step 6 |
| `blurb` | text | step 6 |
| `body` | text | step 6, blank-line paragraphs + one `>` quote |
| `standout_tracks` | text[] | step 5, `NAME\|M:SS` |
| `skip_tracks` | text[] | step 5, `NAME\|M:SS` |
| `tracks_count` | int | step 1 |
| `runtime` | text | step 1, `M:SS` |
| `label` | text | step 1, uppercase |
| `status` | enum | always `DRAFT` from this skill |
| `is_retrospective` | bool | suggested in step 1 |
| `track_ratings` | jsonb | steps 2 and 3, internal grades plus the scale used |
| `catalog_num`, `slug` | — | **database-assigned, never set** |
| `artists.genres` | text[] | **trigger-maintained, never set** |

Artists are matched by name first; only create a new `artists` row if none
exists. Artist slugs stay name-based (`slugify(name)`) — the JC-number scheme
applies to reviews only.
