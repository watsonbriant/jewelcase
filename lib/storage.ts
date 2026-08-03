import { getSupabaseUrl } from "@/lib/supabase/env";

/** Public URL for a path in the `artwork` bucket. */
export function getArtworkUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSupabaseUrl().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/artwork/${path.replace(/^\//, "")}`;
}
