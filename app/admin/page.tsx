import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

import { getArticles, getDraftArticles } from "../writing/articles";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function buildExportedSet(slugs: { slug: string; language: string }[]): string[] {
  const root = process.cwd();
  return slugs
    .filter((a) =>
      fs.existsSync(
        path.join(root, "content", a.language, `${a.slug}.md`),
      ),
    )
    .map((a) => `${a.language}:${a.slug}`);
}

export default function AdminPage() {
  const published = getArticles();
  const drafts = getDraftArticles();
  const exported = buildExportedSet(published);
  return (
    <AdminClient
      published={published}
      drafts={drafts}
      exported={exported}
    />
  );
}
