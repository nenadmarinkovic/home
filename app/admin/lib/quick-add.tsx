"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpIcon } from "@phosphor-icons/react";

import { useToasts } from "@/components/toasts";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const MAX_HEIGHT_PX = 180; // matches max-h-44 area

export function QuickAdd({ className }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const { push, update } = useToasts();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea with the content, up to MAX_HEIGHT_PX.
  // Skip the resize when the textarea is empty so the CSS min-height owns
  // the initial render (otherwise the brief `height: auto` reset causes a
  // flicker on hydration before min-h reasserts). Toggle overflow so the
  // scrollbar only appears once we hit MAX, not transiently while growing.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!value) {
      el.style.height = "";
      el.style.overflowY = "hidden";
      return;
    }
    el.style.height = "auto";
    const target = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = target + "px";
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value]);

  async function submitLines(lines: string[]) {
    await Promise.allSettled(lines.map((line) => addOne(line)));
    router.refresh();
  }

  async function addOne(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const short = input.length > 36 ? input.slice(0, 33) + "…" : input;
    const id = push({ title: `Adding "${short}"`, message: "Generating…" });

    try {
      const enrichRes = await fetch("/api/lib/enrich", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term: input }),
      });
      const enrichData = (await enrichRes.json().catch(() => ({}))) as {
        ok?: boolean;
        entry?: Record<string, unknown> & {
          term?: string;
          translationSr?: string;
          pos?: string;
          gender?: string | null;
        };
        error?: string;
      };
      if (!enrichRes.ok || !enrichData.ok || !enrichData.entry) {
        update(id, {
          status: "error",
          title: `Couldn't enrich "${short}"`,
          message: enrichData.error ?? `HTTP ${enrichRes.status}`,
        });
        return;
      }
      const entry = enrichData.entry;
      const headword =
        typeof entry.term === "string" && entry.term ? entry.term : input;

      update(id, {
        title: `Saving ${headword}`,
        message: "Storing entry and queueing cards…",
      });

      const saveRes = await fetch("/api/lib/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...entry,
          source: "mistral",
          tags: typeof entry.tags === "string" ? entry.tags : "",
          notes: typeof entry.notes === "string" ? entry.notes : "",
          examples: Array.isArray(entry.examples) ? entry.examples : [],
          conjugations:
            entry.conjugations &&
            typeof entry.conjugations === "object" &&
            !Array.isArray(entry.conjugations)
              ? entry.conjugations
              : {},
        }),
      });
      const saveData = (await saveRes.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!saveRes.ok || !saveData.ok) {
        update(id, {
          status: "error",
          title: `Save failed: ${headword}`,
          message: saveData.error ?? `HTTP ${saveRes.status}`,
        });
        return;
      }

      const subtitle = [
        entry.pos === "noun" && entry.gender
          ? `${entry.gender} ${headword}`
          : headword,
        entry.translationSr,
      ]
        .filter(Boolean)
        .join(" · ");

      update(id, {
        status: "success",
        title: `Added ${headword}`,
        message: subtitle,
      });
    } catch (err) {
      update(id, {
        status: "error",
        title: `Failed "${short}"`,
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const lines = value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setValue("");
    setBusy(true);
    try {
      await submitLines(lines);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const canSend = !busy && value.trim().length > 0;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn(
        "group/quick relative w-full rounded-md border border-foreground/15 bg-field transition-[color,box-shadow,border-color]",
        "focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-foreground/10",
        className,
      )}
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Add a word, phrase, or whole sentence."
        className="block max-h-44 min-h-14 w-full resize-none overflow-y-hidden border-0 bg-transparent px-3 py-4 pr-10 text-sm leading-normal shadow-none focus-visible:border-transparent focus-visible:ring-0 md:min-h-9 md:py-1.5 md:leading-relaxed"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        type="submit"
        aria-label="Add"
        disabled={!canSend}
        className={cn(
          "absolute bottom-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors",
          canSend
            ? "bg-foreground text-background hover:bg-foreground/85"
            : "bg-foreground/10 text-zinc-400",
          "disabled:cursor-not-allowed",
        )}
      >
        <ArrowUpIcon weight="bold" className="size-3" />
      </button>
    </form>
  );
}
