import Link from "next/link";
import { DiscRating } from "@/components/DiscRating";
import { ImageSlot } from "@/components/ImageSlot";
import { getArtistsWithReviews } from "@/lib/data";
import { catalogLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const list = await getArtistsWithReviews();

  return (
    <>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px var(--gutter) 28px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 900,
              fontSize: "clamp(30px, 4vw, 40px)",
              letterSpacing: "-0.03em",
            }}
          >
            Artists
          </h1>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--meta)",
            }}
          >
            {list.length} ARTISTS · A TO Z BY SHELF ORDER
          </span>
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
          gap: 24,
        }}
      >
        {list.map(({ artist, reviews, reviewCount, avgRating }) => (
          <div
            key={artist.slug}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "clamp(20px, 3vw, 28px)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <Link
              href={`/artists/${artist.slug}`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 18,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 72,
                  height: 72,
                  display: "block",
                  flexShrink: 0,
                }}
              >
                <ImageSlot shape="circle" label={artist.name} />
              </span>
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flex: "1 1 200px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 24,
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                  }}
                >
                  {artist.name}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    color: "var(--meta)",
                  }}
                >
                  {artist.genres.join(" · ")}
                </span>
              </span>
              <span style={{ display: "flex", gap: 28, marginLeft: "auto" }}>
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    alignItems: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      color: "var(--ink)",
                    }}
                  >
                    {reviewCount}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--meta)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    REVIEWS
                  </span>
                </span>
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    alignItems: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      color: "var(--ink)",
                    }}
                  >
                    {avgRating.toFixed(1)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--meta)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    AVG SCORE
                  </span>
                </span>
              </span>
            </Link>
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
                    gap: "6px 18px",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--line)",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--accent)",
                      width: 72,
                    }}
                  >
                    {catalogLabel(r.catalogNum)}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      fontStyle: "italic",
                      color: "var(--ink)",
                    }}
                  >
                    {r.album}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: "var(--meta)",
                    }}
                  >
                    {r.type} · {r.releaseYear}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginLeft: "auto",
                    }}
                  >
                    <DiscRating
                      rating={r.rating}
                      size={13}
                      columnWidth={65}
                      scoreSize={15}
                      gap={10}
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
