"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DiscRating } from "@/components/DiscRating";
import { Dropdown } from "@/components/Dropdown";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ImageSlot } from "@/components/ImageSlot";
import {
  catalogLabel,
  encodeTracks,
  formatPublishedDisplay,
  formatScore,
  slugify,
} from "@/lib/format";
import { getArtworkUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { ReviewStatus, ReviewType } from "@/lib/types";

type AdminRow = {
  id: string;
  catalog_num: number;
  slug: string;
  album: string;
  artist_id: string;
  artist_name: string;
  type: ReviewType;
  genre: string;
  release_year: string;
  title: string;
  blurb: string;
  body: string;
  standouts: string;
  skip: string;
  rating: number;
  status: ReviewStatus;
  published_at: string | null;
  is_featured: boolean;
  is_retrospective: boolean;
  tracks_count: string;
  runtime: string;
  label: string;
  art_path: string | null;
  track_ratings: string;
};

type AdminArtist = {
  id: string;
  slug: string;
  name: string;
  photo_path: string | null;
  review_count: number;
};

type Draft = {
  album: string;
  artist: string;
  type: ReviewType;
  genre: string;
  year: string;
  title: string;
  blurb: string;
  body: string;
  standouts: string;
  skip: string;
  rating: number;
  status: ReviewStatus;
  is_featured: boolean;
  is_retrospective: boolean;
  tracks_count: string;
  runtime: string;
  label: string;
  art_path: string | null;
  track_ratings: string;
  catalog_num?: number;
  slug?: string;
  published_at?: string | null;
};

function emptyDraft(): Draft {
  return {
    album: "",
    artist: "",
    type: "ALBUM",
    genre: "",
    year: "",
    title: "",
    blurb: "",
    body: "",
    standouts: "",
    skip: "",
    rating: 3.5,
    status: "DRAFT",
    is_featured: false,
    is_retrospective: false,
    tracks_count: "",
    runtime: "",
    label: "",
    art_path: null,
    track_ratings: "",
  };
}

async function uploadArtwork(
  supabase: ReturnType<typeof createClient>,
  reviewId: string,
  file: File,
) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `reviews/${reviewId}.${ext}`;
  const { error } = await supabase.storage.from("artwork").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

// Artist photos share the `artwork` bucket. Its policies are bucket-wide
// rather than path-scoped, so no new bucket or policy is needed.
async function uploadArtistPhoto(
  supabase: ReturnType<typeof createClient>,
  artistId: string,
  file: File,
) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `artists/${artistId}.${ext}`;
  const { error } = await supabase.storage.from("artwork").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

function tracksToText(rows: string[] | null) {
  return (rows ?? [])
    .map((row) => {
      const [name, time] = row.split("|");
      return time ? `${name} · ${time}` : name;
    })
    .join("\n");
}

async function ensureArtist(
  supabase: ReturnType<typeof createClient>,
  name: string,
) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Artist is required");
  const slug = slugify(trimmed);
  const { data: existing } = await supabase
    .from("artists")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("artists")
    .insert({ slug, name: trimmed, genres: [] })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"list" | "edit" | "artists">("list");
  const [reviews, setReviews] = useState<AdminRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [pendingArt, setPendingArt] = useState<File | null>(null);
  const [artPreview, setArtPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [artists, setArtists] = useState<AdminArtist[]>([]);
  const [artistDrafts, setArtistDrafts] = useState<
    Record<string, { name: string; slug: string }>
  >({});
  const [busyArtist, setBusyArtist] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error: qError } = await supabase
      .from("reviews")
      .select("*, artists(name)")
      .order("catalog_num", { ascending: false });
    if (qError) throw qError;

    const rows: AdminRow[] = (data ?? []).map((r) => {
      const artistJoin = r.artists as { name: string } | { name: string }[] | null;
      const artistName = Array.isArray(artistJoin)
        ? artistJoin[0]?.name
        : artistJoin?.name;
      return {
        id: r.id,
        catalog_num: r.catalog_num,
        slug: r.slug,
        album: r.album,
        artist_id: r.artist_id,
        artist_name: artistName ?? "",
        type: r.type,
        genre: r.genre ?? "",
        release_year: r.release_year != null ? String(r.release_year) : "",
        title: r.title,
        blurb: r.blurb ?? "",
        body: r.body ?? "",
        standouts: tracksToText(r.standout_tracks),
        skip: tracksToText(r.skip_tracks),
        rating: Number(r.rating),
        status: r.status,
        published_at: r.published_at,
        is_featured: r.is_featured,
        is_retrospective: r.is_retrospective,
        tracks_count: r.tracks_count != null ? String(r.tracks_count) : "",
        runtime: r.runtime ?? "",
        label: r.label ?? "",
        art_path: r.art_path,
        track_ratings:
          r.track_ratings && Object.keys(r.track_ratings).length
            ? JSON.stringify(r.track_ratings, null, 2)
            : "",
      };
    });
    setReviews(rows);
  }, []);

  const loadArtists = useCallback(async () => {
    const supabase = createClient();
    // The embedded count covers every review, not just published ones,
    // because ANY review blocks deletion under the ON DELETE RESTRICT FK.
    const { data, error: aError } = await supabase
      .from("artists")
      .select("*, reviews(count)")
      .order("name");
    if (aError) throw aError;

    const rows: AdminArtist[] = (data ?? []).map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      photo_path: a.photo_path,
      review_count: Array.isArray(a.reviews) ? (a.reviews[0]?.count ?? 0) : 0,
    }));
    setArtists(rows);
    setArtistDrafts(
      Object.fromEntries(
        rows.map((r) => [r.id, { name: r.name, slug: r.slug }]),
      ),
    );
  }, []);

  useEffect(() => {
    Promise.all([load(), loadArtists()])
      .then(() => setReady(true))
      .catch((e: Error) => {
        setError(e.message);
        setReady(true);
      });
  }, [load, loadArtists]);

  const setField =
    (name: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        name === "rating"
          ? Number(e.target.value)
          : name === "is_featured" || name === "is_retrospective"
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
      setDraft((d) => ({ ...d, [name]: value }));
    };

  const onPickArt = (file: File | null) => {
    setPendingArt(file);
    if (artPreview?.startsWith("blob:")) URL.revokeObjectURL(artPreview);
    setArtPreview(file ? URL.createObjectURL(file) : getArtworkUrl(draft.art_path));
  };

  const save = async (status: ReviewStatus) => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const artistId = await ensureArtist(supabase, draft.artist);

      // track_ratings is jsonb with a check constraint requiring an object,
      // so reject anything else here rather than letting Postgres do it.
      let trackRatings: Record<string, unknown> = {};
      if (draft.track_ratings.trim()) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(draft.track_ratings);
        } catch {
          throw new Error("TRACK RATINGS is not valid JSON");
        }
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          throw new Error("TRACK RATINGS must be a JSON object");
        }
        trackRatings = parsed as Record<string, unknown>;
      }

      // slug is a generated column (jc-0001, derived from catalog_num).
      // Postgres rejects any explicit value, so it must stay out of the payload.
      const payload = {
        album: draft.album.trim(),
        artist_id: artistId,
        type: draft.type,
        genre: draft.genre.trim() || null,
        release_year: draft.year ? Number(draft.year) : null,
        rating: Number(draft.rating),
        title: draft.title.trim() || draft.album.trim() || "Untitled",
        blurb: draft.blurb,
        body: draft.body,
        standout_tracks: encodeTracks(draft.standouts),
        skip_tracks: encodeTracks(draft.skip),
        tracks_count: draft.tracks_count ? Number(draft.tracks_count) : null,
        runtime: draft.runtime.trim() || null,
        label: draft.label.trim() || null,
        art_path: draft.art_path,
        status,
        is_featured: draft.is_featured,
        is_retrospective: draft.is_retrospective,
        track_ratings: trackRatings,
        published_at:
          status === "PUBLISHED"
            ? draft.published_at ?? new Date().toISOString()
            : null,
      };

      if (draft.is_featured) {
        await supabase
          .from("reviews")
          .update({ is_featured: false })
          .eq("is_featured", true);
      }

      let reviewId = editingId;
      if (editingId) {
        const { error: uError } = await supabase
          .from("reviews")
          .update(payload)
          .eq("id", editingId);
        if (uError) throw uError;
      } else {
        const { data, error: iError } = await supabase
          .from("reviews")
          .insert(payload)
          .select("id")
          .single();
        if (iError) throw iError;
        reviewId = data.id as string;
      }

      if (pendingArt && reviewId) {
        setUploading(true);
        const path = await uploadArtwork(supabase, reviewId, pendingArt);
        const { error: artError } = await supabase
          .from("reviews")
          .update({ art_path: path })
          .eq("id", reviewId);
        if (artError) throw artError;
      }

      await load();
      setView("list");
      setEditingId(null);
      setDraft(emptyDraft());
      setPendingArt(null);
      if (artPreview?.startsWith("blob:")) URL.revokeObjectURL(artPreview);
      setArtPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const saveArtist = async (id: string) => {
    const d = artistDrafts[id];
    if (!d) return;
    const name = d.name.trim();
    if (!name) {
      setError("Artist name is required");
      return;
    }
    // Falling back to the name keeps the slug from ever going empty.
    const slug = slugify(d.slug.trim()) || slugify(name);

    setBusyArtist(id);
    const supabase = createClient();
    const { error: uError } = await supabase
      .from("artists")
      .update({ name, slug })
      .eq("id", id);
    setBusyArtist(null);
    if (uError) {
      setError(uError.message);
      return;
    }
    setError(null);
    await Promise.all([load(), loadArtists()]);
  };

  const onArtistPhoto = async (artist: AdminArtist, file: File) => {
    setBusyArtist(artist.id);
    try {
      const supabase = createClient();
      const path = await uploadArtistPhoto(supabase, artist.id, file);
      const { error: uError } = await supabase
        .from("artists")
        .update({ photo_path: path })
        .eq("id", artist.id);
      if (uError) throw uError;
      setError(null);
      await loadArtists();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyArtist(null);
    }
  };

  const removeArtist = async (artist: AdminArtist) => {
    if (artist.review_count > 0) return;
    if (!confirm(`Delete "${artist.name}"? This can't be undone.`)) return;

    setBusyArtist(artist.id);
    const supabase = createClient();
    // Drop the photo first; a deleted row leaves no way to find the object.
    if (artist.photo_path) {
      await supabase.storage.from("artwork").remove([artist.photo_path]);
    }
    const { error: dError } = await supabase
      .from("artists")
      .delete()
      .eq("id", artist.id);
    setBusyArtist(null);
    if (dError) {
      setError(dError.message);
      return;
    }
    setError(null);
    await loadArtists();
  };

  const remove = async (id: string, album: string) => {
    if (!confirm(`Delete "${album}"? This can't be undone.`)) return;
    const supabase = createClient();
    const { error: dError } = await supabase.from("reviews").delete().eq("id", id);
    if (dError) {
      setError(dError.message);
      return;
    }
    await load();
    setView("list");
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  if (!ready) return <div className="jc-page" />;

  const published = reviews.filter((r) => r.status === "PUBLISHED").length;
  const editing = editingId != null;

  return (
    <div className="jc-page">
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px 24px",
          padding: "16px var(--gutter)",
          borderBottom: "1px solid var(--line)",
          position: "sticky",
          top: 0,
          background: "var(--bg)",
          zIndex: 10,
        }}
      >
        <Logo admin href="/" />
        <div style={{ display: "flex", gap: 8 }}>
          {(["list", "artists"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                background: view === v ? "var(--panel)" : "none",
                border: "1px solid",
                borderColor: view === v ? "var(--line)" : "transparent",
                borderRadius: 99,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                color: view === v ? "var(--ink)" : "var(--meta)",
                padding: "6px 14px",
              }}
            >
              {v === "list" ? "REVIEWS" : "ARTISTS"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
          <button
            type="button"
            onClick={signOut}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--meta)",
              padding: 0,
            }}
          >
            SIGN OUT
          </button>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--sub)",
            }}
          >
            VIEW SITE →
          </Link>
        </div>
      </nav>

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
        {error && (
          <p style={{ margin: 0, color: "var(--danger)", fontSize: 14 }}>{error}</p>
        )}

        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h1
                  style={{
                    margin: 0,
                    fontWeight: 900,
                    fontSize: "clamp(30px, 4vw, 40px)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Reviews
                </h1>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--meta)",
                  }}
                >
                  {reviews.length} ON THE SHELF · {published} PUBLISHED
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setView("edit");
                  setEditingId(null);
                  setDraft(emptyDraft());
                  setPendingArt(null);
                  setArtPreview(null);
                }}
                style={{
                  padding: "12px 22px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: "var(--accent)",
                  color: "#0c0c0f",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                + New review
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderTop: "1px solid var(--line)",
              }}
            >
              {reviews.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px 20px",
                    alignItems: "center",
                    padding: "18px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--accent)",
                      width: 80,
                    }}
                  >
                    {catalogLabel(r.catalog_num)}
                  </span>
                  <span
                    style={{
                      flex: "1 1 240px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 17,
                        fontStyle: "italic",
                      }}
                    >
                      {r.album}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--sub)" }}>
                      {r.artist_name} ·{" "}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {r.type} · {formatPublishedDisplay(r.published_at) || "—"}
                      </span>
                    </span>
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 16,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatScore(r.rating)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      padding: "4px 10px",
                      borderRadius: 99,
                      background:
                        r.status === "PUBLISHED"
                          ? "rgba(157,255,176,0.12)"
                          : "var(--chip)",
                      color: r.status === "PUBLISHED" ? "#9dffb0" : "var(--sub)",
                    }}
                  >
                    {r.status}
                  </span>
                  <span style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setView("edit");
                        setEditingId(r.id);
                        setPendingArt(null);
                        setArtPreview(getArtworkUrl(r.art_path));
                        setDraft({
                          album: r.album,
                          artist: r.artist_name,
                          type: r.type,
                          genre: r.genre,
                          year: r.release_year,
                          title: r.title,
                          blurb: r.blurb,
                          body: r.body,
                          standouts: r.standouts,
                          skip: r.skip,
                          rating: r.rating,
                          status: r.status,
                          is_featured: r.is_featured,
                          is_retrospective: r.is_retrospective,
                          tracks_count: r.tracks_count,
                          runtime: r.runtime,
                          label: r.label,
                          art_path: r.art_path,
                          track_ratings: r.track_ratings,
                          catalog_num: r.catalog_num,
                          slug: r.slug,
                          published_at: r.published_at,
                        });
                      }}
                      style={outlineBtn}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.id, r.album)}
                      style={{ ...outlineBtn, color: "var(--danger)" }}
                    >
                      DELETE
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "artists" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h1
                style={{
                  margin: 0,
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: "-0.02em",
                }}
              >
                Artists
              </h1>
              <span style={labelText}>
                {artists.length} TOTAL · REMOVED AUTOMATICALLY WHEN THEIR LAST
                REVIEW IS DELETED
              </span>
            </div>

            {artists.length === 0 && (
              <p style={{ margin: 0, color: "var(--sub)", fontSize: 15 }}>
                No artists yet. They are created automatically when you save a
                review.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {artists.map((a) => {
                const d = artistDrafts[a.id] ?? { name: a.name, slug: a.slug };
                const busy = busyArtist === a.id;
                const dirty = d.name !== a.name || d.slug !== a.slug;
                const locked = a.review_count > 0;
                return (
                  <div
                    key={a.id}
                    style={{
                      ...panelStyle,
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 18,
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    <span
                      style={{
                        width: 72,
                        height: 72,
                        flexShrink: 0,
                        display: "block",
                      }}
                    >
                      <ImageSlot
                        shape="circle"
                        label={a.name}
                        src={getArtworkUrl(a.photo_path)}
                      />
                    </span>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        flex: "1 1 240px",
                        minWidth: 0,
                      }}
                    >
                      <input
                        value={d.name}
                        onChange={(e) =>
                          setArtistDrafts((prev) => ({
                            ...prev,
                            [a.id]: { ...d, name: e.target.value },
                          }))
                        }
                        style={fieldStyle}
                      />
                      <input
                        value={d.slug}
                        onChange={(e) =>
                          setArtistDrafts((prev) => ({
                            ...prev,
                            [a.id]: { ...d, slug: e.target.value },
                          }))
                        }
                        style={monoArea}
                      />
                    </div>

                    <span style={{ ...labelText, whiteSpace: "nowrap" }}>
                      {a.review_count}{" "}
                      {a.review_count === 1 ? "REVIEW" : "REVIEWS"}
                    </span>

                    <span
                      style={{
                        display: "flex",
                        gap: 10,
                        marginLeft: "auto",
                        flexWrap: "wrap",
                      }}
                    >
                      <label
                        style={{
                          ...outlineBtn,
                          cursor: busy ? "default" : "pointer",
                        }}
                      >
                        PHOTO
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={busy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) onArtistPhoto(a, file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={busy || !dirty}
                        onClick={() => saveArtist(a.id)}
                        style={{
                          ...outlineBtn,
                          opacity: dirty ? 1 : 0.4,
                          cursor: dirty && !busy ? "pointer" : "default",
                        }}
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        disabled={busy || locked}
                        title={
                          locked
                            ? "Delete this artist's reviews first"
                            : undefined
                        }
                        onClick={() => removeArtist(a)}
                        style={{
                          ...outlineBtn,
                          color: locked ? "var(--meta)" : "var(--danger)",
                          opacity: locked ? 0.4 : 1,
                          cursor: locked || busy ? "default" : "pointer",
                        }}
                      >
                        DELETE
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "edit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setView("list");
                    setEditingId(null);
                    setDraft(emptyDraft());
                    setPendingArt(null);
                    if (artPreview?.startsWith("blob:")) URL.revokeObjectURL(artPreview);
                    setArtPreview(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--meta)",
                  }}
                >
                  ← ALL REVIEWS
                </button>
                <h1
                  style={{
                    margin: 0,
                    fontWeight: 900,
                    fontSize: "clamp(28px, 4vw, 36px)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {editing ? "Edit review" : "New review"}
                </h1>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--accent)",
                }}
              >
                {editing && draft.catalog_num != null
                  ? catalogLabel(draft.catalog_num)
                  : "NEW · CATALOG NUMBER ASSIGNED ON SAVE"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 28,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  flex: "2 1 440px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                    gap: 18,
                  }}
                >
                  <label style={labelStyle}>
                    <span style={labelText}>ALBUM / RELEASE</span>
                    <input value={draft.album} onChange={setField("album")} style={fieldStyle} />
                  </label>
                  <label style={labelStyle}>
                    <span style={labelText}>ARTIST</span>
                    <input value={draft.artist} onChange={setField("artist")} style={fieldStyle} />
                  </label>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
                    gap: 18,
                  }}
                >
                  <div style={labelStyle}>
                    <span style={labelText}>TYPE</span>
                    <Dropdown
                      variant="field"
                      value={draft.type}
                      onChange={(type) =>
                        setDraft((d) => ({ ...d, type: type as ReviewType }))
                      }
                      options={["ALBUM", "EP", "SINGLE", "OTHER"].map((t) => ({
                        value: t,
                        label: t,
                      }))}
                    />
                  </div>
                  <label style={labelStyle}>
                    <span style={labelText}>GENRE</span>
                    <input
                      value={draft.genre}
                      onChange={setField("genre")}
                      placeholder="HIP-HOP"
                      style={{ ...fieldStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                    />
                  </label>
                  <label style={labelStyle}>
                    <span style={labelText}>RELEASE YEAR</span>
                    <input
                      value={draft.year}
                      onChange={setField("year")}
                      placeholder="2026"
                      style={{ ...fieldStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                    />
                  </label>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
                    gap: 18,
                  }}
                >
                  <label style={labelStyle}>
                    <span style={labelText}>TRACKS</span>
                    <input
                      value={draft.tracks_count}
                      onChange={setField("tracks_count")}
                      placeholder="16"
                      inputMode="numeric"
                      style={{ ...fieldStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                    />
                  </label>
                  <label style={labelStyle}>
                    <span style={labelText}>RUNTIME</span>
                    <input
                      value={draft.runtime}
                      onChange={setField("runtime")}
                      placeholder="61:24"
                      style={{ ...fieldStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                    />
                  </label>
                  <label style={labelStyle}>
                    <span style={labelText}>LABEL</span>
                    <input
                      value={draft.label}
                      onChange={setField("label")}
                      placeholder="COLUMBIA"
                      style={{ ...fieldStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                    />
                  </label>
                </div>
                <label style={labelStyle}>
                  <span style={labelText}>REVIEW TITLE</span>
                  <input
                    value={draft.title}
                    onChange={setField("title")}
                    placeholder="The headline take"
                    style={{ ...fieldStyle, fontWeight: 700, fontSize: 16 }}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelText}>LEAD / BLURB</span>
                  <textarea
                    value={draft.blurb}
                    onChange={setField("blurb")}
                    rows={2}
                    style={{ ...fieldStyle, resize: "vertical" }}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelText}>REVIEW BODY</span>
                  <textarea
                    value={draft.body}
                    onChange={setField("body")}
                    rows={12}
                    placeholder="Paragraphs separated by a blank line. Blockquotes start with >"
                    style={{
                      ...fieldStyle,
                      padding: 14,
                      lineHeight: 1.7,
                      resize: "vertical",
                    }}
                  />
                </label>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={draft.is_featured}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, is_featured: e.target.checked }))
                      }
                    />
                    Featured on home
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={draft.is_retrospective}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          is_retrospective: e.target.checked,
                        }))
                      }
                    />
                    Retrospective / archive
                  </label>
                </div>
              </div>

              <div
                style={{
                  flex: "1 1 280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  position: "sticky",
                  top: 92,
                  alignSelf: "flex-start",
                }}
              >
                <div style={panelStyle}>
                  <span style={labelText}>ALBUM ART</span>
                  <div style={{ width: "100%", aspectRatio: 1 }}>
                    <ImageSlot
                      radius={8}
                      label="Album art"
                      src={artPreview}
                    />
                  </div>
                  <label
                    style={{
                      ...secondaryBtn,
                      textAlign: "center",
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    {uploading ? "Uploading…" : "Choose image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: "none" }}
                      onChange={(e) => onPickArt(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {(draft.art_path || pendingArt) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingArt(null);
                        setArtPreview(null);
                        setDraft((d) => ({ ...d, art_path: null }));
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--danger)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                      }}
                    >
                      REMOVE ART
                    </button>
                  )}
                  <span style={{ fontSize: 12, color: "var(--meta)", lineHeight: 1.5 }}>
                    Square image recommended. Saved to Storage on publish/save.
                  </span>
                </div>
                <div style={panelStyle}>
                  <span style={labelText}>RATING</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <DiscRating
                      rating={Number(draft.rating) || 0}
                      size={22}
                      columnWidth={110}
                      scoreSize={22}
                      gap={14}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={draft.rating}
                    onChange={setField("rating")}
                    style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                </div>
                <div style={panelStyle}>
                  <span style={labelText}>STANDOUT TRACKS · ONE PER LINE</span>
                  <textarea
                    value={draft.standouts}
                    onChange={setField("standouts")}
                    rows={3}
                    placeholder="Track 4 · 3:58"
                    style={monoArea}
                  />
                  <span style={labelText}>SKIPS · ONE PER LINE</span>
                  <textarea
                    value={draft.skip}
                    onChange={setField("skip")}
                    rows={2}
                    style={monoArea}
                  />
                  <span style={labelText}>TRACK RATINGS · JSON</span>
                  <textarea
                    value={draft.track_ratings}
                    onChange={setField("track_ratings")}
                    rows={4}
                    placeholder='{"scale":{"S":0,"P":3,"R":4,"F":5},"tracks":[…]}'
                    style={monoArea}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    type="button"
                    disabled={saving || uploading}
                    onClick={() => save("PUBLISHED")}
                    style={primaryBtn}
                  >
                    {editing && draft.status === "PUBLISHED" ? "Update" : "Publish"}
                  </button>
                  <button
                    type="button"
                    disabled={saving || uploading}
                    onClick={() => save("DRAFT")}
                    style={secondaryBtn}
                  >
                    Save draft
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => remove(editingId!, draft.album)}
                      style={{ ...secondaryBtn, color: "var(--danger)" }}
                    >
                      Delete review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "11px 14px",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  color: "var(--ink)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
};

const labelText: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.14em",
  color: "var(--meta)",
};

const outlineBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
};

const panelStyle: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 22,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const monoArea: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "11px 14px",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  color: "var(--ink)",
  outline: "none",
  resize: "vertical",
};

const primaryBtn: React.CSSProperties = {
  padding: 13,
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "var(--accent)",
  color: "#0c0c0f",
  fontWeight: 800,
  fontSize: 15,
};

const secondaryBtn: React.CSSProperties = {
  padding: 13,
  borderRadius: 10,
  border: "1px solid var(--line)",
  cursor: "pointer",
  background: "transparent",
  color: "var(--ink)",
  fontWeight: 700,
  fontSize: 15,
};
