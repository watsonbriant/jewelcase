import Link from "next/link";
import type { CSSProperties } from "react";
import { DiscRating } from "@/components/DiscRating";
import { ImageSlot } from "@/components/ImageSlot";
import { getHomeData } from "@/lib/data";
import { catalogLabel, typeLabel } from "@/lib/format";
import { getArtworkUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

const artistPill: CSSProperties = {
  padding: "3px 10px",
  borderRadius: 99,
  border: "1px solid var(--line)",
  color: "var(--sub)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  whiteSpace: "nowrap",
};

export default async function HomePage() {
  const { featured, latest, archive } = await getHomeData();

  if (!featured) {
    return (
      <main
        style={{
          padding: "clamp(48px, 8vw, 80px) var(--gutter)",
          maxWidth: 720,
          margin: "0 auto",
          color: "var(--sub)",
        }}
      >
        <h1
          style={{
            margin: "0 0 12px",
            fontWeight: 900,
            fontSize: 36,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
          }}
        >
          The shelf is empty
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Publish your first review from <Link href="/admin">/admin</Link>.
        </p>
      </main>
    );
  }

  const latestMeta = (r: (typeof latest)[0]) => {
    const dateParts = r.publishedAt.split(" ");
    return `${r.isRetrospective ? "RETROSPECTIVE" : typeLabel(r.type)} · ${dateParts[0]} ${dateParts[1]}`;
  };

  return (
    <>
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: "clamp(28px, 4vw, 56px)",
          padding: "clamp(32px, 6vw, 56px) var(--gutter)",
          borderBottom: "1px solid var(--line)",
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <Link
          href={`/reviews/${featured.slug}`}
          style={{ display: "block", aspectRatio: 1, width: "100%" }}
        >
          <ImageSlot
            radius={8}
            label="Featured album art"
            src={getArtworkUrl(featured.artPath)}
          />
        </Link>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              letterSpacing: "0.18em",
              color: "var(--accent)",
            }}
          >
            {catalogLabel(featured.catalogNum)} · {typeLabel(featured.type)} ·{" "}
            {featured.publishedAt}
          </div>
          <Link
            href={`/reviews/${featured.slug}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <h1
              style={{
                margin: 0,
                fontWeight: 900,
                fontSize: "clamp(36px, 4.2vw, 60px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                textWrap: "pretty",
              }}
            >
              {featured.title}
            </h1>
          </Link>
          <DiscRating
            rating={featured.rating}
            size={20}
            scoreSize={18}
            gap={16}
          />
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--sub)",
              maxWidth: 560,
              textWrap: "pretty",
            }}
          >
            {featured.blurb}
          </p>
          <div>
            <Link
              href={`/reviews/${featured.slug}`}
              style={{ fontSize: 16, fontWeight: 700 }}
            >
              Read the review →
            </Link>
          </div>
        </div>
      </header>

      {latest.length > 0 && (
      <main
        style={{
          padding: "clamp(24px, 5vw, 48px)",
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "-0.01em",
            }}
          >
            Latest
          </h2>
          <Link
            href="/browse"
            style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
          >
            ALL REVIEWS →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
            gap: 28,
          }}
        >
          {latest.map((r) => (
            <Link
              key={r.slug}
              href={`/reviews/${r.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div style={{ aspectRatio: 1, width: "100%" }}>
                <ImageSlot
                  radius={8}
                  label="Album art"
                  src={getArtworkUrl(r.artPath)}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  color: "var(--meta)",
                }}
              >
                {latestMeta(r)}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 21,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                  textWrap: "pretty",
                }}
              >
                {r.title}
              </div>
              <span style={{ ...artistPill, alignSelf: "flex-start" }}>
                {r.artistName}
              </span>
              <DiscRating rating={r.rating} size={15} scoreSize={15} gap={10} />
            </Link>
          ))}
        </div>
      </main>
      )}

      {archive.length > 0 && (
      <section
        style={{
          padding: "0 var(--gutter) 56px",
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "-0.01em",
            }}
          >
            From the archive
          </h2>
          <Link
            href="/browse"
            style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
          >
            RETROSPECTIVES →
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid var(--line)",
          }}
        >
          {archive.map((r) => (
            <Link
              key={r.slug}
              href={`/reviews/${r.slug}`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 24px",
                alignItems: "center",
                padding: "18px 0",
                borderBottom: "1px solid var(--line)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--accent)",
                }}
              >
                {catalogLabel(r.catalogNum)}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "6px 12px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 17, color: "var(--ink)" }}
                >
                  {r.album}
                </span>
                <span style={artistPill}>{r.artistName}</span>
                <span
                  style={{ fontWeight: 400, fontSize: 17, color: "var(--meta)" }}
                >
                  {r.blurb}
                </span>
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginLeft: "auto",
                }}
              >
                <DiscRating
                  rating={r.rating}
                  size={13}
                  columnWidth={65}
                  scoreSize={13}
                  scoreColor="var(--meta)"
                  scoreFamily="mono"
                  gap={10}
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
      )}
    </>
  );
}
