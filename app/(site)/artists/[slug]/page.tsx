import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscRating } from "@/components/DiscRating";
import { ImageSlot } from "@/components/ImageSlot";
import { getArtistBySlug, getReviewsForArtist } from "@/lib/data";
import { catalogLabel } from "@/lib/format";
import { getArtworkUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  return { title: artist?.name ?? "Artist not found" };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const reviews = await getReviewsForArtist(artist.id);
  if (reviews.length === 0) notFound();

  const avgRating =
    Math.round(
      (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
    ) / 10;

  return (
    <>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(32px, 6vw, 56px) var(--gutter)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(24px, 4vw, 44px)",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: 180, height: 180, flexShrink: 0 }}>
            <ImageSlot
              shape="circle"
              label={artist.name}
              src={getArtworkUrl(artist.photoPath)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minWidth: 0,
              flex: 1,
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
              ARTIST
            </div>
            <h1
              style={{
                margin: 0,
                fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 56px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {artist.name}
            </h1>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              {artist.genres.map((g) => (
                <span
                  key={g}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    border: "1px solid var(--line)",
                    color: "var(--sub)",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 36, flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: 36,
                  letterSpacing: "-0.02em",
                }}
              >
                {reviews.length}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--meta)",
                  letterSpacing: "0.14em",
                }}
              >
                REVIEWS
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: 36,
                  letterSpacing: "-0.02em",
                }}
              >
                {avgRating.toFixed(1)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--meta)",
                  letterSpacing: "0.14em",
                }}
              >
                AVG SCORE
              </span>
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(24px, 5vw, 48px)",
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
            Every review
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--meta)",
            }}
          >
            NEWEST FIRST
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid var(--line)",
          }}
        >
          {reviews.map((r) => (
            <Link
              key={r.slug}
              href={`/reviews/${r.slug}`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px 28px",
                alignItems: "center",
                padding: "22px 0",
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
              <span style={{ width: 96, height: 96, display: "block" }}>
                <ImageSlot
                  radius={6}
                  label={r.album}
                  src={getArtworkUrl(r.artPath)}
                />
              </span>
              <span
                style={{
                  flex: "1 1 260px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    color: "var(--meta)",
                  }}
                >
                  {r.isRetrospective ? "RETROSPECTIVE" : r.type} ·{" "}
                  {r.publishedAt}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 22,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                    fontStyle: "italic",
                  }}
                >
                  {r.album}
                </span>
                <span
                  style={{ fontSize: 15, color: "var(--sub)", lineHeight: 1.5 }}
                >
                  {r.blurb}
                </span>
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginLeft: "auto",
                }}
              >
                <DiscRating
                  rating={r.rating}
                  size={15}
                  columnWidth={75}
                  scoreSize={16}
                  gap={12}
                />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
