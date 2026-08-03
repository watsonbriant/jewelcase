import type { ReviewType } from "./types";

export function formatCatalog(num: number): string {
  return `JC·${String(num).padStart(4, "0")}`;
}

export function catalogLabel(num: number): string {
  return formatCatalog(num);
}

export function formatScore(rating: number): string {
  return Number(rating).toFixed(1);
}

export function typeLabel(type: ReviewType) {
  if (type === "ALBUM") return "ALBUM REVIEW";
  if (type === "EP") return "EP REVIEW";
  if (type === "SINGLE") return "SINGLE REVIEW";
  return "REVIEW";
}

export function browseTypeKey(type: ReviewType) {
  if (type === "ALBUM") return "ALBUMS";
  if (type === "EP") return "EPS";
  if (type === "SINGLE") return "SINGLES";
  return "OTHER";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPublishedDisplay(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase()
    .replace(",", "");
}

export function publishedSortKey(iso: string | null) {
  if (!iso) return 0;
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return Number(`${y}${m}${day}`);
}

/** Encode track lines as "Name|time" for text[] storage. */
export function encodeTracks(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)(?:\s+[·|]\s*|\s+)(\d+:\d{2})$/);
      if (m) return `${m[1].trim()}|${m[2]}`;
      return line;
    });
}

export function decodeTracks(rows: string[] | null) {
  return (rows ?? []).map((row) => {
    const [name, time = ""] = row.split("|");
    return { name, time };
  });
}

/** Split markdown-ish body into paragraphs + optional blockquote. */
export function parseBody(body: string | null): {
  paragraphs: string[];
  quote?: string;
} {
  if (!body?.trim()) return { paragraphs: [] };
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  let quote: string | undefined;
  const paragraphs: string[] = [];
  for (const block of blocks) {
    if (block.startsWith(">")) {
      quote = block.replace(/^>\s?/, "").trim();
    } else {
      paragraphs.push(block);
    }
  }
  return { paragraphs, quote };
}

export function serializeBody(paragraphs: string[], quote?: string) {
  const parts = [...paragraphs];
  if (quote) {
    const insertAt = Math.min(2, parts.length);
    parts.splice(insertAt, 0, `> ${quote}`);
  }
  return parts.join("\n\n");
}
