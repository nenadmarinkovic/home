import type { Metadata } from "next";

import { getExportedKeys } from "@/lib/articles-db";
import { getArticles, getDraftArticles } from "../writing/articles";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const published = getArticles();
  const drafts = getDraftArticles();
  const exported = getExportedKeys();
  return (
    <AdminClient
      published={published}
      drafts={drafts}
      exported={exported}
    />
  );
}
