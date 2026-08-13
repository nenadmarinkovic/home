import type { Metadata } from "next";

import { embedOrigins } from "@/lib/embeds";

import { PreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PreviewPage() {
  return <PreviewClient embedOrigins={embedOrigins()} />;
}
