import { DiscRating } from "@/components/DiscRating";
import { ImageSlot } from "@/components/ImageSlot";
import { ratingTiers } from "@/lib/constants";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "clamp(40px, 8vw, 72px) var(--gutter)",
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
              letterSpacing: "0.18em",
              color: "var(--accent)",
            }}
          >
            ABOUT
          </div>
          <h1
            style={{
              margin: 0,
              fontWeight: 900,
              fontSize: "clamp(40px, 5vw, 64px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              textWrap: "pretty",
            }}
          >
            Music reviews from someone who alphabetized their CD tower.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 19,
              lineHeight: 1.7,
              color: "var(--sub)",
              maxWidth: 680,
              textWrap: "pretty",
            }}
          >
            Jewel Case is a one-person music review site. Albums, EPs, and
            singles, from new releases to the records that raised me. Strong
            opinions, receipts to back them, no press-release paraphrasing.
          </p>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1000,
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
        <div
          style={{
            flex: "2 1 440px",
            display: "flex",
            flexDirection: "column",
            gap: 40,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "-0.01em",
              }}
            >
              Why &quot;Jewel Case&quot;?
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--sub)",
              }}
            >
              Born in &apos;94. My music education happened in jewel cases and
              cassette decks, with liner notes read cover to cover and discs held
              by the edges like they were sacred. This site reviews music from
              every era with that same care, whether it dropped in 1971 or last
              Friday.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "-0.01em",
              }}
            >
              How the ratings work
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--sub)",
              }}
            >
              Every release gets 0 to 5{" "}
              <strong style={{ color: "var(--ink)" }}>spins</strong>, half
              spins allowed. A spin is a disc. The score means one thing: how
              likely I am to put it back in the player.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "22px 24px",
              }}
            >
              {ratingTiers.map((t) => (
                <div
                  key={t.rating}
                  style={{ display: "flex", alignItems: "center", gap: 16 }}
                >
                  <DiscRating
                    rating={t.rating}
                    size={18}
                    columnWidth={90}
                    showScore={false}
                  />
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 16,
                      letterSpacing: "-0.02em",
                      width: 34,
                    }}
                  >
                    {t.rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--sub)" }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "-0.01em",
              }}
            >
              How this works
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(
                [
                  [
                    "INDEPENDENT",
                    "No labels, no ads, no sponsored scores. Nobody buys a spin.",
                  ],
                  ["WEEKLY", "One or two new reviews a week, every week."],
                  [
                    "ON THE RECORD",
                    "Old reviews stay published as written. New thoughts get new reviews.",
                  ],
                ] as const
              ).map(([label, body]) => (
                <div
                  key={label}
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      letterSpacing: "0.14em",
                      color: "var(--accent)",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--sub)",
                      lineHeight: 1.6,
                    }}
                  >
                    {body}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside
          style={{
            flex: "1 1 260px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ width: "100%", aspectRatio: 1 }}>
            <ImageSlot radius={12} label="Your photo" />
          </div>
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
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
              SAY HELLO
            </span>
            <a
              href="mailto:hello@jewelcase.reviews"
              style={{ fontSize: 15, fontWeight: 700 }}
            >
              hello@jewelcase.reviews
            </a>
            <span
              style={{ fontSize: 14, color: "var(--sub)", lineHeight: 1.6 }}
            >
              Questions, corrections, or a record you think I should hear.
            </span>
          </div>
        </aside>
      </main>
    </>
  );
}
