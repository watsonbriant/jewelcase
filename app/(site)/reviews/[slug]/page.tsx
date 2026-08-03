import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { DiscRating } from "@/components/DiscRating";
import { ImageSlot } from "@/components/ImageSlot";
import {
  getAdjacentReviews,
  getRelatedReviews,
  getReviewBySlug,
} from "@/lib/data";
import { catalogLabel, typeLabel } from "@/lib/format";
import { getArtworkUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  if (!review) notFound();

  const { prev, next } = await getAdjacentReviews(review.catalogNum);
  const related = await getRelatedReviews(review);

  return (
    <>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(32px, 6vw, 56px) var(--gutter)",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(28px, 4vw, 56px)",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ aspectRatio: 1, width: "100%" }}>
              <ImageSlot
                radius={8}
                label="Album art"
                src={getArtworkUrl(review.artPath)}
              />
            </div>
            {(review.tracksCount || review.label) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--meta)",
                }}
              >
                <span>
                  {review.tracksCount
                    ? `${review.tracksCount} TRACKS · ${review.runtime}`
                    : ""}
                </span>
                <span>{review.label}</span>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
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
              {catalogLabel(review.catalogNum)} · {typeLabel(review.type)} ·{" "}
              {review.publishedAt}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(34px, 5vw, 52px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                <em>{review.album}</em>
              </div>
              <Link
                href={`/artists/${review.artistSlug}`}
                style={{
                  fontWeight: 700,
                  fontSize: 24,
                  color: "var(--sub)",
                  letterSpacing: "-0.01em",
                }}
              >
                {review.artistName}
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              {[review.genre, review.releaseYear, review.type]
                .filter(Boolean)
                .map((chip) => (
                  <span
                    key={String(chip)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: "1px solid var(--line)",
                      color: "var(--sub)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 24px",
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                width: "fit-content",
              }}
            >
              <DiscRating
                rating={review.rating}
                size={24}
                scoreSize={28}
                gap={18}
              />
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(32px, 6vw, 56px) var(--gutter)",
          boxSizing: "border-box",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "flex-start",
        }}
      >
        <article
          style={{
            flex: "2 1 460px",
            fontSize: 18,
            lineHeight: 1.75,
            color: "#d8d8de",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            minWidth: 0,
          }}
        >
          {review.blurb && (
            <p
              style={{
                margin: 0,
                fontSize: 22,
                lineHeight: 1.6,
                color: "var(--ink)",
                fontWeight: 500,
              }}
            >
              {review.blurb}
            </p>
          )}
          {review.body.map((p, i) => (
            <Fragment key={i}>
              <p style={{ margin: 0 }}>{p}</p>
              {review.quote && i === 1 && (
                <blockquote
                  style={{
                    margin: 0,
                    padding: "24px 28px",
                    borderLeft: "3px solid var(--accent)",
                    background: "var(--panel)",
                    borderRadius: "0 12px 12px 0",
                    fontSize: 20,
                    fontStyle: "italic",
                    color: "var(--ink)",
                  }}
                >
                  {review.quote}
                </blockquote>
              )}
            </Fragment>
          ))}
          {review.quote && review.body.length <= 1 && (
            <blockquote
              style={{
                margin: 0,
                padding: "24px 28px",
                borderLeft: "3px solid var(--accent)",
                background: "var(--panel)",
                borderRadius: "0 12px 12px 0",
                fontSize: 20,
                fontStyle: "italic",
                color: "var(--ink)",
              }}
            >
              {review.quote}
            </blockquote>
          )}
          {review.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                paddingTop: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--meta)",
                }}
              >
                FILED UNDER:
              </span>
              {review.tags.map((t) => (
                <Link
                  key={t}
                  href={`/browse?q=${encodeURIComponent(t)}`}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside
          style={{
            flex: "1 1 280px",
            display: "flex",
            flexDirection: "column",
            gap: 32,
            position: "sticky",
            top: 96,
            alignSelf: "flex-start",
          }}
        >
          {review.standoutTracks.length > 0 && (
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  color: "var(--meta)",
                }}
              >
                STANDOUT TRACKS
              </div>
              {review.standoutTracks.map((t) => (
                <div
                  key={t.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{t.name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--meta)",
                    }}
                  >
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          )}
          {review.skipTracks.length > 0 && (
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  color: "var(--meta)",
                }}
              >
                SKIP
              </div>
              {review.skipTracks.map((t) => (
                <div
                  key={t.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{t.name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--meta)",
                    }}
                  >
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          )}
          {related.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  color: "var(--meta)",
                }}
              >
                MORE FROM THIS ARTIST
              </div>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/reviews/${r.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr",
                    gap: 14,
                    alignItems: "center",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ width: 64, height: 64, display: "block" }}>
                    <ImageSlot
                      radius={6}
                      label={r.album}
                      src={getArtworkUrl(r.artPath)}
                    />
                  </span>
                  <span
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--ink)",
                      }}
                    >
                      {r.album}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--meta)",
                        }}
                      >
                        {catalogLabel(r.catalogNum)}
                      </span>
                      <DiscRating
                        rating={r.rating}
                        size={12}
                        showScore={false}
                        gap={0}
                      />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </main>

      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px var(--gutter)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 24,
            boxSizing: "border-box",
          }}
        >
          {prev ? (
            <Link
              href={`/reviews/${prev.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--meta)",
                }}
              >
                ← PREVIOUS · {catalogLabel(prev.catalogNum)}
              </span>
              <span
                style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}
              >
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/reviews/${next.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                textAlign: "right",
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--meta)",
                }}
              >
                NEXT · {catalogLabel(next.catalogNum)} →
              </span>
              <span
                style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}
              >
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
