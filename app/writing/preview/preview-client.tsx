"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ArticleNotice, PulseDot } from "@/components/article-notice";
import { ArticleView } from "@/components/article-view";
import { parsePreview, readPreview, subscribePreview } from "@/lib/preview";

type Rendered = { html: string; dateLabel: string };

export function PreviewClient({ embedOrigins }: { embedOrigins: string[] }) {
  const raw = useSyncExternalStore(subscribePreview, readPreview, () => null);
  const hydrated = useSyncExternalStore(
    subscribePreview,
    () => true,
    () => false,
  );
  const payload = useMemo(() => parsePreview(raw), [raw]);
  const [rendered, setRendered] = useState<Rendered | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: payload.body, date: payload.date }),
        });
        const data = (await res.json().catch(() => ({}))) as Partial<Rendered> & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || typeof data.html !== "string") {
          setError(data.error ?? `Preview failed (${res.status})`);
          return;
        }
        setError(null);
        setRendered({ html: data.html, dateLabel: data.dateLabel ?? "" });
        setRevision((n) => n + 1);
      } catch {
        if (!cancelled) setError("Preview failed — is the server running?");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (!payload) {
    return <Empty loaded={raw !== null || hydrated} />;
  }

  return (
    <ArticleView
      title={payload.title || "Untitled"}
      subtitle={payload.subtitle}
      dateLabel={rendered?.dateLabel ?? ""}
      html={rendered?.html ?? ""}
      embedOrigins={embedOrigins}
      revision={revision}
      banner={
        <ArticleNotice label="Preview" slug={payload.slug}>
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span
              className="flex items-center gap-1.5"
              title="Showing the editor's current state — not what's on the site"
            >
              <PulseDot key={revision} />
              {payload.draft === false ? "Unsaved" : "Draft"}
            </span>
          )}
          <Link
            href="/admin/writing"
            className="transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </ArticleNotice>
      }
    />
  );
}

function Empty({ loaded }: { loaded: boolean }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 py-32 text-center font-sans">
      {loaded && (
        <>
          <p className="text-base font-medium text-foreground">
            Nothing to preview
          </p>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-500">
            Open an article in the editor and hit Preview — this tab will fill
            in and follow along as you write.
          </p>
          <Link
            href="/admin/writing"
            className="mt-2 text-sm underline underline-offset-2"
          >
            Go to Writing
          </Link>
        </>
      )}
    </main>
  );
}
