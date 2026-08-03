import { getPublishedReviews } from "@/lib/data";
import { BrowseClient } from "./BrowseClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Browse" };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const reviews = await getPublishedReviews();
  return <BrowseClient initialQuery={q ?? ""} reviews={reviews} />;
}
