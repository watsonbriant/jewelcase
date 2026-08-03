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
| `S` | Skip | 1 |
| `P` | Play | 2 |
| `R` | Repeat | 3 |
| `F` | Favorite | 4 |

Every track needs a value. If any are missing, list only the missing track
numbers and ask again — don't reprint the whole list.

These four values are **internal only**. They never go to the database and never
appear on the site.

---

## Step 3 — Convert to a spin rating

Average the points across all tracks (1.0–4.0), then map to the site's 0–5
scale:

```
raw    = (average - 1) / 3 * 5
rating = round(raw * 2) / 2      # nearest half, ties round UP
```

Anchors:

| Avg (1–4) | Raw | Rating |
|---|---|---|
| 1.0 | 0.00 | 0.0 |
| 2.0 | 1.67 | 1.5 |
| 2.5 | 2.50 | 2.5 |
| 3.0 | 3.33 | 3.5 |
| 3.4 | 4.00 | 4.0 |
| 3.6 | 4.33 | 4.5 |
| 4.0 | 5.00 | 5.0 |

Report it like this — the number alone isn't enough context to judge it:

```
12 tracks — 4F, 5R, 2P, 1S
Average 3.17 / 4  →  raw 3.61  →  suggested rating 3.5
Tier: "Very good, with reservations."
```

The tier labels live in `lib/constants.ts`. Always quote the matching one.

A straight mean flattens texture: 3 favorites and 3 skips average the same as 6
plays, but they are not the same record. If the distribution is polarized, say
so when you report the number.

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

Two artifacts.

**1. Paste-ready block** for `/admin`, matching the form fields:

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
```

Never output a `slug` or `catalog_num`. Both are assigned by the database —
`catalog_num` from `review_catalog_seq`, and `slug` is a generated column
(`'jc-' || lpad(catalog_num, 4, '0')`, e.g. `jc-0001`). Postgres rejects any
explicit value for `slug`.

New reviews are saved as `DRAFT` with `published_at` null. The user publishes
from the admin.

`is_featured` has a unique partial index — only one review can be featured at a
time. Setting it unsets the current one.

**2. Track ratings sidecar** at `content/reviews/<artist-slug>-<album-slug>.json`,
so the internal ratings survive for later use:

```json
{
  "artist": "Tyler, the Creator",
  "album": "Chromakopia",
  "catalogNum": null,
  "ratedAt": "2026-08-03",
  "average": 3.17,
  "rating": 3.5,
  "tracks": [
    { "n": 1, "name": "RING OF FIRE", "time": "3:45", "rating": "F" }
  ]
}
```

Fill in `catalogNum` once the review is saved and the number is known.

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
| `catalog_num`, `slug` | — | **database-assigned, never set** |

Artists are matched by name first; only create a new `artists` row if none
exists. Artist slugs stay name-based (`slugify(name)`) — the JC-number scheme
applies to reviews only.
