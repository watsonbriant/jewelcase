export type ReviewType = "ALBUM" | "EP" | "SINGLE" | "OTHER";
export type ReviewStatus = "DRAFT" | "PUBLISHED";

export type Artist = {
  id: string;
  slug: string;
  name: string;
  genres: string[];
  photoPath: string | null;
};

export type TrackLine = { name: string; time: string };

export type Review = {
  id: string;
  slug: string;
  catalogNum: number;
  artistId: string;
  artistSlug: string;
  artistName: string;
  album: string;
  type: ReviewType;
  genre: string;
  releaseYear: number | null;
  rating: number;
  title: string;
  blurb: string;
  body: string[];
  quote?: string;
  standoutTracks: TrackLine[];
  skipTracks: TrackLine[];
  tracksCount: number | null;
  runtime: string | null;
  label: string | null;
  artPath: string | null;
  status: ReviewStatus;
  isFeatured: boolean;
  isRetrospective: boolean;
  publishedAt: string; // display e.g. AUG 01 2026
  publishedSort: number; // YYYYMMDD
  tags: string[];
};

export type DbArtist = {
  id: string;
  slug: string;
  name: string;
  genres: string[] | null;
  photo_path: string | null;
};

export type DbReview = {
  id: string;
  catalog_num: number;
  slug: string;
  artist_id: string;
  album: string;
  type: ReviewType;
  genre: string | null;
  release_year: number | null;
  rating: number | string;
  title: string;
  blurb: string | null;
  body: string | null;
  standout_tracks: string[] | null;
  skip_tracks: string[] | null;
  tracks_count: number | null;
  runtime: string | null;
  label: string | null;
  art_path: string | null;
  status: ReviewStatus;
  is_featured: boolean;
  is_retrospective: boolean;
  published_at: string | null;
};
