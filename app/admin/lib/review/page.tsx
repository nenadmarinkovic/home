import type { Metadata } from "next";

import { ReviewClient } from "./review-client";

export const metadata: Metadata = {
  title: "Review · Lib · Admin",
  robots: { index: false, follow: false },
};

// Statically prerendered shell with no server data: the deck is loaded and
// scheduled entirely client-side from IndexedDB, so the page works offline and
// caches deterministically in the service worker. Access is still gated by the
// proxy at request time; the SW only ever serves a copy already fetched while
// authenticated.
export default function ReviewPage() {
  return <ReviewClient initialStats={{ due: 0, newCards: 0, total: 0 }} />;
}
