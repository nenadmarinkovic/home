import type { Metadata } from "next";

import { ReviewClient } from "./review-client";

export const metadata: Metadata = {
  title: "Review · Vocabulary · Admin",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return <ReviewClient initialStats={{ due: 0, newCards: 0, total: 0 }} />;
}
