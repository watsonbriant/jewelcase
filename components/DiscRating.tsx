import { formatScore } from "@/lib/format";

/** Disc mask from design prototypes (width/height attrs, not viewBox). */
export const DISC_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath fill='white' fill-rule='evenodd' d='M60 8a52 52 0 1 0 .01 0zM60 27a33 33 0 1 0 .01 0zM60 33a27 27 0 1 0 .01 0zM60 47a13 13 0 1 0 .01 0z'/%3E%3C/svg%3E\")";

type DiscRatingProps = {
  rating: number;
  size: number;
  /** Fixed column width in px (e.g. 65, 75, 90, 110). When set, discs left-align inside. */
  columnWidth?: number;
  scoreSize?: number;
  scoreColor?: string;
  scoreFamily?: "sans" | "mono";
  showScore?: boolean;
  gap?: number;
};

export function DiscRating({
  rating,
  size,
  columnWidth,
  scoreSize,
  scoreColor = "var(--ink)",
  scoreFamily = "sans",
  showScore = true,
  gap = 10,
}: DiscRatingProps) {
  const track = columnWidth ?? size * 5;
  const fill = rating * size;

  const discs = (
    <span
      style={{
        display: "block",
        height: size,
        width: fill,
        backgroundImage: "var(--disc-gradient)",
        backgroundSize: `${track}px 100%`,
        backgroundRepeat: "no-repeat",
        WebkitMaskImage: DISC_MASK,
        WebkitMaskSize: `${size}px ${size}px`,
        WebkitMaskRepeat: "repeat-x",
        maskImage: DISC_MASK,
        maskSize: `${size}px ${size}px`,
        maskRepeat: "repeat-x",
      }}
    />
  );

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
      }}
    >
      {columnWidth != null ? (
        <span style={{ display: "inline-block", width: columnWidth }}>
          {discs}
        </span>
      ) : (
        <span style={{ display: "inline-block" }}>{discs}</span>
      )}
      {showScore && (
        <span
          style={{
            fontWeight: 900,
            fontSize: scoreSize ?? Math.max(14, size),
            letterSpacing: "-0.02em",
            color: scoreColor,
            fontFamily:
              scoreFamily === "mono" ? "var(--font-mono)" : "var(--font-sans)",
          }}
        >
          {formatScore(rating)}
        </span>
      )}
    </span>
  );
}
