import type { Metadata } from "next";

import { getArticles, getDraftArticles } from "../writing/articles";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <AdminClient published={getArticles()} drafts={getDraftArticles()} />
  );
}
