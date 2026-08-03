import { createClient } from "@/lib/supabase/server";
import { mapArtist, mapReview } from "./mappers";
import type { Artist, DbArtist, DbReview, Review } from "./types";

type ReviewWithArtist = DbReview & {
  artists: DbArtist | DbArtist[] | null;
};

function artistFromJoin(join: ReviewWithArtist["artists"]): DbArtist | null {
  if (!join) return null;
  return Array.isArray(join) ? (join[0] ?? null) : join;
}

function toReview(row: ReviewWithArtist): Review | null {
  const artist = artistFromJoin(row.artists);
  if (!artist) return null;
  return mapReview(row, {
    id: artist.id,
    slug: artist.slug,
    name: artist.name,
  });
}

export async function getPublishedReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, artists(*)")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ReviewWithArtist[])
    .map(toReview)
    .filter((r): r is Review => Boolean(r));
}

export async function getReviewBySlug(slug: string): Promise<Review | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, artists(*)")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toReview(data as ReviewWithArtist);
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapArtist(data as DbArtist);
}

export async function getReviewsForArtist(
  artistId: string,
): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, artists(*)")
    .eq("artist_id", artistId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ReviewWithArtist[])
    .map(toReview)
    .filter((r): r is Review => Boolean(r));
}

export async function getArtistsWithReviews() {
  const reviews = await getPublishedReviews();
  const byArtist = new Map<
    string,
    { artist: Artist; reviews: Review[]; reviewCount: number; avgRating: number }
  >();

  for (const r of reviews) {
    const existing = byArtist.get(r.artistId);
    if (!existing) {
      byArtist.set(r.artistId, {
        artist: {
          id: r.artistId,
          slug: r.artistSlug,
          name: r.artistName,
          genres: r.genre ? [r.genre] : [],
          photoPath: null,
        },
        reviews: [r],
        reviewCount: 1,
        avgRating: r.rating,
      });
    } else {
      existing.reviews.push(r);
      existing.reviewCount += 1;
      existing.avgRating =
        existing.reviews.reduce((s, x) => s + x.rating, 0) /
        existing.reviews.length;
    }
  }

  // Prefer genres from artists table
  const supabase = await createClient();
  const ids = [...byArtist.keys()];
  if (ids.length) {
    const { data } = await supabase.from("artists").select("*").in("id", ids);
    for (const row of (data ?? []) as DbArtist[]) {
      const entry = byArtist.get(row.id);
      if (entry) entry.artist = mapArtist(row);
    }
  }

  return [...byArtist.values()]
    .map((e) => ({
      ...e,
      avgRating: Math.round(e.avgRating * 10) / 10,
    }))
    .sort((a, b) => a.artist.name.localeCompare(b.artist.name));
}

export async function getHomeData() {
  const all = await getPublishedReviews();
  const featured = all.find((r) => r.isFeatured) ?? all[0] ?? null;
  const latest = all.filter((r) => r.slug !== featured?.slug).slice(0, 3);
  const archive = all.filter((r) => r.isRetrospective).slice(0, 3);
  return { featured, latest, archive };
}

export async function getRelatedReviews(
  review: Review,
  limit = 2,
): Promise<Review[]> {
  return (await getReviewsForArtist(review.artistId))
    .filter((r) => r.slug !== review.slug)
    .slice(0, limit);
}

export async function getAdjacentReviews(catalogNum: number) {
  const all = (await getPublishedReviews()).sort(
    (a, b) => a.catalogNum - b.catalogNum,
  );
  const idx = all.findIndex((r) => r.catalogNum === catalogNum);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  };
}
