import type { Metadata } from "next";

import { getDueStats } from "@/lib/lib-db";
import { ReviewClient } from "./review-client";

export const metadata: Metadata = {
  title: "Review · Lib · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  // The deck is loaded and scheduled client-side from IndexedDB so reviews work
  // offline; these counts are just the first paint before the client reconciles.
  const stats = getDueStats();
  return <ReviewClient initialStats={stats} />;
}
