export const ratingTiers = [
  { rating: 5, label: "Instant classic. Shelf royalty." },
  { rating: 4.5, label: "Nearly flawless. One hair out of place." },
  { rating: 4, label: "Great. Earns its replays." },
  { rating: 3.5, label: "Very good, with reservations." },
  { rating: 3, label: "Good. A few keepers." },
  { rating: 2.5, label: "Fine. Background listening." },
  { rating: 2, label: "Rough. Moments, but not many." },
  { rating: 1.5, label: "Bad, and not in a fun way." },
  { rating: 1, label: "Barely worth the shelf space." },
  { rating: 0.5, label: "A warning to others." },
];

/**
 * Tier label for a score. Ratings are constrained to clean half steps, so this
 * is an exact match in practice; the <= scan only matters for 0.0, which has no
 * tier of its own and falls through to the lowest one.
 */
export function ratingTierLabel(rating: number): string {
  const tier =
    ratingTiers.find((t) => t.rating <= rating) ??
    ratingTiers[ratingTiers.length - 1];
  return tier.label;
}
