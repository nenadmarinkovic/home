import type { Metadata } from "next";

import { getDueStats, listEntries } from "@/lib/lib-db";
import { LibClient } from "./lib-client";

export const metadata: Metadata = {
  title: "Lib · Admin",
  robots: { index: false, follow: false },
  manifest: "/lib.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Lib",
    statusBarStyle: "black-translucent",
  },
};

export const dynamic = "force-dynamic";

export default function LibPage() {
  const entries = listEntries({ limit: 500 });
  const stats = getDueStats();
  return <LibClient initialEntries={entries} initialStats={stats} />;
}
