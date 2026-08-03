"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DiscRating } from "@/components/DiscRating";
import { Dropdown } from "@/components/Dropdown";
import { ImageSlot } from "@/components/ImageSlot";
import { browseTypeKey } from "@/lib/format";
import { getArtworkUrl } from "@/lib/storage";
import type { Review } from "@/lib/types";

const TYPE_CHIPS = ["ALL", "ALBUMS", "EPS", "SINGLES"] as const;

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="#8a8a92" strokeWidth="2" />
      <line
        x1="15.5"
        y1="15.5"
        x2="21"
        y2="21"
        stroke="#8a8a92"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrowseClient({
  initialQuery,
  reviews,
}: {
  initialQuery: string;
  reviews: Review[];
}) {
  const [type, setType] = useState<(typeof TYPE_CHIPS)[number]>("ALL");
  const [genre, setGenre] = useState("ALL");
  const [sort, setSort] = useState("new");
  const [query, setQuery] = useState(initialQuery);

  const genres = useMemo(() => {
    const set = new Set(reviews.map((r) => r.genre).filter(Boolean));
    return ["ALL", ...[...set].sort()];
  }, [reviews]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reviews.filter((r) => {
      const typeOk = type === "ALL" || browseTypeKey(r.type) === type;
      const genreOk = genre === "ALL" || r.genre === genre;
      const textOk =
        !q ||
        r.album.toLowerCase().includes(q) ||
        r.artistName.toLowerCase().includes(q) ||
        String(r.releaseYear ?? "").includes(q) ||
        r.genre.toLowerCase().includes(q);
      return typeOk && genreOk && textOk;
    });
    list = list.slice().sort((a, b) =>
      sort === "high"
        ? b.rating - a.rating
        : sort === "low"
          ? a.rating - b.rating
          : b.publishedSort - a.publishedSort,
    );
    return list;
  }, [type, genre, sort, query, reviews]);

  return (
    <>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "40px var(--gutter) 24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 900,
              fontSize: 40,
              letterSpacing: "-0.03em",
            }}
          >
            The shelf
          </h1>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <SearchIcon />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artist, album, year…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "14px 18px 14px 50px",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                color: "var(--ink)",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            {TYPE_CHIPS.map((t) => {
              const active = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 99,
                    cursor: "pointer",
                    border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "#0c0c0f" : "var(--sub)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {t}
                </button>
              );
            })}
            <span
              style={{ width: 1, background: "var(--line)", margin: "0 6px" }}
            />
            <Dropdown
              label="GENRE"
              value={genre}
              onChange={setGenre}
              options={genres.map((g) => ({ value: g, label: g }))}
            />
            <Dropdown
              label="SORT"
              value={sort}
              onChange={setSort}
              triggerText={
                ({ new: "NEWEST", high: "HIGHEST", low: "LOWEST" } as const)[
                  sort as "new" | "high" | "low"
                ]
              }
              options={[
                { value: "new", label: "NEWEST" },
                { value: "high", label: "HIGHEST RATED" },
                { value: "low", label: "LOWEST RATED" },
              ]}
            />
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
          padding: "36px var(--gutter) 56px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--meta)",
          }}
        >
          {results.length} {results.length === 1 ? "REVIEW" : "REVIEWS"}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
            gap: 26,
          }}
        >
          {results.map((r) => {
            const meta = r.isRetrospective
              ? `RETRO · ${r.genre} · ${r.releaseYear}`
              : `${r.type} · ${r.genre} · ${r.releaseYear}`;
            return (
              <Link
                key={r.slug}
                href={`/reviews/${r.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <span style={{ display: "block", aspectRatio: 1, width: "100%" }}>
                  <ImageSlot
                    radius={6}
                    label={r.album}
                    src={getArtworkUrl(r.artPath)}
                  />
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: "var(--ink)",
                    lineHeight: 1.25,
                    fontStyle: "italic",
                  }}
                >
                  {r.album}
                </span>
                <span style={{ fontSize: 14, color: "var(--sub)" }}>
                  {r.artistName}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <DiscRating
                    rating={r.rating}
                    size={15}
                    columnWidth={75}
                    scoreSize={17}
                    gap={9}
                  />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    color: "var(--meta)",
                  }}
                >
                  {meta}
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
