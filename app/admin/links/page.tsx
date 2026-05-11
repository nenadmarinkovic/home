import type { Metadata } from "next";

import { getApiToken } from "@/lib/api-token";
import {
  listLinks,
  listTagsWithCounts,
  type LinkWithTags,
} from "@/lib/links-db";

import { LinksAdminClient } from "./links-client";

export const metadata: Metadata = {
  title: "Links · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function toClient(rows: LinkWithTags[]) {
  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    type: r.type,
    note: r.note,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    tags: r.tags.map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
  }));
}

export default function AdminLinksPage() {
  const tags = listTagsWithCounts().map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    count: t.count,
  }));
  const links = toClient(listLinks({ limit: 1000 }));
  const token = getApiToken();

  return (
    <LinksAdminClient
      initialTags={tags}
      initialLinks={links}
      initialToken={token}
    />
  );
}
