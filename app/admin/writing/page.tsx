import type { Metadata } from "next";

import { getAdminSnapshot } from "@/lib/articles-db";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "Writing · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { published, drafts, exported } = getAdminSnapshot();
  return (
    <AdminClient
      published={published}
      drafts={drafts}
      exported={exported}
    />
  );
}
