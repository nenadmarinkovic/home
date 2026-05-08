import type { Metadata } from "next";

import { fetchDokploySnapshot, getDokployConfig } from "@/lib/dokploy";
import { LogClient } from "./log-client";

export const metadata: Metadata = {
  title: "Log · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLogPage() {
  const configured = getDokployConfig() !== null;
  const result = configured ? await fetchDokploySnapshot() : null;

  return (
    <LogClient
      configured={configured}
      initialSnapshot={result?.ok ? result.snapshot : null}
      initialError={result && !result.ok ? result.error : null}
    />
  );
}
