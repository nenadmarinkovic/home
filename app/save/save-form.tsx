"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

export function SaveForm({
  initialUrl,
  initialTitle,
  initialNote,
  tags,
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState(initialNote);
  const [selected, setSelected] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  const titleTouched = useRef(initialTitle.length > 0);

  useEffect(() => {
    if (titleTouched.current || !initialUrl) return;
    let cancelled = false;
    setFetchingTitle(true);
    fetch(`/api/links/title?url=${encodeURIComponent(initialUrl)}`, {
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((data: { title?: string }) => {
        if (cancelled || titleTouched.current) return;
        if (typeof data.title === "string" && data.title) setTitle(data.title);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetchingTitle(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialUrl]);

  function toggleTag(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          title: title.trim(),
          note: note.trim(),
          tags: selected,
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
    setSelected([]);
    titleTouched.current = true;
  }

  if (savedUrl) {
    return (
      <section className="flex w-full max-w-xl flex-col gap-5 self-center rounded-2xl border border-foreground/10 bg-card/60 p-6 font-sans sm:p-7">
        <p className="flex items-center gap-2 text-sm font-medium">
          <CheckCircleIcon weight="fill" className="size-5" />
          Saved
        </p>
        <p className="text-sm leading-relaxed wrap-break-word text-foreground/70">
          {title.trim() || savedUrl}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" onClick={reset}>
            Save another
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/links">
              All links
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="save-url">URL</Label>
        <Input
          id="save-url"
          name="url"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          disabled={saving}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          className="text-sm md:text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="save-title">Title</Label>
        <Input
          id="save-title"
          name="title"
          disabled={saving}
          value={title}
          onChange={(e) => {
            titleTouched.current = true;
            setTitle(e.target.value);
          }}
          placeholder={fetchingTitle ? "Reading the page…" : "Optional"}
          className="text-sm md:text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="save-note">Note</Label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onSummarize}
            disabled={summarizing || saving || url.trim().length === 0}
          >
            <MagicWandIcon data-icon="inline-start" />
            {summarizing ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
        <Textarea
          id="save-note"
          name="note"
          disabled={saving}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
          className="min-h-24 resize-y text-sm md:text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tags</Label>
        {tags.length === 0 ? (
          <p className="text-sm text-foreground/70">
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
                active={selected.includes(tag.slug)}
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.name}
              </TagChip>
            ))}
          </div>
        )}
      </div>

      {error && <p className="font-sans text-xs text-destructive">{error}</p>}

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
