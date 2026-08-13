"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  MagicWandIcon,
} from "@phosphor-icons/react";

import { TagChip } from "@/components/tag-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type SaveFormTag = { slug: string; name: string };

type Props = {
  initialUrl: string;
  initialTitle: string;
  initialNote: string;
  tags: SaveFormTag[];
};

// Kept as a literal rather than imported from lib/links-db, which pulls in the
// SQLite driver. app/admin/links/links-client.tsx does the same.
const PUBLIC_TAG_SLUG = "public";

const LABEL_CLASS =
  "text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400";

export function SaveForm({
  initialUrl,
  initialTitle,
  initialNote,
  tags,
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState(initialNote);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPublic, setIsPublic] = useState(false);

  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  function toggleTag(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);

    const tagSlugs = Array.from(selected);
    if (isPublic) tagSlugs.push(PUBLIC_TAG_SLUG);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          title: title.trim(),
          note: note.trim(),
          tags: tagSlugs,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        link?: { url?: string };
      };
      if (!res.ok) {
        setError(data.error ?? `Save failed (HTTP ${res.status}).`);
        return;
      }
      setSavedUrl(data.link?.url ?? trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onSummarize() {
    const trimmed = url.trim();
    if (!trimmed || summarizing) return;

    setSummarizing(true);
    setError(null);
    try {
      const res = await fetch("/api/links/summarize", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        summary?: string;
      };
      if (!res.ok || typeof data.summary !== "string") {
        setError(data.error ?? `Summarize failed (HTTP ${res.status}).`);
        return;
      }
      setNote(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarize failed.");
    } finally {
      setSummarizing(false);
    }
  }

  function reset() {
    setSavedUrl(null);
    setUrl("");
    setTitle("");
    setNote("");
    setSelected(new Set());
    setIsPublic(false);
  }

  if (savedUrl) {
    return (
      <section className="flex w-full max-w-xl flex-col gap-5 self-center rounded-2xl border border-foreground/10 bg-card/60 p-6 font-sans sm:p-7">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CheckCircleIcon weight="fill" className="size-5 text-[#16a34a]" />
          Saved.
        </p>
        <p className="text-sm leading-relaxed wrap-break-word text-zinc-600 dark:text-zinc-400">
          {title.trim() || savedUrl}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" variant="outline" onClick={reset}>
            Save another
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/links">
              Open links
              <ArrowSquareOutIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl flex-col gap-5 self-center rounded-2xl border border-foreground/10 bg-card/60 p-6 font-sans sm:p-7"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="save-url" className={LABEL_CLASS}>
          URL
        </Label>
        <Input
          id="save-url"
          name="url"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          className="h-11 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="save-title" className={LABEL_CLASS}>
          Title
        </Label>
        <Input
          id="save-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional"
          className="h-11 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="save-note" className={LABEL_CLASS}>
            Note
          </Label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onSummarize}
            disabled={summarizing || url.trim().length === 0}
          >
            <MagicWandIcon data-icon="inline-start" />
            {summarizing ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
        <Textarea
          id="save-note"
          name="note"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
          className="text-base"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <span className={LABEL_CLASS}>Tags</span>
        {tags.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No tags yet — create them on the{" "}
            <Link href="/admin/links" className="underline underline-offset-4">
              links admin
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip
                key={tag.slug}
                active={selected.has(tag.slug)}
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.name}
              </TagChip>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="size-4 accent-foreground"
        />
        Show on the public links page
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-[#F25022]/10 px-3 py-2 text-sm text-[#F25022]"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={saving || url.trim().length === 0}
        className="w-full"
      >
        {saving ? "Saving…" : "Save link"}
      </Button>
    </form>
  );
}
