import {
  decodeTracks,
  formatPublishedDisplay,
  parseBody,
  publishedSortKey,
} from "./format";
import type { Artist, DbArtist, DbReview, Review } from "./types";

export function mapArtist(row: DbArtist): Artist {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    genres: row.genres ?? [],
    photoPath: row.photo_path,
  };
}

export function mapReview(
  row: DbReview,
  artist: Pick<Artist, "slug" | "name" | "id">,
): Review {
  const { paragraphs, quote } = parseBody(row.body);
  const genre = row.genre ?? "";
  const tags = [genre, row.release_year ? `${row.release_year} RELEASES` : ""]
    .filter(Boolean)
    .map((t) => t.toUpperCase());

  return {
    id: row.id,
    slug: row.slug,
    catalogNum: row.catalog_num,
    artistId: artist.id,
    artistSlug: artist.slug,
    artistName: artist.name,
    album: row.album,
    type: row.type,
    genre,
    releaseYear: row.release_year,
    rating: Number(row.rating),
    title: row.title,
    blurb: row.blurb ?? "",
    body: paragraphs,
    quote,
    standoutTracks: decodeTracks(row.standout_tracks),
    skipTracks: decodeTracks(row.skip_tracks),
    tracksCount: row.tracks_count,
    runtime: row.runtime,
    label: row.label,
    artPath: row.art_path,
    status: row.status,
    isFeatured: row.is_featured,
    isRetrospective: row.is_retrospective,
    publishedAt: formatPublishedDisplay(row.published_at),
    publishedSort: publishedSortKey(row.published_at),
    tags,
  };
}
